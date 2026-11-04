# AutoWise training data

Use REAL historical/listing/transaction records. Do not invent target prices.

Target: market_price_inr

Recommended minimum fields:
make, model, variant, year, km, fuel, transmission, owners, services, color, condition, city, original_price_inr, market_price_inr

Better fields:
registration_month, engine_cc, mileage_kmpl, power_bhp, accident_history, insurance_valid, service_record, tyre_condition, city_tier, seller_type

For a strong final model, target at least 10,000+ clean observations and refresh the data regularly.
