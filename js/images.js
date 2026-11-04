// images.js – vehicle-name based image mapping.
// The first image is the card image; remaining images are used in the detail gallery.
// Extra vehicle photos supplied with the project are mapped by model name here.

const VEHICLE_IMAGES = {
    "c1": [
        "Images/Suzuki/Screenshot 2026-08-06 121821.png",
        "Images/Suzuki/Screenshot 2026-08-06 121921.png",
        "Images/Suzuki/Screenshot 2026-08-06 122015.png",
        "Images/Suzuki/Screenshot 2026-08-06 122143.png"
    ],
    "c2": [
        "Images/i20/image (6).jpg",
        "Images/i20/image.jpg"
    ],
    "c3": [
        "Images/Tata nexon/image (1).jpg",
        "Images/Tata nexon/image (2).jpg",
        "Images/Tata nexon/image (3).jpg",
        "Images/Tata nexon/image.jpg"
    ],
    "c5": [
        "Images/Honda City/image (1).jpg",
        "Images/Honda City/image (2).jpg",
        "Images/Honda City/image (3).jpg",
        "Images/Honda City/image.jpg"
    ],
    "c6": [
        "Images/glanza/image (2).jpg",
        "Images/glanza/image (3).jpg",
        "Images/glanza/image (4).jpg",
        "Images/glanza/image (5).jpg"
    ],
    "c7": [
        "Images/polo/image (1).jpg",
        "Images/polo/image (2).jpg",
        "Images/polo/image (3).jpg",
        "Images/polo/image (5).jpg"
    ],
    "c8": [
        "Images/repid/image (1).jpg",
        "Images/repid/image (2).jpg",
        "Images/repid/image (3).jpg",
        "Images/repid/image.jpg"
    ],
    "c9": [
        "Images/ecosport/image (1).jpg",
        "Images/ecosport/image (2).jpg",
        "Images/ecosport/image (3).jpg",
        "Images/ecosport/image (4).jpg"
    ],
    "c10": [
        "Images/magnit/image (1).jpg",
        "Images/magnit/image (2).jpg",
        "Images/magnit/image (4).jpg",
        "Images/magnit/image.jpg"
    ],
    "c11": [
        "Images/hector/image (1).jpg",
        "Images/hector/image (2).jpg",
        "Images/hector/image (3).jpg",
        "Images/hector/image (4).jpg"
    ],
    "c12": [
        "Images/seltos/image (1).jpg",
        "Images/seltos/image (2).jpg",
        "Images/seltos/image (3).jpg",
        "Images/seltos/image (4).jpg"
    ],
    "c14": [
        "Images/Creta/image (1).jpg",
        "Images/Creta/image (2).jpg",
        "Images/Creta/image (3).jpg",
        "Images/Creta/image.jpg"
    ],
    "c15": [
        "Images/baleno/baleno-exterior-right-rear-three-quarter.avif",
        "Images/baleno/baleno-exterior-right-side-view.avif",
        "Images/baleno/baleno.avif"
    ],
    "c16": [
        "Images/innova/dbce0580-b056-40a4-8e66-72a6a0615877.avif",
        "Images/innova/processed_5b4b0014-8e61-4d20-9a98-b330c9eb0d11.avif",
        "Images/innova/processed_6c859b2c-eb8f-45bf-b75d-3cf7dbee379a.avif",
        "Images/innova/processed_a8aff329-e101-44e3-9c20-ad08b4594280.avif"
    ],
    "c17": [
        "Images/Verna/image (1).jpg",
        "Images/Verna/image (2).jpg",
        "Images/Verna/image (3).jpg",
        "Images/Verna/image (4).jpg"
    ],
    "c19": [
        "Images/brezza/1b357c82-a5b2-4586-9863-5d19ecf06027.avif",
        "Images/brezza/f3ac595e-1249-4ed9-90b7-9d03ecdba9f8.avif",
        "Images/brezza/processed_1adeea1f-319a-49b4-908f-bbdfea91de98.avif",
        "Images/brezza/processed_37546633-5ab5-4964-96a9-a6cb3c3192c6.avif"
    ],
    "c20": [
        "Images/sonet/processed_3e2c15dd-dd64-4279-846f-310b5b343e9b.avif",
        "Images/sonet/processed_646843fc-e594-4485-ab14-a4b3edf3bfe3.avif",
        "Images/sonet/processed_694118b7-2c36-45b6-a1a1-d55054ac953c.avif",
        "Images/sonet/processed_b4aaffc2-2041-4c0a-9309-1089167dc064.avif"
    ],
    "b1": [
        "Images/Enfiled/image (1).jpg",
        "Images/Enfiled/image.jpg"
    ],
    "b4": [
        "Images/RTR 200/image (1).jpg",
        "Images/RTR 200/image (2).jpg",
        "Images/RTR 200/image (4).jpg",
        "Images/RTR 200/image.jpg"
    ],
    "b15": [
        "Images/Ninja 300/image (1).jpg",
        "Images/Ninja 300/image (2).jpg",
        "Images/Ninja 300/image (5).jpg",
        "Images/Ninja 300/image.jpg"
    ]
};

// Grey placeholder if a vehicle does not have an uploaded photo yet.
function placeholderImage(vehicle) {
    const title = `${vehicle.brand} ${vehicle.model}`.replace(/&/g, 'and');
    const icon = { car: '\uD83D\uDE97', bike: '\uD83C\uDFCD', truck: '\uD83D\uDE9A' }[vehicle._cat] || '\uD83D\uDE97';
    return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="260">' +
        '<rect width="400" height="260" fill="#e7edf6"/>' +
        '<text x="200" y="110" font-size="46" text-anchor="middle">' + icon + '</text>' +
        '<text x="200" y="152" font-family="Arial,sans-serif" font-size="17" font-weight="bold" fill="#0f4c81" text-anchor="middle">' +
        title + '</text>' +
        '<text x="200" y="178" font-family="Arial,sans-serif" font-size="12" fill="#7b8ba3" text-anchor="middle">Photo not uploaded yet</text></svg>'
    );
}

function getVehicleImages(vehicle) {
    const list = (VEHICLE_IMAGES[vehicle.id] || []).slice();
    if (vehicle.image && !list.includes(vehicle.image)) list.push(vehicle.image);
    list.push(placeholderImage(vehicle));
    return list;
}

function getVehicleImage(vehicle) {
    return encodeImagePath(getVehicleImages(vehicle)[0]);
}

function encodeImagePath(path) {
    return path.startsWith('data:') ? path : encodeURI(path);
}

function vehicleImageAttrs(vehicle) {
    const list = getVehicleImages(vehicle);
    const rest = list.slice(1).map(encodeImagePath).join('|').replace(/"/g, '&quot;');
    return `src="${encodeImagePath(list[0])}" data-fallbacks="${rest}" onerror="nextVehicleImage(this)"`;
}

function nextVehicleImage(img) {
    const remaining = (img.dataset.fallbacks || '').split('|').filter(Boolean);
    const next = remaining.shift();
    img.dataset.fallbacks = remaining.join('|');
    if (next) img.src = next;
    else img.onerror = null;
}
