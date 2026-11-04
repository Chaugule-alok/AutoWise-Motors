// data.js – single source of truth for every vehicle on the site.
// Photos are NOT stored here: see js/images.js to attach your own photos.

const vehicleData = {
    car: [
        { id: 'c1', brand: 'Maruti Suzuki', model: 'Swift', year: 2020, price: 550000, km: 35000, fuel: 'Petrol', trans: 'Manual', owner: '1st', city: 'Mumbai', damage: ['Scratch (rear bumper)'], services: 4, accidents: 0, future3: 410000, priceMismatch: 'green' },
        { id: 'c2', brand: 'Hyundai', model: 'i20', year: 2021, price: 620000, km: 28000, fuel: 'Petrol', trans: 'Automatic', owner: '1st', city: 'Pune', damage: ['Dent (door)'], services: 3, accidents: 1, future3: 455000, priceMismatch: 'green' },
        { id: 'c3', brand: 'Tata', model: 'Nexon', year: 2022, price: 850000, km: 15000, fuel: 'Diesel', trans: 'Manual', owner: '1st', city: 'Delhi', damage: [], services: 2, accidents: 0, future3: 620000, priceMismatch: 'green' },
        { id: 'c4', brand: 'Mahindra', model: 'XUV700', year: 2021, price: 1400000, km: 20000, fuel: 'Diesel', trans: 'Automatic', owner: '1st', city: 'Bangalore', damage: ['Scratch (front)'], services: 3, accidents: 0, future3: 1020000, priceMismatch: 'yellow' },
        { id: 'c5', brand: 'Honda', model: 'City', year: 2019, price: 720000, km: 45000, fuel: 'Petrol', trans: 'CVT', owner: '2nd', city: 'Chennai', damage: ['Dent (hood)'], services: 5, accidents: 1, future3: 490000, priceMismatch: 'green' },
        { id: 'c6', brand: 'Toyota', model: 'Glanza', year: 2020, price: 680000, km: 30000, fuel: 'Petrol', trans: 'Manual', owner: '1st', city: 'Hyderabad', damage: [], services: 3, accidents: 0, future3: 505000, priceMismatch: 'green' },
        { id: 'c7', brand: 'Volkswagen', model: 'Polo', year: 2018, price: 500000, km: 50000, fuel: 'Petrol', trans: 'Manual', owner: '2nd', city: 'Mumbai', damage: ['Scratch (left side)'], services: 6, accidents: 2, future3: 320000, priceMismatch: 'yellow' },
        { id: 'c8', brand: 'Skoda', model: 'Rapid', year: 2019, price: 650000, km: 40000, fuel: 'Diesel', trans: 'Manual', owner: '1st', city: 'Pune', damage: ['Dent (rear)'], services: 4, accidents: 1, future3: 440000, priceMismatch: 'green' },
        { id: 'c9', brand: 'Ford', model: 'EcoSport', year: 2020, price: 780000, km: 32000, fuel: 'Diesel', trans: 'Automatic', owner: '1st', city: 'Delhi', damage: [], services: 3, accidents: 0, future3: 570000, priceMismatch: 'green' },
        { id: 'c10', brand: 'Nissan', model: 'Magnite', year: 2021, price: 600000, km: 18000, fuel: 'Petrol', trans: 'Manual', owner: '1st', city: 'Bangalore', damage: ['Scratch (bumper)'], services: 2, accidents: 0, future3: 445000, priceMismatch: 'green' },
        { id: 'c11', brand: 'MG', model: 'Hector', year: 2022, price: 1500000, km: 12000, fuel: 'Petrol', trans: 'Automatic', owner: '1st', city: 'Chennai', damage: [], services: 2, accidents: 0, future3: 1120000, priceMismatch: 'yellow' },
        { id: 'c12', brand: 'Kia', model: 'Seltos', year: 2021, price: 1100000, km: 22000, fuel: 'Diesel', trans: 'DCT', owner: '1st', city: 'Hyderabad', damage: ['Dent (door)'], services: 3, accidents: 1, future3: 780000, priceMismatch: 'green' },
        { id: 'c13', brand: 'Renault', model: 'Kiger', year: 2022, price: 580000, km: 10000, fuel: 'Petrol', trans: 'Manual', owner: '1st', city: 'Mumbai', damage: [], services: 1, accidents: 0, future3: 435000, priceMismatch: 'green' },
        { id: 'c14', brand: 'Hyundai', model: 'Creta', year: 2020, price: 950000, km: 35000, fuel: 'Diesel', trans: 'Automatic', owner: '2nd', city: 'Pune', damage: ['Scratch (rear)'], services: 4, accidents: 1, future3: 670000, priceMismatch: 'green' },
        { id: 'c15', brand: 'Maruti Suzuki', model: 'Baleno', year: 2021, price: 520000, km: 25000, fuel: 'Petrol', trans: 'CVT', owner: '1st', city: 'Delhi', damage: [], services: 3, accidents: 0, future3: 390000, priceMismatch: 'green' },
        { id: 'c16', brand: 'Toyota', model: 'Innova Crysta', year: 2019, price: 1800000, km: 60000, fuel: 'Diesel', trans: 'Manual', owner: '2nd', city: 'Bangalore', damage: ['Dent (side)'], services: 7, accidents: 2, future3: 1150000, priceMismatch: 'red' },
        { id: 'c17', brand: 'Hyundai', model: 'Verna', year: 2020, price: 820000, km: 30000, fuel: 'Petrol', trans: 'Manual', owner: '1st', city: 'Pune', damage: ['Minor scratch'], services: 4, accidents: 1, future3: 580000, priceMismatch: 'yellow' },
        { id: 'c18', brand: 'Tata', model: 'Harrier', year: 2022, price: 1320000, km: 12000, fuel: 'Diesel', trans: 'Automatic', owner: '1st', city: 'Mumbai', damage: [], services: 2, accidents: 0, future3: 980000, priceMismatch: 'green' },
        { id: 'c19', brand: 'Maruti Suzuki', model: 'Brezza', year: 2021, price: 930000, km: 18000, fuel: 'Petrol', trans: 'Manual', owner: '1st', city: 'Aurangabad', damage: [], services: 2, accidents: 0, future3: 700000, priceMismatch: 'green' },
        { id: 'c20', brand: 'Kia', model: 'Sonet', year: 2022, price: 980000, km: 16000, fuel: 'Petrol', trans: 'Automatic', owner: '1st', city: 'Nashik', damage: ['Scratch (door)'], services: 1, accidents: 0, future3: 740000, priceMismatch: 'green' }
    ],

    bike: [
        { id: 'b1', brand: 'Royal Enfield', model: 'Classic 350', year: 2021, price: 180000, km: 12000, fuel: 'Petrol', trans: 'Manual', owner: '1st', city: 'Mumbai', damage: ['Scratch (tank)'], services: 3, accidents: 0, future3: 125000, priceMismatch: 'green' },
        { id: 'b2', brand: 'Honda', model: 'CB350', year: 2020, price: 160000, km: 15000, fuel: 'Petrol', trans: 'Manual', owner: '1st', city: 'Pune', damage: [], services: 4, accidents: 0, future3: 110000, priceMismatch: 'green' },
        { id: 'b3', brand: 'Bajaj', model: 'Pulsar NS200', year: 2022, price: 140000, km: 8000, fuel: 'Petrol', trans: 'Manual', owner: '1st', city: 'Delhi', damage: ['Dent (exhaust)'], services: 2, accidents: 1, future3: 95000, priceMismatch: 'green' },
        { id: 'b4', brand: 'TVS', model: 'Apache RTR 200', year: 2021, price: 130000, km: 10000, fuel: 'Petrol', trans: 'Manual', owner: '1st', city: 'Chennai', damage: ['Scratch (side)'], services: 3, accidents: 0, future3: 90000, priceMismatch: 'green' },
        { id: 'b5', brand: 'KTM', model: 'Duke 390', year: 2020, price: 250000, km: 9000, fuel: 'Petrol', trans: 'Manual', owner: '1st', city: 'Bangalore', damage: [], services: 3, accidents: 0, future3: 175000, priceMismatch: 'yellow' },
        { id: 'b6', brand: 'Yamaha', model: 'R15 V4', year: 2022, price: 170000, km: 5000, fuel: 'Petrol', trans: 'Manual', owner: '1st', city: 'Hyderabad', damage: ['Dent (tank)'], services: 1, accidents: 0, future3: 125000, priceMismatch: 'green' },
        { id: 'b7', brand: 'Suzuki', model: 'Gixxer SF', year: 2020, price: 150000, km: 14000, fuel: 'Petrol', trans: 'Manual', owner: '2nd', city: 'Mumbai', damage: ['Scratch (fairing)'], services: 5, accidents: 1, future3: 98000, priceMismatch: 'green' },
        { id: 'b8', brand: 'Ducati', model: 'Scrambler', year: 2019, price: 600000, km: 7000, fuel: 'Petrol', trans: 'Manual', owner: '1st', city: 'Pune', damage: [], services: 2, accidents: 0, future3: 420000, priceMismatch: 'yellow' },
        { id: 'b9', brand: 'Harley-Davidson', model: 'Iron 883', year: 2018, price: 850000, km: 5000, fuel: 'Petrol', trans: 'Manual', owner: '1st', city: 'Delhi', damage: ['Dent (fender)'], services: 3, accidents: 0, future3: 560000, priceMismatch: 'red' },
        { id: 'b10', brand: 'Triumph', model: 'Street Triple', year: 2021, price: 900000, km: 3000, fuel: 'Petrol', trans: 'Manual', owner: '1st', city: 'Bangalore', damage: [], services: 1, accidents: 0, future3: 660000, priceMismatch: 'yellow' },
        { id: 'b11', brand: 'BMW', model: 'G 310 R', year: 2020, price: 280000, km: 6000, fuel: 'Petrol', trans: 'Manual', owner: '1st', city: 'Chennai', damage: ['Scratch (handlebar)'], services: 2, accidents: 1, future3: 190000, priceMismatch: 'green' },
        { id: 'b12', brand: 'Hero', model: 'Xpulse 200', year: 2022, price: 120000, km: 4000, fuel: 'Petrol', trans: 'Manual', owner: '1st', city: 'Hyderabad', damage: [], services: 1, accidents: 0, future3: 88000, priceMismatch: 'green' },
        { id: 'b13', brand: 'Mahindra', model: 'Mojo', year: 2019, price: 130000, km: 18000, fuel: 'Petrol', trans: 'Manual', owner: '2nd', city: 'Mumbai', damage: ['Dent (side)'], services: 6, accidents: 2, future3: 78000, priceMismatch: 'yellow' },
        { id: 'b14', brand: 'Benelli', model: 'Imperiale 400', year: 2021, price: 200000, km: 5000, fuel: 'Petrol', trans: 'Manual', owner: '1st', city: 'Pune', damage: [], services: 2, accidents: 0, future3: 145000, priceMismatch: 'green' },
        { id: 'b15', brand: 'Kawasaki', model: 'Ninja 300', year: 2020, price: 350000, km: 8000, fuel: 'Petrol', trans: 'Manual', owner: '1st', city: 'Delhi', damage: ['Scratch (cowl)'], services: 3, accidents: 0, future3: 245000, priceMismatch: 'green' },
        { id: 'b16', brand: 'Aprilia', model: 'RS 457', year: 2023, price: 400000, km: 2000, fuel: 'Petrol', trans: 'Manual', owner: '1st', city: 'Bangalore', damage: [], services: 0, accidents: 0, future3: 310000, priceMismatch: 'green' },
        { id: 'b17', brand: 'Royal Enfield', model: 'Himalayan 450', year: 2023, price: 285000, km: 4000, fuel: 'Petrol', trans: 'Manual', owner: '1st', city: 'Jaipur', damage: [], services: 1, accidents: 0, future3: 215000, priceMismatch: 'green' },
        { id: 'b18', brand: 'Bajaj', model: 'Dominar 400', year: 2021, price: 195000, km: 11000, fuel: 'Petrol', trans: 'Manual', owner: '1st', city: 'Indore', damage: ['Scratch (tank)'], services: 3, accidents: 0, future3: 140000, priceMismatch: 'green' },
        { id: 'b19', brand: 'Yamaha', model: 'MT-15', year: 2022, price: 155000, km: 6000, fuel: 'Petrol', trans: 'Manual', owner: '1st', city: 'Kolkata', damage: [], services: 1, accidents: 0, future3: 118000, priceMismatch: 'green' },
        { id: 'b20', brand: 'Honda', model: 'Activa 6G', year: 2022, price: 72000, km: 7000, fuel: 'Petrol', trans: 'Automatic', owner: '1st', city: 'Nagpur', damage: [], services: 2, accidents: 0, future3: 54000, priceMismatch: 'green' },
        { id: 'b21', brand: 'TVS', model: 'Ronin 225', year: 2023, price: 148000, km: 3000, fuel: 'Petrol', trans: 'Manual', owner: '1st', city: 'Surat', damage: [], services: 1, accidents: 0, future3: 112000, priceMismatch: 'green' },
        { id: 'b22', brand: 'KTM', model: 'RC 200', year: 2021, price: 185000, km: 9000, fuel: 'Petrol', trans: 'Manual', owner: '2nd', city: 'Lucknow', damage: ['Scratch (fairing)'], services: 4, accidents: 1, future3: 128000, priceMismatch: 'yellow' },
        { id: 'b23', brand: 'Jawa', model: 'Perak', year: 2021, price: 210000, km: 8500, fuel: 'Petrol', trans: 'Manual', owner: '1st', city: 'Bhopal', damage: [], services: 2, accidents: 0, future3: 152000, priceMismatch: 'green' },
        { id: 'b24', brand: 'Ola', model: 'S1 Pro', year: 2023, price: 125000, km: 5000, fuel: 'Electric', trans: 'Automatic', owner: '1st', city: 'Bangalore', damage: [], services: 1, accidents: 0, future3: 85000, priceMismatch: 'green' }
    ],

    truck: [
        { id: 't1', brand: 'Tata', model: 'Prime', year: 2021, price: 2400000, km: 80000, fuel: 'Diesel', trans: 'Manual', owner: '1st', city: 'Mumbai', damage: ['Dent (side)'], services: 5, accidents: 1, future3: 1600000, priceMismatch: 'green' },
        { id: 't2', brand: 'Ashok Leyland', model: 'Pioneer', year: 2020, price: 2200000, km: 95000, fuel: 'Diesel', trans: 'Manual', owner: '2nd', city: 'Pune', damage: ['Scratch (rear)'], services: 7, accidents: 2, future3: 1350000, priceMismatch: 'yellow' },
        { id: 't3', brand: 'Mahindra', model: 'Blazo', year: 2019, price: 2500000, km: 70000, fuel: 'Diesel', trans: 'Manual', owner: '1st', city: 'Delhi', damage: [], services: 6, accidents: 0, future3: 1700000, priceMismatch: 'green' },
        { id: 't4', brand: 'BharatBenz', model: '912R', year: 2022, price: 2800000, km: 50000, fuel: 'Diesel', trans: 'Manual', owner: '1st', city: 'Bangalore', damage: ['Dent (door)'], services: 3, accidents: 1, future3: 1950000, priceMismatch: 'green' },
        { id: 't5', brand: 'Eicher', model: 'Pro 3016', year: 2020, price: 2600000, km: 60000, fuel: 'Diesel', trans: 'Manual', owner: '1st', city: 'Chennai', damage: ['Scratch (bumper)'], services: 5, accidents: 0, future3: 1750000, priceMismatch: 'yellow' },
        { id: 't6', brand: 'Volvo', model: 'FH 420', year: 2018, price: 6000000, km: 120000, fuel: 'Diesel', trans: 'Automatic', owner: '2nd', city: 'Hyderabad', damage: ['Dent (side)'], services: 9, accidents: 3, future3: 3500000, priceMismatch: 'red' },
        { id: 't7', brand: 'Scania', model: 'R410', year: 2019, price: 5500000, km: 110000, fuel: 'Diesel', trans: 'Manual', owner: '1st', city: 'Mumbai', damage: ['Scratch (front)'], services: 8, accidents: 2, future3: 3200000, priceMismatch: 'yellow' },
        { id: 't8', brand: 'MAN', model: 'TGA', year: 2017, price: 5000000, km: 150000, fuel: 'Diesel', trans: 'Manual', owner: '3rd', city: 'Pune', damage: ['Dent (rear)'], services: 10, accidents: 4, future3: 2600000, priceMismatch: 'red' },
        { id: 't9', brand: 'DAF', model: 'XF 480', year: 2020, price: 7000000, km: 80000, fuel: 'Diesel', trans: 'Automatic', owner: '1st', city: 'Delhi', damage: [], services: 4, accidents: 0, future3: 4800000, priceMismatch: 'yellow' },
        { id: 't10', brand: 'Iveco', model: 'Stralis', year: 2019, price: 4800000, km: 90000, fuel: 'Diesel', trans: 'Manual', owner: '2nd', city: 'Bangalore', damage: ['Scratch (side)'], services: 7, accidents: 2, future3: 2900000, priceMismatch: 'yellow' },
        { id: 't11', brand: 'Kamaz', model: '65115', year: 2020, price: 2200000, km: 75000, fuel: 'Diesel', trans: 'Manual', owner: '1st', city: 'Chennai', damage: ['Dent (hood)'], services: 5, accidents: 1, future3: 1400000, priceMismatch: 'green' },
        { id: 't12', brand: 'Ural', model: 'Next', year: 2021, price: 2300000, km: 60000, fuel: 'Diesel', trans: 'Manual', owner: '1st', city: 'Hyderabad', damage: [], services: 4, accidents: 0, future3: 1550000, priceMismatch: 'green' },
        { id: 't13', brand: 'Mercedes-Benz', model: 'Actros', year: 2022, price: 8000000, km: 40000, fuel: 'Diesel', trans: 'Automatic', owner: '1st', city: 'Mumbai', damage: ['Scratch (bumper)'], services: 2, accidents: 0, future3: 5800000, priceMismatch: 'yellow' },
        { id: 't14', brand: 'Foton', model: 'Auman', year: 2021, price: 2700000, km: 55000, fuel: 'Diesel', trans: 'Manual', owner: '1st', city: 'Pune', damage: ['Dent (door)'], services: 4, accidents: 1, future3: 1800000, priceMismatch: 'green' },
        { id: 't15', brand: 'Dongfeng', model: 'DFL', year: 2020, price: 2100000, km: 70000, fuel: 'Diesel', trans: 'Manual', owner: '2nd', city: 'Delhi', damage: ['Scratch (rear)'], services: 6, accidents: 2, future3: 1250000, priceMismatch: 'yellow' },
        { id: 't16', brand: 'Isuzu', model: 'NPR', year: 2019, price: 1900000, km: 85000, fuel: 'Diesel', trans: 'Manual', owner: '2nd', city: 'Bangalore', damage: ['Dent (side)'], services: 7, accidents: 1, future3: 1150000, priceMismatch: 'green' },
        { id: 't17', brand: 'Tata', model: 'Ace Gold', year: 2022, price: 520000, km: 30000, fuel: 'Diesel', trans: 'Manual', owner: '1st', city: 'Nagpur', damage: [], services: 3, accidents: 0, future3: 360000, priceMismatch: 'green' },
        { id: 't18', brand: 'Mahindra', model: 'Bolero Pickup', year: 2021, price: 780000, km: 45000, fuel: 'Diesel', trans: 'Manual', owner: '1st', city: 'Nashik', damage: ['Scratch (tray)'], services: 4, accidents: 0, future3: 540000, priceMismatch: 'green' },
        { id: 't19', brand: 'Ashok Leyland', model: 'Dost+', year: 2022, price: 850000, km: 28000, fuel: 'Diesel', trans: 'Manual', owner: '1st', city: 'Coimbatore', damage: [], services: 2, accidents: 0, future3: 610000, priceMismatch: 'green' },
        { id: 't20', brand: 'Eicher', model: 'Pro 2049', year: 2021, price: 1450000, km: 52000, fuel: 'Diesel', trans: 'Manual', owner: '1st', city: 'Indore', damage: ['Dent (cabin)'], services: 5, accidents: 1, future3: 980000, priceMismatch: 'green' },
        { id: 't21', brand: 'BharatBenz', model: '1617R', year: 2020, price: 2350000, km: 88000, fuel: 'Diesel', trans: 'Manual', owner: '2nd', city: 'Surat', damage: ['Scratch (side)'], services: 6, accidents: 1, future3: 1480000, priceMismatch: 'yellow' },
        { id: 't22', brand: 'Tata', model: 'Signa 4825', year: 2021, price: 4200000, km: 65000, fuel: 'Diesel', trans: 'Manual', owner: '1st', city: 'Kolkata', damage: [], services: 4, accidents: 0, future3: 2900000, priceMismatch: 'green' },
        { id: 't23', brand: 'Mahindra', model: 'Furio 7', year: 2022, price: 1950000, km: 34000, fuel: 'Diesel', trans: 'Manual', owner: '1st', city: 'Jaipur', damage: [], services: 2, accidents: 0, future3: 1400000, priceMismatch: 'green' },
        { id: 't24', brand: 'Isuzu', model: 'D-Max S-Cab', year: 2021, price: 1250000, km: 40000, fuel: 'Diesel', trans: 'Manual', owner: '1st', city: 'Lucknow', damage: ['Dent (tail gate)'], services: 3, accidents: 1, future3: 860000, priceMismatch: 'green' }
    ]
};

vehicleData.car.forEach(v => v._cat = 'car');
vehicleData.bike.forEach(v => v._cat = 'bike');
vehicleData.truck.forEach(v => v._cat = 'truck');

function getAllVehicles() {
    return [...vehicleData.car, ...vehicleData.bike, ...vehicleData.truck];
}

function getVehicleById(id) {
    return getAllVehicles().find(v => v.id === id);
}

// ===== DATABASE SELLER LISTINGS =====
// Catalog vehicles remain local for fast loading. Seller-created vehicles come from SQLite.
let databaseSellerListingsLoaded = false;
async function loadDatabaseSellerListings() {
    if (databaseSellerListingsLoaded) return;
    try {
        const r = await fetch('/api/vehicles', { credentials: 'same-origin', cache: 'no-store' });
        if (!r.ok) return;
        const data = await r.json();
        const listings = Array.isArray(data.vehicles) ? data.vehicles : [];
        listings.forEach(v => {
            const mapped = {
                id: `db-${v.id}`,
                dbId: v.id,
                brand: v.brand,
                model: v.model,
                year: v.year,
                price: Number(v.price),
                km: Number(v.km || 0),
                fuel: v.fuel,
                trans: v.trans,
                owner: v.owner || '1st',
                city: v.city,
                damage: v.damage || [],
                services: Number(v.services || 0),
                accidents: Number(v.accidents || 0),
                future3: Number(v.future3 || 0),
                priceMismatch: v.priceMismatch || 'green',
                image: v.image || '',
                _cat: v.category || 'car',
                _sellerListing: true
            };
            if (!getAllVehicles().some(x => x.id === mapped.id)) {
                vehicleData[mapped._cat].push(mapped);
            }
        });
        databaseSellerListingsLoaded = true;
    } catch (err) {
        console.warn('Seller database listings unavailable:', err.message);
    }
}
