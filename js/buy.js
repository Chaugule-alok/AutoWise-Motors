// buy.js – cars / bikes / trucks sections with filters, search,
// wishlist hearts and a "See more" / "See less" toggle per section.

let buyCategory = 'all';
let buySearch = '';
let activeFilters = null;

const BUY_SECTIONS = [
    { cat: 'car', gridId: 'carGrid', toggleId: 'toggleCarsBtn', sectionId: 'carsSection', countId: 'carCount' },
    { cat: 'bike', gridId: 'bikeGrid', toggleId: 'toggleBikesBtn', sectionId: 'bikesSection', countId: 'bikeCount' },
    { cat: 'truck', gridId: 'truckGrid', toggleId: 'toggleTrucksBtn', sectionId: 'trucksSection', countId: 'truckCount' }
];

function toggleFilter() {
    document.getElementById('filterPanel').classList.toggle('open');
}

function getFilterValues() {
    const num = (id, fallback) => {
        const value = parseInt(document.getElementById(id).value, 10);
        return Number.isNaN(value) ? fallback : value;
    };
    return {
        text: document.getElementById('filterText').value.trim().toLowerCase(),
        type: document.getElementById('filterType').value,
        fuel: document.getElementById('filterFuel').value,
        kmMin: num('filterKmMin', 0),
        kmMax: num('filterKmMax', Infinity),
        yearMin: num('filterYearMin', 0),
        yearMax: num('filterYearMax', Infinity),
        priceMin: num('filterPriceMin', 0),
        priceMax: num('filterPriceMax', Infinity)
    };
}

function applyFilters() {
    activeFilters = getFilterValues();
    buyCategory = activeFilters.type;
    document.querySelectorAll('.category-pills .pill').forEach(el => {
        el.classList.toggle('active', el.dataset.cat === buyCategory);
    });
    renderBuyGrid();
}

function resetFilters() {
    ['filterText', 'filterKmMin', 'filterKmMax', 'filterYearMin', 'filterYearMax', 'filterPriceMin', 'filterPriceMax']
        .forEach(id => { document.getElementById(id).value = ''; });
    document.getElementById('filterType').value = 'all';
    document.getElementById('filterFuel').value = 'all';
    activeFilters = null;
    setCategory('all');
}

function setCategory(cat) {
    buyCategory = cat;
    document.querySelectorAll('.category-pills .pill').forEach(el => {
        el.classList.toggle('active', el.dataset.cat === cat);
    });
    renderBuyGrid();
    scrollToCategory(cat);
}

function scrollToCategory(cat) {
    const sectionMap = { all: 'carsSection', car: 'carsSection', bike: 'bikesSection', truck: 'trucksSection' };
    const target = document.getElementById(sectionMap[cat] || 'carsSection');
    if (!target) return;
    const headerOffset = document.querySelector('.header')?.offsetHeight || 80;
    window.scrollTo({
        top: target.getBoundingClientRect().top + window.pageYOffset - headerOffset - 14,
        behavior: 'smooth'
    });
}

function filterBuy() {
    buySearch = (document.getElementById('filterText')?.value || '').trim().toLowerCase();
    renderBuyGrid();
}

function matchesFilters(v) {
    if (buySearch) {
        const hit = v.brand.toLowerCase().includes(buySearch) ||
            v.model.toLowerCase().includes(buySearch) ||
            v.city.toLowerCase().includes(buySearch);
        if (!hit) return false;
    }
    if (!activeFilters) return true;

    const f = activeFilters;
    if (f.fuel !== 'all' && v.fuel !== f.fuel) return false;
    if (f.text && !(
        v.brand.toLowerCase().includes(f.text) ||
        v.model.toLowerCase().includes(f.text) ||
        v.city.toLowerCase().includes(f.text)
    )) return false;
    if (v.km < f.kmMin || v.km > f.kmMax) return false;
    if (v.year < f.yearMin || v.year > f.yearMax) return false;
    if (v.price < f.priceMin || v.price > f.priceMax) return false;
    return true;
}

function updateBuySummary(counts) {
    const summary = document.getElementById('buySummary');
    if (!summary) return;
    const total = counts.reduce((sum, c) => sum + c.count, 0);
    summary.textContent = total === 0 ?
        'No vehicles match your search. Try different filters or press Reset.' :
        `${total} vehicles found (` + counts.map(c => `${c.count} ${c.cat}s`).join(', ') +
        '). Use "See more" in a section to open its full list.';
}

function renderBuyGrid() {
    const counts = [];

    BUY_SECTIONS.forEach(section => {
        const list = vehicleData[section.cat].filter(matchesFilters);
        const sectionEl = document.getElementById(section.sectionId);
        const hidden = buyCategory !== 'all' && buyCategory !== section.cat;

        if (sectionEl) sectionEl.style.display = hidden ? 'none' : '';
        if (hidden) return;

        counts.push({ cat: section.cat, count: list.length });
        const countEl = document.getElementById(section.countId);
        if (countEl) countEl.textContent = `${list.length} ${section.cat}s`;

        renderVehicleSection(section.gridId, list, { toggleId: section.toggleId, visibleCount: 8 });
    });

    updateBuySummary(counts);
}

// The "Best Car With Best Price" banner uses the same manual photo as its listing.
function renderBestDeal() {
    const img = document.getElementById('bestDealImage');
    const vehicle = getVehicleById('c5');
    if (!img || !vehicle) return;
    const list = getVehicleImages(vehicle).map(encodeImagePath);
    img.dataset.fallbacks = list.slice(1).join('|');
    img.onerror = () => nextVehicleImage(img);
    img.src = list[0];
}

document.addEventListener('DOMContentLoaded', async function() {
    await loadDatabaseSellerListings();
    const text = document.getElementById('filterText');
    if (text) {
        text.addEventListener('input', () => {
            buySearch = text.value.trim().toLowerCase();
            renderBuyGrid();
        });
        text.addEventListener('keydown', e => {
            if (e.key === 'Enter') {
                e.preventDefault();
                buySearch = text.value.trim().toLowerCase();
                renderBuyGrid();
            }
        });
    }
    renderBestDeal();
    renderBuyGrid();
    updateWishlistBadge();
});
