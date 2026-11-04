import json
import sqlite3
import uuid
from pathlib import Path
from datetime import datetime, timezone
from functools import wraps

from flask import Flask, jsonify, request, session, send_from_directory, send_file
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename

BASE = Path(__file__).resolve().parent
DB_DIR = BASE / "database"
DB_DIR.mkdir(exist_ok=True)
DB_PATH = DB_DIR / "autowise.db"
UPLOAD_DIR = BASE / "uploads" / "listings"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

app = Flask(__name__, static_folder=".", static_url_path="")
app.secret_key = "autowise-development-secret-change-me"
app.config["MAX_CONTENT_LENGTH"] = 50 * 1024 * 1024

ALLOWED_IMAGE_EXT = {".jpg", ".jpeg", ".png", ".webp", ".avif"}


def now():
    return datetime.now(timezone.utc).isoformat()


def db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = db()
    conn.executescript("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        username TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        mobile TEXT,
        created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS vehicles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        catalog_id TEXT UNIQUE,
        seller_id INTEGER,
        brand TEXT NOT NULL,
        model TEXT NOT NULL,
        category TEXT NOT NULL,
        year INTEGER NOT NULL,
        price REAL NOT NULL,
        km INTEGER NOT NULL DEFAULT 0,
        fuel TEXT NOT NULL DEFAULT 'Petrol',
        trans TEXT NOT NULL DEFAULT 'Manual',
        owner TEXT NOT NULL DEFAULT '1st',
        city TEXT NOT NULL DEFAULT 'Sangli',
        damage_json TEXT NOT NULL DEFAULT '[]',
        services INTEGER NOT NULL DEFAULT 0,
        accidents INTEGER NOT NULL DEFAULT 0,
        future3 REAL NOT NULL DEFAULT 0,
        price_mismatch TEXT NOT NULL DEFAULT 'green',
        image_url TEXT,
        status TEXT NOT NULL DEFAULT 'active',
        created_at TEXT NOT NULL,
        FOREIGN KEY (seller_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS seller_profiles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL UNIQUE,
        full_name TEXT NOT NULL,
        mobile TEXT NOT NULL,
        email TEXT NOT NULL,
        address TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS purchase_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        vehicle_id INTEGER NOT NULL,
        buyer_id INTEGER NOT NULL,
        seller_id INTEGER,
        status TEXT NOT NULL DEFAULT 'pending',
        message TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (vehicle_id) REFERENCES vehicles(id),
        FOREIGN KEY (buyer_id) REFERENCES users(id),
        FOREIGN KEY (seller_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS search_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        query TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id)
    );
    """)
    seed_path = DB_DIR / "seed_vehicles.json"
    count = conn.execute("SELECT COUNT(*) FROM vehicles WHERE catalog_id IS NOT NULL").fetchone()[0]
    if count == 0 and seed_path.exists():
        seed = json.loads(seed_path.read_text(encoding="utf-8"))
        for v in seed:
            conn.execute("""
                INSERT OR IGNORE INTO vehicles
                (catalog_id, brand, model, category, year, price, km, fuel, trans, owner,
                 city, damage_json, services, accidents, future3, price_mismatch, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                v["id"], v["brand"], v["model"], v["category"], v["year"], v["price"],
                v["km"], v["fuel"], v["trans"], v["owner"], v["city"], json.dumps(v["damage"]),
                v["services"], v["accidents"], v["future3"], v["priceMismatch"], now()
            ))
        conn.commit()
    conn.close()


def current_user():
    uid = session.get("user_id")
    if not uid:
        return None
    conn = db()
    row = conn.execute(
        "SELECT id,name,email,username,mobile,created_at FROM users WHERE id=?",
        (uid,)
    ).fetchone()
    conn.close()
    return dict(row) if row else None


def login_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        user = current_user()
        if not user:
            return jsonify(error="Login required.", code="LOGIN_REQUIRED"), 401
        return fn(user, *args, **kwargs)
    return wrapper


def vehicle_dict(row):
    d = dict(row)
    d["damage"] = json.loads(d.pop("damage_json") or "[]")
    d["priceMismatch"] = d.pop("price_mismatch")
    d["catalogId"] = d.pop("catalog_id")
    d["sellerId"] = d.pop("seller_id")
    d["image"] = d.pop("image_url")
    return d


def seed_image_for(catalog_id):
    # Existing manual image mapping remains the source of truth for catalog cards.
    return None


@app.get("/")
def home():
    return send_file(BASE / "index.html")


@app.get("/<path:filename>")
def static_pages(filename):
    target = BASE / filename
    if target.is_file():
        return send_file(target)
    return jsonify(error="Page not found."), 404


@app.get("/uploads/listings/<path:name>")
def listing_upload(name):
    return send_from_directory(UPLOAD_DIR, secure_filename(name))


@app.get("/api/auth/me")
def auth_me():
    user = current_user()
    return jsonify(user=user)


@app.post("/api/auth/signup")
def signup():
    data = request.get_json(silent=True) or {}
    name = str(data.get("name", "")).strip()
    email = str(data.get("email", "")).strip().lower()
    username = str(data.get("username", "")).strip().lower()
    password = str(data.get("password", ""))
    if not name or not email or not username or not password:
        return jsonify(error="Please fill in every field."), 400
    if len(password) < 6:
        return jsonify(error="Password must be at least 6 characters."), 400
    conn = db()
    try:
        cur = conn.execute("""
            INSERT INTO users(name,email,username,password_hash,created_at)
            VALUES(?,?,?,?,?)
        """, (name, email, username, generate_password_hash(password), now()))
        conn.commit()
        uid = cur.lastrowid
    except sqlite3.IntegrityError:
        conn.close()
        return jsonify(error="Email or username is already registered."), 409
    conn.close()
    return jsonify(ok=True, message="Account created. You can sign in now.", user_id=uid)


@app.post("/api/auth/login")
def login():
    data = request.get_json(silent=True) or {}
    identifier = str(data.get("identifier", "")).strip().lower()
    password = str(data.get("password", ""))
    conn = db()
    row = conn.execute(
        "SELECT * FROM users WHERE lower(email)=? OR lower(username)=?",
        (identifier, identifier)
    ).fetchone()
    conn.close()
    if not row or not check_password_hash(row["password_hash"], password):
        return jsonify(error="Invalid email/username or password."), 401
    session.clear()
    session["user_id"] = row["id"]
    return jsonify(ok=True, message=f"Welcome back, {row['name']}!", user={
        "id": row["id"], "name": row["name"], "email": row["email"],
        "username": row["username"], "mobile": row["mobile"]
    })


@app.post("/api/auth/logout")
def logout():
    session.clear()
    return jsonify(ok=True)


@app.get("/api/vehicles")
def vehicles():
    # Catalog vehicles are already in js/data.js. This endpoint supplies seller-created
    # listings so the marketplace becomes database-backed without breaking the existing UI.
    conn = db()
    rows = conn.execute("""
        SELECT id, catalog_id, seller_id, brand, model, category, year, price, km, fuel,
               trans, owner, city, damage_json, services, accidents, future3,
               price_mismatch, image_url, status
        FROM vehicles
        WHERE catalog_id IS NULL AND status='active'
        ORDER BY created_at DESC
    """).fetchall()
    conn.close()
    return jsonify(vehicles=[vehicle_dict(r) for r in rows])


@app.get("/api/search")
def search():
    q = str(request.args.get("q", "")).strip().lower()
    if len(q) < 1:
        return jsonify(vehicles=[])
    conn = db()
    rows = conn.execute("""
        SELECT id, catalog_id, seller_id, brand, model, category, year, price, km, fuel,
               trans, owner, city, damage_json, services, accidents, future3,
               price_mismatch, image_url, status
        FROM vehicles
        WHERE status='active'
          AND (lower(brand) LIKE ? OR lower(model) LIKE ? OR lower(city) LIKE ?
               OR lower(fuel) LIKE ? OR lower(category) LIKE ?)
        ORDER BY CASE
            WHEN lower(brand || ' ' || model) = ? THEN 0
            WHEN lower(model) LIKE ? THEN 1
            ELSE 2 END, price ASC
        LIMIT 50
    """, (f"%{q}%", f"%{q}%", f"%{q}%", f"%{q}%", f"%{q}%",
          q, f"%{q}%")).fetchall()
    user = current_user()
    conn.execute("INSERT INTO search_events(user_id,query,created_at) VALUES(?,?,?)",
                 (user["id"] if user else None, q, now()))
    conn.commit()
    conn.close()
    return jsonify(vehicles=[vehicle_dict(r) for r in rows])


@app.post("/api/seller/listings")
@login_required
def create_listing(user):
    form = request.form
    brand = str(form.get("brand", "")).strip()
    model = str(form.get("model", "")).strip()
    year = int(float(form.get("year", 0) or 0))
    km = int(float(form.get("km", 0) or 0))
    price = float(form.get("price", 0) or 0)
    category = str(form.get("category", "car")).lower()
    fuel = str(form.get("fuel", "Petrol"))
    trans = str(form.get("trans", "Manual"))
    city = str(form.get("city", "Sangli")).strip()
    reg = str(form.get("regNumber", "")).strip()
    mobile = str(form.get("mobile", "")).strip()
    address = str(form.get("address", "")).strip()
    full_name = str(form.get("fullName", user["name"])).strip()
    email = str(form.get("email", user["email"])).strip().lower()

    if not brand or not model or not year or price <= 0 or not mobile or not address:
        return jsonify(error="Brand, model, year, price, mobile and address are required."), 400
    if year < 1985 or year > 2026:
        return jsonify(error="Enter a valid vehicle year."), 400
    if km < 0 or price < 10000:
        return jsonify(error="Check the kilometers and asking price."), 400

    conn = db()
    conn.execute("""
        INSERT OR REPLACE INTO seller_profiles(user_id,full_name,mobile,email,address,created_at)
        VALUES(?,?,?,?,?,?)
    """, (user["id"], full_name, mobile, email, address, now()))
    catalog_id = None
    vehicle_uuid = uuid.uuid4().hex[:10]
    cur = conn.execute("""
        INSERT INTO vehicles
        (catalog_id,seller_id,brand,model,category,year,price,km,fuel,trans,owner,city,
         damage_json,services,accidents,future3,price_mismatch,image_url,status,created_at)
        VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    """, (catalog_id, user["id"], brand, model, category, year, price, km, fuel, trans,
          "1st", city, "[]", 0, 0, round(price * 0.70), "green", None, "active", now()))
    vehicle_db_id = cur.lastrowid

    files = request.files.getlist("images")
    saved = []
    for f in files[:12]:
        if not f or not f.filename:
            continue
        ext = Path(secure_filename(f.filename)).suffix.lower()
        if ext not in ALLOWED_IMAGE_EXT:
            continue
        name = f"{vehicle_uuid}_{len(saved)+1}{ext}"
        f.save(UPLOAD_DIR / name)
        saved.append(f"/uploads/listings/{name}")
    image_url = saved[0] if saved else None
    conn.execute("UPDATE vehicles SET image_url=? WHERE id=?", (image_url, vehicle_db_id))
    conn.commit()
    row = conn.execute("SELECT * FROM vehicles WHERE id=?", (vehicle_db_id,)).fetchone()
    conn.close()

    return jsonify(ok=True, message="Your vehicle is now stored in the AutoWise seller database.",
                   listing=vehicle_dict(row), registration=reg, photos=saved)


@app.post("/api/purchases")
@login_required
def purchase(user):
    data = request.get_json(silent=True) or {}
    vehicle_ref = data.get("vehicle_id")
    conn = db()
    try:
        vehicle_id = int(vehicle_ref)
        vehicle = conn.execute("SELECT * FROM vehicles WHERE id=? AND status='active'", (vehicle_id,)).fetchone()
    except Exception:
        vehicle = conn.execute("SELECT * FROM vehicles WHERE catalog_id=? AND status='active'",
                               (str(vehicle_ref),)).fetchone()
        vehicle_id = vehicle["id"] if vehicle else None
    if not vehicle_id:
        conn.close()
        return jsonify(error="Invalid vehicle."), 400
    if not vehicle:
        conn.close()
        return jsonify(error="Vehicle is no longer available."), 404
    if vehicle["seller_id"] == user["id"]:
        conn.close()
        return jsonify(error="You cannot buy your own listing."), 400

    existing = conn.execute("""
        SELECT id,status FROM purchase_requests
        WHERE vehicle_id=? AND buyer_id=? AND status IN ('pending','contacted')
        ORDER BY id DESC LIMIT 1
    """, (vehicle_id, user["id"])).fetchone()
    if existing:
        conn.close()
        return jsonify(ok=True, existing=True, request_id=existing["id"],
                       message="You already sent a request for this vehicle.")

    cur = conn.execute("""
        INSERT INTO purchase_requests(vehicle_id,buyer_id,seller_id,status,message,created_at)
        VALUES(?,?,?,?,?,?)
    """, (vehicle_id, user["id"], vehicle["seller_id"], "pending",
          "Buyer clicked Buy Now from the AutoWise vehicle page.", now()))
    conn.commit()
    request_id = cur.lastrowid

    # Recommendation algorithm: same category/brand/fuel + nearby price/year/km.
    all_rows = conn.execute("""
        SELECT * FROM vehicles WHERE status='active' AND id<>?
    """, (vehicle_id,)).fetchall()
    target = dict(vehicle)
    scored = []
    for r in all_rows:
        score = 0
        if r["category"] == target["category"]: score += 35
        if r["brand"].lower() == target["brand"].lower(): score += 20
        if target["price"] and abs(r["price"]-target["price"])/target["price"] <= .25: score += 18
        if abs(r["year"]-target["year"]) <= 3: score += 10
        if target["km"] and abs(r["km"]-target["km"])/(target["km"]+1) <= .35: score += 8
        if r["fuel"] == target["fuel"]: score += 6
        if not json.loads(r["damage_json"] or "[]"): score += 3
        scored.append((score, r))
    scored.sort(key=lambda x: (-x[0], abs(x[1]["price"]-target["price"])))
    recommendations = [vehicle_dict(r) | {"score": score} for score, r in scored[:3]]
    conn.close()

    return jsonify(ok=True, request_id=request_id,
                   message="Buy request recorded. The seller can now be contacted.",
                   recommendations=recommendations)


@app.get("/api/my/purchases")
@login_required
def my_purchases(user):
    conn = db()
    rows = conn.execute("""
        SELECT p.id,p.status,p.created_at,v.brand,v.model,v.price,v.city
        FROM purchase_requests p JOIN vehicles v ON v.id=p.vehicle_id
        WHERE p.buyer_id=? ORDER BY p.id DESC
    """, (user["id"],)).fetchall()
    conn.close()
    return jsonify(purchases=[dict(r) for r in rows])


@app.get("/api/my/listings")
@login_required
def my_listings(user):
    conn = db()
    rows = conn.execute("""
        SELECT * FROM vehicles WHERE seller_id=? ORDER BY id DESC
    """, (user["id"],)).fetchall()
    conn.close()
    return jsonify(listings=[vehicle_dict(r) for r in rows])


@app.get("/api/my/seller-requests")
@login_required
def seller_requests(user):
    conn = db()
    rows = conn.execute("""
        SELECT p.id,p.status,p.created_at,
               v.brand,v.model,v.price,
               u.name AS buyer_name,u.email AS buyer_email,u.mobile AS buyer_mobile
        FROM purchase_requests p
        JOIN vehicles v ON v.id=p.vehicle_id
        JOIN users u ON u.id=p.buyer_id
        WHERE p.seller_id=? ORDER BY p.id DESC
    """, (user["id"],)).fetchall()
    conn.close()
    return jsonify(requests=[dict(r) for r in rows])


if __name__ == "__main__":
    init_db()
    print(f"AutoWise running at http://127.0.0.1:8000")
    print(f"SQLite database: {DB_PATH}")
    app.run(host="127.0.0.1", port=8000, debug=False)
