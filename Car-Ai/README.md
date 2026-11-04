# AutoWise Outstanding v2

AutoWise is an Indian used-vehicle valuation prototype built around a **hybrid valuation architecture**:

1. **ML model** — CatBoost trained on real AutoWise-format Indian market observations.
2. **Formula baseline** — transparent depreciation + mileage + owners + service + transmission + condition + color adjustments.
3. **Market comparables** — optional real listing/transaction observations supplied in `data/market_comps_template.csv`.
4. **Damage vision** — optional custom YOLO model for verified dents, scratches, cracks, paint/bumper/glass/lamp damage from photos and sampled video frames.

## Important: no fake prices and no fake damage

The old prototype used random price/damage behaviour. v2 removes that. A missing damage model produces **no damage findings** rather than inventing boxes. A missing ML model falls back to the transparent formula/comparable layer and clearly labels the result.

## Training data

Use `data/vehicle_training_schema.csv` as the schema. The target is `market_price_inr`.

Recommended fields:

- make, model, variant
- year, registration_month
- km
- fuel, transmission
- owners, services
- color, condition, city
- original_price_inr
- market_price_inr (target)

For a strong final project, collect **10,000+ real observations** and refresh the data regularly. Do not invent target prices.

## Market-reference data

`data/market_comps_template.csv` supports real comparable observations. OLX and CarDekho are used only as **design/reference sources** for what sellers enter and what valuation factors matter. Do not scrape either site without permission or a permitted API/source. CarDekho's public valuation flow uses brand, model, variant, city, kilometres and ownership and says its algorithm also considers age, mileage, fuel, transmission, condition and other factors. OLX's selling flow asks sellers to provide car details, photos and an asking price. See the project report for citations.

## Train the price model

```bash
pip install -r requirements.txt
python train_price_model.py data/vehicle_training.csv
python app.py
```

The trained model is only accepted when its metadata contains `schema_version = 2`, so the old v1 model cannot silently contaminate the new valuation engine.

## Damage model

Place a custom YOLO model at:

`models/car_damage.pt`

The class names should match or resemble:

- dent
- scratch
- crack
- broken_lamp
- glass_damage
- paint_damage
- bumper_damage

Train it on a real annotated vehicle-damage dataset. Do not call the generic COCO object detector a scratch/dent detector.

## User workflow

```text
Vehicle details
      +
Original price / current listing price
      +
1–20 photos / camera / walk-around video
      ↓
Validation
      ↓
ML + formula + real market comparables
      ↓
Damage detection (if custom model is installed)
      ↓
Repair-cost / market adjustment
      ↓
₹ Market value + range + confidence/coverage + report
```

If no verified damage is found, AutoWise does **not** claim the car is damage-free. It prompts the user to upload a walk-around video for a more complete inspection.
