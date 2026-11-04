# AutoWise Market Comparables

This file is a schema for real market/listing observations used as a reference layer.
Do NOT fill it with invented prices. Add real observations collected manually or through a licensed/API source.

Required columns:
- source: OLX, CarDekho, Cars24, dealer, transaction, etc.
- listing_date: YYYY-MM-DD
- url: source listing URL if permitted
- city
- make, model, variant
- year, km, fuel, transmission, owners, condition, color
- listed_price_inr

AutoWise uses comparable listings only as a market-reference signal; it does not scrape OLX or CarDekho automatically.
