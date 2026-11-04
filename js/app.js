// app.js – home page behaviour.
let currentCategory = 'all';
let currentSearch = '';

function getFilteredVehicles() {
    let all = getAllVehicles();
    if (currentCategory !== 'all') all = all.filter(v => v._cat === currentCategory);
    if (currentSearch.trim()) {
        const q = currentSearch.trim().toLowerCase();
        all = all.filter(v =>
            `${v.brand} ${v.model}`.toLowerCase().includes(q) ||
            String(v.model).toLowerCase().includes(q) ||
            String(v.brand).toLowerCase().includes(q) ||
            String(v.city).toLowerCase().includes(q) ||
            String(v.fuel).toLowerCase().includes(q) ||
            String(v.year).includes(q)
        ).sort((a, b) => {
            const an = `${a.brand} ${a.model}`.toLowerCase();
            const bn = `${b.brand} ${b.model}`.toLowerCase();
            const score = s => s === q ? 0 : (s.startsWith(q) ? 1 : (s.includes(q) ? 2 : 3));
            return score(an) - score(bn) || a.price - b.price;
        });
    }
    return all;
}

const POPULAR_IDS = ['c1', 'b1', 'c14', 'b4'];
const MORE_IDS = ['c5', 'c17', 'b15', 'c3'];

function renderHomeSections() {
    const pick = ids => ids.map(getVehicleById).filter(Boolean);
    renderVehicleSection('popularGrid', pick(POPULAR_IDS), { visibleCount: 4 });
    renderVehicleSection('moreGrid', pick(MORE_IDS), { visibleCount: 4 });
}

function renderGrid() {
    const results = getFilteredVehicles();
    renderVehicleSection('vehicleGrid', results, {
        toggleId: 'toggleFeaturedBtn',
        visibleCount: 8
    });
    const heading = document.querySelector('#vehicleGrid')?.previousElementSibling?.querySelector('h2');
    if (heading) {
        heading.innerHTML = currentSearch.trim()
            ? `<i class="fas fa-search" style="color:var(--primary);"></i> Search results for “${escapeSearch(currentSearch)}”`
            : `<i class="fas fa-car" style="color:var(--primary);"></i> Featured Vehicles`;
    }
    // Search should feel like a real marketplace: when searching, show results
    // immediately and hide decorative recommendation sections.
    const showExtras = !currentSearch.trim();
    document.querySelectorAll('.manual-vehicles').forEach(section => {
        section.style.display = showExtras ? '' : 'none';
    });
    const vehicleHeading = document.querySelector('#vehicleGrid')?.previousElementSibling;
    if (vehicleHeading) vehicleHeading.style.display = '';
}

function escapeSearch(s) {
    return String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
}

function setCategory(cat) {
    currentCategory = cat;
    document.querySelectorAll('.category-pills .pill').forEach(el => {
        el.classList.toggle('active', el.dataset.cat === cat);
    });
    renderGrid();
}

function filterCards() {
    const input = document.getElementById('globalSearch');
    currentSearch = input ? input.value : '';
    renderGrid();
    const result = document.getElementById('vehicleGrid');
    if (currentSearch.trim() && result) {
        result.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

document.addEventListener('DOMContentLoaded', async function() {
    await loadDatabaseSellerListings();
    renderHomeSections();
    renderGrid();
    estimatePrice();

    document.querySelectorAll('#estYear, #estKm, #estServices, #estAccidents').forEach(el => {
        el.addEventListener('input', estimatePrice);
    });

    const search = document.getElementById('globalSearch');
    if (search) {
        search.addEventListener('input', filterCards);
        search.addEventListener('keydown', e => {
            if (e.key === 'Enter') {
                e.preventDefault();
                filterCards();
            }
        });
    }

    console.log(`🚗 AutoWise loaded – ${getAllVehicles().length} vehicles available.`);
});
