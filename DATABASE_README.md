# AutoWise — Database-Connected Marketplace

## What was upgraded

1. **Vehicle photos are mapped by vehicle/model name**
   - The supplied `Images.zip` photos were merged into `Images/`.
   - `js/images.js` now maps available photos to the matching vehicle records.
   - Vehicles without a photo automatically show a clean placeholder.

2. **Home-page search fixed**
   - Search now works while typing and with Enter.
   - It searches brand, model, city, fuel and year.
   - Exact/strong matches are ranked first.
   - When searching, the decorative Popular/More sections hide and the result section becomes the main marketplace result area.

3. **SQLite database added**
   - Database: `database/autowise.db`
   - Existing 68 catalogue vehicles are seeded into the database.
   - `users` — login/signup accounts
   - `seller_profiles` — seller contact data
   - `vehicles` — seller-created listings
   - `purchase_requests` — buyer Buy Now requests
   - `search_events` — search analytics

4. **Real database login**
   - Signup/login now uses Flask + SQLite.
   - Passwords are hashed on the server.
   - Login session is stored in a Flask session cookie.

5. **Seller data storage**
   - Sell page now requires login.
   - Seller details, vehicle information, asking price and photos are stored in SQLite.
   - New seller listings automatically appear in Home/Buy pages.

6. **Buy Now flow**
   - A buyer must be logged in.
   - Clicking **Buy Now** creates a purchase request in `purchase_requests`.
   - Duplicate pending requests are prevented.
   - A seller cannot buy their own listing.

7. **Recommendation algorithm**
   After a Buy Now request, AutoWise recommends up to 3 similar vehicles using:
   - same vehicle category
   - same brand
   - price similarity
   - year similarity
   - KM similarity
   - same fuel
   - clean damage record

## How to run

### Windows

Double-click:

`run_autowise.bat`

Or manually:

```text
cd AutoWise
py -m pip install -r requirements.txt
py server.py
```

Then open:

`http://127.0.0.1:8000`

**Do not open `index.html` directly with `file://`** when using the database features. The Flask server must serve the website.

### Car AI

The existing `Car-Ai` module is still separate and uses its own Flask server/port as before. The AutoWise homepage can continue to open the Car-Ai module.

## Database design

```text
users
  └── seller_profiles
  └── purchase_requests (buyer)

vehicles
  └── seller_id → users.id
  └── purchase_requests.vehicle_id

search_events
  └── user_id → users.id
```

The database is intentionally SQLite: it is free, local, easy to demonstrate in a diploma project, and requires no MySQL service to be running.
