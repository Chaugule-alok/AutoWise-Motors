from pathlib import Path
import math
import pandas as pd
import numpy as np

CURRENT_YEAR = 2026

class PriceEngine:
    """Hybrid AutoWise valuation engine.

    Priority:
      1. ML model trained on AutoWise schema
      2. Real market comparables (if supplied)
      3. Transparent formula baseline (requires original price)

    The formula is a baseline, not a claim of real market truth.
    """
    def __init__(self, model_path: Path, comps_path: Path | None = None):
        self.model_path = Path(model_path)
        self.comps_path = Path(comps_path) if comps_path else None
        self.model = None
        self.meta = {}
        self.comps = pd.DataFrame()
        if self.model_path.exists():
            try:
                import joblib
                payload = joblib.load(self.model_path)
                meta = payload.get("meta", {})
                if meta.get("schema_version") == 2:
                    self.model = payload["model"]
                    self.meta = meta
            except Exception as exc:
                print("Price model could not be loaded:", exc)
        if self.comps_path and self.comps_path.exists():
            try:
                self.comps = pd.read_csv(self.comps_path)
            except Exception as exc:
                print("Market comps could not be loaded:", exc)

    @staticmethod
    def _num(v, default=0.0):
        try:
            return float(v)
        except Exception:
            return float(default)

    @staticmethod
    def _owner_label(n):
        return {1:"First Owner",2:"Second Owner",3:"Third Owner"}.get(int(n), "Fourth & Above Owner")

    def _ml_row(self, v):
        schema = self.meta.get("feature_schema", [])
        defaults = self.meta.get("numeric_defaults", {})
        age = max(0, CURRENT_YEAR - int(v.get("year", CURRENT_YEAR)))
        owners = int(v.get("owners", 1))
        row = {
            "make": str(v.get("make", "Unknown")),
            "model": str(v.get("model", "Unknown")),
            "variant": str(v.get("variant", "Unknown")),
            "year": int(v.get("year", CURRENT_YEAR)),
            "km": self._num(v.get("km", 0)),
            "fuel": str(v.get("fuel", "Unknown")),
            "transmission": str(v.get("transmission", "Unknown")),
            "owners": owners,
            "services": self._num(v.get("services", 0)),
            "color": str(v.get("color", "Unknown")),
            "condition": str(v.get("condition", "Good")),
            "city": str(v.get("city", "Unknown")),
            "original_price_inr": self._num(v.get("original_price_inr", 0)),
            "age": age,
            "km_per_year": self._num(v.get("km", 0)) / max(age, 1),
        }
        out = {}
        for c in schema:
            out[c] = row.get(c, defaults.get(c, "Unknown"))
        return pd.DataFrame([out])

    def formula_baseline(self, v):
        original = self._num(v.get("original_price_inr", 0))
        if original <= 0:
            return None
        age = max(0, CURRENT_YEAR - int(v.get("year", CURRENT_YEAR)))
        # Conservative baseline depreciation anchor. Market data/ML should override it.
        schedule = [1.00, .80, .70, .60, .52, .45, .40, .36, .32, .28, .24]
        age_factor = schedule[min(age, len(schedule)-1)]
        value = original * age_factor

        km = self._num(v.get("km", 0))
        expected = 15000 * max(age, 1)
        km_ratio = (km - expected) / max(expected, 1)
        km_adj = max(-0.15, min(0.08, -km_ratio * 0.10))
        value *= 1 + km_adj

        owners = int(self._num(v.get("owners", 1), 1))
        value *= max(.84, 1 - max(0, owners - 1) * .04)

        services = max(0, int(self._num(v.get("services", 0))))
        value *= min(1.035, 1 + services * .005)

        if str(v.get("transmission", "")).lower() == "automatic":
            value *= 1.03

        condition = str(v.get("condition", "Good")).lower()
        value *= {"excellent":1.06, "good":1.0, "fair":.93, "poor":.84}.get(condition, 1.0)

        color = str(v.get("color", "")).lower()
        value *= {"white":1.01, "black":1.005, "grey":1.003, "silver":1.0}.get(color, .995)
        return max(25000, float(value))

    def comparable_market(self, v):
        if self.comps.empty or "listed_price_inr" not in self.comps.columns:
            return None
        d = self.comps.copy()
        for c in ["make","model","variant","city","fuel","transmission"]:
            if c in d: d[c] = d[c].fillna("").astype(str).str.lower().str.strip()
        if "year" in d: d["year"] = pd.to_numeric(d["year"], errors="coerce")
        if "km" in d: d["km"] = pd.to_numeric(d["km"], errors="coerce")
        d["listed_price_inr"] = pd.to_numeric(d["listed_price_inr"], errors="coerce")
        q = d[
            (d["make"] == str(v.get("make","")).lower().strip()) &
            (d["model"] == str(v.get("model","")).lower().strip())
        ].copy()
        if "variant" in q.columns and str(v.get("variant","")).strip():
            exact = q[q["variant"] == str(v.get("variant","")).lower().strip()]
            if len(exact) >= 2: q = exact
        if "year" in q:
            q = q[(q["year"] - int(v.get("year", CURRENT_YEAR))).abs() <= 2]
        if "km" in q:
            q = q[(q["km"] - self._num(v.get("km",0))).abs() <= max(50000, self._num(v.get("km",0))*.5)]
        q = q[q["listed_price_inr"] > 0]
        if len(q) < 2:
            return None
        prices = q["listed_price_inr"].dropna()
        if len(prices) < 2: return None
        return {
            "median": float(prices.median()),
            "low": float(prices.quantile(.25)),
            "high": float(prices.quantile(.75)),
            "count": int(len(prices)),
        }

    def predict(self, vehicle, damage_pct=0, damage_repair=0):
        candidates = []
        formula = self.formula_baseline(vehicle)
        if formula is not None: candidates.append(("formula", formula, .25))
        comps = self.comparable_market(vehicle)
        if comps: candidates.append(("market_comps", comps["median"], .20))

        ml_pred = None
        coverage_note = ""
        if self.model is not None:
            try:
                ml_pred = float(self.model.predict(self._ml_row(vehicle))[0])
                candidates.append(("ml", ml_pred, .55))
            except Exception as exc:
                coverage_note = f"ML prediction unavailable: {exc}"

        if not candidates:
            return {
                "estimated_price": 0, "range_low": 0, "range_high": 0,
                "reliability": 0, "model_name": "Insufficient valuation data",
                "source": "insufficient_data", "damage_adjustment_pct": 0,
                "damage_repair": 0,
                "coverage_note": "Provide original price or train AutoWise with real Indian-market records.",
                "explanation": []
            }

        total_w = sum(w for _, _, w in candidates)
        base = sum(value*w for _, value, w in candidates) / total_w
        before_damage = base
        final = max(25000, base * (1 + damage_pct/100))

        # Confidence is based on data coverage, not a random number.
        reliability = float(self.meta.get("reliability_score", 55)) if self.model else 55.0
        if comps: reliability += min(12, comps["count"] * 2)
        if formula is not None: reliability += 5
        if self.model is None: reliability -= 15
        if str(vehicle.get("variant", "")).strip() == "": reliability -= 8
        if int(vehicle.get("year", CURRENT_YEAR)) > int(self.meta.get("max_training_year", CURRENT_YEAR)) and self.model:
            reliability -= 15
            coverage_note = "Vehicle year is newer than the ML training data. Refresh the model with current listings/transactions."
        reliability = max(25, min(95, reliability))

        error = float(self.meta.get("absolute_error_q90", final*.12)) if self.model else final*.12
        if comps:
            spread = max(25000, comps["high"] - comps["low"])
            error = max(25000, min(error, spread*1.25))
        low = max(25000, final - error)
        high = final + error

        explanation = self._explain(vehicle, formula, ml_pred, comps, damage_pct)
        if damage_repair > 0:
            explanation.append({"feature":"Verified repair impact", "impact":f"-₹{damage_repair:,.0f} estimated repair cost / market adjustment", "direction":"negative"})

        return {
            "estimated_price": int(round(final/100)*100),
            "range_low": int(round(low/100)*100),
            "range_high": int(round(high/100)*100),
            "reliability": round(reliability,1),
            "model_name": self.meta.get("model_name", "Hybrid AutoWise Valuation") if self.model else "Formula + Market Comparables",
            "source": "+".join(x[0] for x in candidates),
            "damage_adjustment_pct": round(damage_pct,2),
            "damage_repair": int(damage_repair),
            "formula_baseline": int(round(formula)) if formula else None,
            "ml_prediction": int(round(ml_pred)) if ml_pred else None,
            "market_comparable": int(round(comps["median"])) if comps else None,
            "comparable_count": comps["count"] if comps else 0,
            "coverage_note": coverage_note,
            "explanation": explanation,
        }

    def _explain(self, v, formula, ml_pred, comps, damage_pct):
        items=[]
        age=CURRENT_YEAR-int(v.get("year",CURRENT_YEAR))
        km=self._num(v.get("km",0))
        if age<=3: items.append({"feature":"Vehicle age","impact":"Newer age supports resale value","direction":"positive"})
        elif age>=7: items.append({"feature":"Vehicle age","impact":"Age creates depreciation","direction":"negative"})
        if km<=50000: items.append({"feature":"Mileage","impact":"Low running supports value","direction":"positive"})
        elif km>=100000: items.append({"feature":"Mileage","impact":"High running reduces value","direction":"negative"})
        if int(v.get("owners",1))==1: items.append({"feature":"Ownership","impact":"1st owner supports resale demand","direction":"positive"})
        elif int(v.get("owners",1))>=3: items.append({"feature":"Ownership","impact":"Multiple owners reduce resale appeal","direction":"negative"})
        if str(v.get("transmission","")).lower()=="automatic": items.append({"feature":"Transmission","impact":"Automatic can support demand for this segment","direction":"positive"})
        if int(v.get("services",0))>=3: items.append({"feature":"Service history","impact":"Documented servicing supports condition confidence","direction":"positive"})
        if str(v.get("condition","")).lower()=="poor": items.append({"feature":"Condition","impact":"Poor condition reduces value","direction":"negative"})
        if damage_pct<0: items.append({"feature":"Verified damage","impact":f"Damage adjustment {damage_pct:.1f}%","direction":"negative"})
        if comps: items.append({"feature":"Market comparables","impact":f"{comps['count']} similar real listings used as a reference","direction":"positive"})
        return items
