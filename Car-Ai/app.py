import os, uuid, math, json, tempfile
from pathlib import Path
from flask import Flask, request, jsonify, render_template, send_from_directory
from werkzeug.utils import secure_filename

from price_model import PriceEngine
from vision import DamageAnalyzer

BASE = Path(__file__).resolve().parent
UPLOAD_DIR = BASE / "uploads"
REPORT_DIR = BASE / "reports"
UPLOAD_DIR.mkdir(exist_ok=True)
REPORT_DIR.mkdir(exist_ok=True)

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 250 * 1024 * 1024

ALLOWED_IMAGES = {".jpg", ".jpeg", ".png", ".webp"}
ALLOWED_VIDEO = {".mp4", ".mov", ".avi", ".mkv", ".webm"}

price_engine = PriceEngine(BASE / "models" / "price_model.joblib", BASE / "data" / "market_comps_template.csv")
damage_analyzer = DamageAnalyzer(BASE / "models" / "car_damage.pt")

def money(v):
    return int(round(float(v or 0)))

def parse_vehicle(form):
    def i(name, default=0):
        try: return int(float(form.get(name, default)))
        except Exception: return default
    return {
        "make": form.get("make", "").strip(),
        "model": form.get("model", "").strip(),
        "variant": form.get("variant", "").strip(),
        "year": i("year", 2021),
        "km": i("km", 0),
        "transmission": form.get("transmission", "Manual"),
        "fuel": form.get("fuel", "Petrol"),
        "owners": i("owners", 1),
        "services": i("services", 0),
        "color": form.get("color", "White"),
        "condition": form.get("condition", "Good"),
        "city": form.get("city", "Sangli"),
        "listed_price": float(form.get("listed_price", 0) or 0),
        "original_price_inr": float(form.get("original_price_inr", 0) or 0),
    }

def save_upload(file):
    ext = Path(secure_filename(file.filename or "")).suffix.lower()
    if ext not in ALLOWED_IMAGES | ALLOWED_VIDEO:
        raise ValueError("Unsupported file type.")
    name = f"{uuid.uuid4().hex}{ext}"
    path = UPLOAD_DIR / name
    file.save(path)
    return path

@app.get("/")
def home():
    return render_template("index.html")

@app.post("/api/analyze")
def analyze():
    try:
        vehicle = parse_vehicle(request.form)
        if not vehicle["make"] or not vehicle["model"]:
            return jsonify(error="Make and model are required."), 400
        if not 1990 <= vehicle["year"] <= 2026:
            return jsonify(error="Enter a valid vehicle year."), 400
        if vehicle["km"] < 0:
            return jsonify(error="Kilometers cannot be negative."), 400
        if vehicle["km"] > 1000000:
            return jsonify(error="Kilometers above 10,00,000 are blocked as a likely odometer-entry error. Check whether you meant 1,25,000 or 12,500."), 400

        files = request.files.getlist("media")
        if not files:
            return jsonify(error="Upload at least one image or video."), 400

        media_paths = []
        for f in files:
            if f and f.filename:
                media_paths.append(save_upload(f))
        if not media_paths:
            return jsonify(error="No valid media was uploaded."), 400

        vision = damage_analyzer.analyze(media_paths)
        price = price_engine.predict(vehicle, vision["price_adjustment_pct"], vision.get("repair_estimate", 0))

        listed = vehicle["listed_price"]
        mismatch = None
        if listed > 0:
            diff = listed - price["estimated_price"]
            pct = (diff / price["estimated_price"]) * 100 if price["estimated_price"] else 0
            if pct > 10: status = "Overpriced"
            elif pct < -10: status = "Below market"
            else: status = "Fair market listing"
            mismatch = {
                "listed_price": money(listed),
                "market_price": money(price["estimated_price"]),
                "difference": money(diff),
                "difference_pct": round(pct, 1),
                "status": status,
            }

        report = {
            "vehicle": vehicle,
            "market": price,
            "vision": vision,
            "mismatch": mismatch,
            "currency": "INR",
            "note": "AI valuation is an estimate. AutoWise combines a trained model, a transparent depreciation baseline, real market comparables when supplied, and verified vision findings. It does not guarantee a sale price."
        }

        report_id = uuid.uuid4().hex
        (REPORT_DIR / f"{report_id}.json").write_text(json.dumps(report, indent=2), encoding="utf-8")
        report["report_id"] = report_id
        return jsonify(report)
    except Exception as e:
        app.logger.exception("analysis failed")
        return jsonify(error=str(e)), 500

@app.get("/api/report/<rid>")
def report(rid):
    p = REPORT_DIR / f"{secure_filename(rid)}.json"
    if not p.exists():
        return jsonify(error="Report not found."), 404
    return app.response_class(p.read_text(encoding="utf-8"), mimetype="application/json")

@app.get("/uploads/<path:name>")
def uploads(name):
    return send_from_directory(UPLOAD_DIR, secure_filename(name))

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
