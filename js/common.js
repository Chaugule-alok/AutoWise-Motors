// common.js – shared functions (including wishlist, recommendations, etc.)

// ===== FORMATTING =====
function formatPrice(amount) {
    return '₹' + Number(amount).toLocaleString('en-IN');
}

// ===== WISHLIST =====
function getWishlist() {
    return JSON.parse(localStorage.getItem('autowise_wishlist') || '[]');
}

function saveWishlist(list) {
    localStorage.setItem('autowise_wishlist', JSON.stringify(list));
}

function toggleWishlist(vehicleId) {
    let list = getWishlist();
    const index = list.indexOf(vehicleId);
    if (index > -1) {
        list.splice(index, 1);
    } else {
        list.push(vehicleId);
    }
    saveWishlist(list);
    updateWishlistBadge();
    return list;
}

function isInWishlist(vehicleId) {
    return getWishlist().includes(vehicleId);
}

function updateWishlistBadge() {
    const badge = document.getElementById('wishlistBadge');
    if (badge) {
        const count = getWishlist().length;
        badge.textContent = count;
    }
}

// ===== WISHLIST UI HELPERS =====
function updateWishlistButtons() {
    document.querySelectorAll('.wishlist-btn').forEach(btn => {
        let vid = btn.dataset.vid || btn.dataset.id || btn.getAttribute('data-id');
        if (!vid) {
            // Try to infer id from ancestor onclick (openDetail('id'))
            let anc = btn.closest('.vehicle-card');
            if (anc) {
                const onclick = anc.getAttribute('onclick') || '';
                const m = onclick.match(/openDetail\(['"]([a-z0-9_-]+)['"]\)/i);
                if (m) vid = m[1];
            }
        }
        if (!vid) return;
        // store inferred id for future
        btn.dataset.vid = vid;
        btn.classList.toggle('active', isInWishlist(vid));
        // (re)bind click handler safely
        btn.onclick = function(e) {
            e.stopPropagation();
            toggleWishlistAndUpdate(vid);
        };
    });
}

function toggleWishlistAndUpdate(id) {
    toggleWishlist(id);
    updateWishlistBadge();
    // Turn every button for this vehicle red / grey without rebuilding the grids,
    // so an expanded "See more" section stays expanded.
    document.querySelectorAll(`.wishlist-btn[data-vid="${id}"]`).forEach(btn => {
        btn.classList.toggle('active', isInWishlist(id));
    });
    if (typeof renderWishlist === 'function') renderWishlist();
}

// Ensure badge and button states initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    updateWishlistBadge();
    updateWishlistButtons();
    updateAuthHeader();
});

function updateAuthHeader() {
    const headerActions = document.querySelector('.header-actions');
    const loginLink = document.querySelector('.header-actions a[href="login.html"], .header-actions a[href="#"]');
    if (!headerActions || !loginLink) return;

    const user = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
    if (!user) {
        resetLoginLink();
        return;
    }

    loginLink.innerHTML = `<i class="fas fa-user"></i> Hi, ${user.name}`;
    loginLink.href = '#';
    loginLink.classList.remove('btn-outline');
    loginLink.classList.add('btn-solid');
    loginLink.onclick = (e) => e.preventDefault();
    loginLink.title = `Signed in as ${user.username}`;

    if (!document.getElementById('logoutBtn')) {
        const logoutBtn = document.createElement('button');
        logoutBtn.id = 'logoutBtn';
        logoutBtn.type = 'button';
        logoutBtn.className = 'btn-outline';
        logoutBtn.textContent = 'Logout';
        logoutBtn.style.marginLeft = '10px';
        logoutBtn.addEventListener('click', logoutUser);
        headerActions.insertBefore(logoutBtn, loginLink.nextSibling);
    }
}

function resetLoginLink() {
    const loginLink = document.querySelector('.header-actions a[href="login.html"], .header-actions a[href="#"]');
    const logoutBtn = document.getElementById('logoutBtn');
    if (loginLink) {
        loginLink.textContent = 'Login';
        loginLink.href = 'login.html';
        loginLink.classList.remove('btn-solid');
        loginLink.classList.add('btn-outline');
        loginLink.onclick = null;
        loginLink.title = 'Login to AutoWise';
    }
    if (logoutBtn) {
        logoutBtn.remove();
    }
}

// ===== SHARED VEHICLE CARD =====
const MISMATCH_LABELS = {
    green: 'Fair Price',
    yellow: 'Overpriced',
    red: '⚠️ Fraud Alert'
};

function renderVehicleCard(v) {
    const damageTags = v.damage && v.damage.length ?
        v.damage.map(d => `<span class="tag damage"><i class="fas fa-exclamation-triangle"></i> ${d}</span>`).join('') :
        `<span class="tag good"><i class="fas fa-check-circle"></i> No damage reported</span>`;
    const catLabel = v._cat.charAt(0).toUpperCase() + v._cat.slice(1);

    return `
        <div class="vehicle-card" data-vid="${v.id}" onclick="window.location.href='detail.html?id=${v.id}'">
            <button class="wishlist-btn ${isInWishlist(v.id) ? 'active' : ''}" data-vid="${v.id}"
                title="Add to wishlist" aria-label="Add to wishlist"
                onclick="event.stopPropagation(); toggleWishlistAndUpdate('${v.id}')">
                <i class="fas fa-heart"></i>
            </button>
            <div class="img-wrap">
                <img ${vehicleImageAttrs(v)} alt="${v.brand} ${v.model}" loading="lazy" />
                <span class="price-tag">${formatPrice(v.price)}</span>
                <span class="price-mismatch ${v.priceMismatch}">${MISMATCH_LABELS[v.priceMismatch] || ''}</span>
            </div>
            <div class="card-body">
                <h3>${v.brand} ${v.model}</h3>
                <div class="sub">${v.year} · ${v.city} · ${v.owner} owner</div>
                <div class="specs">
                    <span><i class="fas fa-tachometer-alt"></i> ${v.km.toLocaleString()} km</span>
                    <span><i class="fas fa-gas-pump"></i> ${v.fuel}</span>
                    <span><i class="fas fa-cog"></i> ${v.trans}</span>
                </div>
                <div class="features">
                    <span class="tag">${catLabel}</span>
                    ${damageTags}
                </div>
                <button class="btn-detail"><i class="fas fa-arrow-right"></i> View Details</button>
            </div>
        </div>
    `;
}

// Renders a grid and wires an optional "See more / See less" button.
// Only `visibleCount` cards are shown until the user expands the section.
function renderVehicleSection(gridId, list, { toggleId = null, visibleCount = 8 } = {}) {
    const grid = document.getElementById(gridId);
    if (!grid) return;

    if (!list.length) {
        grid.innerHTML = `<p style="grid-column:1/-1;text-align:center;padding:40px;color:var(--text-muted);">No vehicles found. Try a different search or filter.</p>`;
        const emptyToggle = toggleId && document.getElementById(toggleId);
        if (emptyToggle) emptyToggle.style.display = 'none';
        return;
    }

    grid.innerHTML = list.map(renderVehicleCard).join('');

    const toggle = toggleId ? document.getElementById(toggleId) : null;
    if (!toggle) return;

    if (list.length <= visibleCount) {
        toggle.style.display = 'none';
        return;
    }

    toggle.style.display = '';
    const expanded = toggle.dataset.expanded === 'true';
    applySectionVisibility(grid, toggle, visibleCount, expanded);

    toggle.onclick = function() {
        const nowExpanded = toggle.dataset.expanded !== 'true';
        applySectionVisibility(grid, toggle, visibleCount, nowExpanded);
        if (!nowExpanded) {
            const top = grid.getBoundingClientRect().top + window.pageYOffset - 120;
            window.scrollTo({ top, behavior: 'smooth' });
        }
    };
}

function applySectionVisibility(grid, toggle, visibleCount, expanded) {
    grid.querySelectorAll('.vehicle-card').forEach((card, index) => {
        card.style.display = (expanded || index < visibleCount) ? '' : 'none';
    });
    toggle.dataset.expanded = expanded ? 'true' : 'false';
    toggle.innerHTML = expanded ?
        '<i class="fas fa-arrow-up"></i> See less' :
        '<i class="fas fa-arrow-down"></i> See more';
}

// ===== VIEW HISTORY =====
function getViewHistory() {
    return JSON.parse(localStorage.getItem('autowise_viewHistory') || '[]');
}

function saveViewHistory(history) {
    localStorage.setItem('autowise_viewHistory', JSON.stringify(history));
}

function addToViewHistory(vehicleId) {
    let history = getViewHistory();
    // Remove if already present (to move to front)
    history = history.filter(id => id !== vehicleId);
    history.unshift(vehicleId);
    // Keep only last 20
    if (history.length > 20) history = history.slice(0, 20);
    saveViewHistory(history);
}

// ===== RECOMMENDATIONS =====
function getRecommendations(vehicleId, limit = 3) {
    const all = getAllVehicles();
    const target = all.find(v => v.id === vehicleId);
    if (!target) return [];

    // Compute similarity score for each vehicle
    const scored = all.filter(v => v.id !== vehicleId).map(v => {
        let score = 0;
        // Same category (car/bike/truck) -> +30
        if (v._cat === target._cat) score += 30;
        // Same brand -> +20
        if (v.brand === target.brand) score += 20;
        // Price similarity (within 30%) -> +15
        const priceDiff = Math.abs(v.price - target.price) / target.price;
        if (priceDiff <= 0.3) score += 15;
        // Year similarity (within 3 years) -> +10
        if (Math.abs(v.year - target.year) <= 3) score += 10;
        // KM similarity (within 30%) -> +10
        const kmDiff = Math.abs(v.km - target.km) / (target.km + 1);
        if (kmDiff <= 0.3) score += 10;
        // Fuel same -> +10
        if (v.fuel === target.fuel) score += 10;
        return { ...v, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, limit);
}

// ===== MODAL FUNCTIONS (with recommendation injection) =====
function openDetail(id) {
    const all = getAllVehicles();
    const v = all.find(item => item.id === id);
    if (!v) return;

    // Add to view history
    addToViewHistory(id);

    const modal = document.getElementById('detailModal');
    if (!modal) return;

    document.getElementById('modalTitle').textContent = `${v.brand} ${v.model}`;
    document.getElementById('modalSub').textContent = `${v.year} · ${v.city} · ${v.owner} owner`;

    const mismatchText = {
        green: '✅ Fair Price — matches market',
        yellow: '⚠️ Overpriced — above market average',
        red: '🚨 Fraud Alert — price is extremely high'
    } [v.priceMismatch] || '';

    const damageHtml = v.damage && v.damage.length ?
        v.damage.map(d => `<span class="badge dent"><i class="fas fa-circle"></i> ${d}</span>`).join('') :
        `<span class="badge good"><i class="fas fa-check-circle"></i> No damage detected</span>`;

    // Generate recommendations
    const recs = getRecommendations(id, 3);
    let recHtml = '';
    if (recs.length) {
        recHtml = `
            <div class="recommendations">
                <h4><i class="fas fa-lightbulb" style="color:var(--secondary);"></i> You might also like</h4>
                <div class="recommendation-grid">
                    ${recs.map(r => `
                        <div class="recommendation-item" onclick="openDetail('${r.id}')">
                            <img ${vehicleImageAttrs(r)} alt="${r.brand} ${r.model}" />
                            <div class="rec-name">${r.brand} ${r.model}</div>
                            <div class="rec-price">${formatPrice(r.price)}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    document.getElementById('modalBody').innerHTML = `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:16px 0;">
            <div class="detail-row"><span class="label">Price</span><span class="value">${formatPrice(v.price)}</span></div>
            <div class="detail-row"><span class="label">Future Value (3 yrs)</span><span class="value">${formatPrice(v.future3)}</span></div>
            <div class="detail-row"><span class="label">Kilometers</span><span class="value">${v.km.toLocaleString()} km</span></div>
            <div class="detail-row"><span class="label">Fuel</span><span class="value">${v.fuel}</span></div>
            <div class="detail-row"><span class="label">Transmission</span><span class="value">${v.trans}</span></div>
            <div class="detail-row"><span class="label">Services</span><span class="value">${v.services || 0}</span></div>
            <div class="detail-row"><span class="label">Accidents</span><span class="value">${v.accidents || 0}</span></div>
            <div class="detail-row"><span class="label">Price Status</span><span class="value" style="font-weight:700;color:${v.priceMismatch === 'green' ? 'var(--green)' : v.priceMismatch === 'yellow' ? 'var(--yellow)' : 'var(--red)'}">${mismatchText}</span></div>
        </div>
        <div style="margin:8px 0 12px;">
            <strong>🔍 Damage Report:</strong>
            <div class="damage-list">${damageHtml}</div>
        </div>
        <div style="background:#f8faff;padding:14px 18px;border-radius:10px;border:1px dashed #b0c4de;display:flex;align-items:center;gap:16px;flex-wrap:wrap;">
            <i class="fas fa-qrcode" style="font-size:32px;color:var(--primary);"></i>
            <div>
                <strong>QR Car Passport</strong>
                <div style="font-family:monospace;background:#fff;padding:4px 14px;border-radius:4px;border:1px solid #ddd;display:inline-block;margin-top:4px;">AW-${v.id.toUpperCase()}-${String(v.year).slice(-2)}</div>
            </div>
            <span style="font-size:13px;color:var(--text-muted);margin-left:auto;"><i class="fas fa-scan"></i> Scan with AutoWise app</span>
        </div>
        <div style="margin-top:18px;display:flex;gap:12px;flex-wrap:wrap;">
            <button class="btn-solid" style="background:var(--primary);color:#fff;padding:10px 28px;border:none;border-radius:30px;font-weight:700;cursor:pointer;" onclick="alert('Contact seller: +91 98765 43210')"><i class="fas fa-phone"></i> Contact Seller</button>
            <button class="btn-outline" style="border:1.5px solid var(--primary);color:var(--primary);padding:10px 28px;border-radius:30px;font-weight:600;background:transparent;cursor:pointer;" onclick="alert('Price mismatch report submitted.')"><i class="fas fa-flag"></i> Report Mismatch</button>
        </div>
        ${recHtml}
    `;

    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const modal = document.getElementById('detailModal');
    if (modal) {
        modal.classList.remove('open');
        document.body.style.overflow = '';
    }
}

// Close modal on overlay click
document.addEventListener('click', function(e) {
    const modal = document.getElementById('detailModal');
    if (modal && e.target === modal) {
        closeModal();
    }
});

// ===== CAR-AI =====
// The yellow button opens the Car-Ai damage/price tool. Car-Ai is a Flask app,
// so it must be reached over http://127.0.0.1:5000 (its CSS and JS are served
// by Flask from Car-Ai/static and only load correctly through that URL).
const CAR_AI_URL = 'http://127.0.0.1:5000/';

async function openCarAi() {
    let running = false;
    try {
        await fetch(CAR_AI_URL, { mode: 'no-cors', cache: 'no-store' });
        running = true;
    } catch (err) {
        running = false;
    }

    if (running) {
        window.open(CAR_AI_URL, '_blank', 'noopener,noreferrer');
        return;
    }

    alert(
        'Car AI is not running yet.\n\n' +
        'Open a terminal in the project folder and run:\n\n' +
        '    cd Car-Ai\n' +
        '    python app.py\n\n' +
        'Then press this button again.'
    );
}

// ===== PRICE ESTIMATOR (home page) =====
function estimatePrice() {
    if (!document.getElementById('estYear')) return;
    const year = parseInt(document.getElementById('estYear').value) || 2020;
    const km = parseInt(document.getElementById('estKm').value) || 0;
    const services = parseInt(document.getElementById('estServices').value) || 0;
    const accidents = parseInt(document.getElementById('estAccidents').value) || 0;

    const basePrice = Math.max(50000, 800000 - (2026 - year) * 55000);
    const kmFactor = Math.max(0.5, 1 - (km / 200000) * 0.4);
    const serviceFactor = Math.min(1.12, 0.92 + (Math.min(services, 10) / 10) * 0.2);
    const accidentFactor = Math.max(0.6, 1 - accidents * 0.08);

    let estimated = basePrice * kmFactor * serviceFactor * accidentFactor;
    estimated = Math.round(estimated / 1000) * 1000;

    const rangeLow = Math.round((estimated * 0.90) / 1000) * 1000;
    const rangeHigh = Math.round((estimated * 1.10) / 1000) * 1000;

    let score = 70;
    score += Math.min(15, (2026 - year) * 1.2);
    score -= Math.min(20, (km / 10000) * 1.5);
    score += Math.min(10, services * 1.5);
    score -= Math.min(25, accidents * 8);
    score = Math.max(20, Math.min(100, Math.round(score)));

    document.getElementById('estPriceDisplay').textContent = formatPrice(estimated);
    document.getElementById('estRange').textContent = `${formatPrice(rangeLow)} – ${formatPrice(rangeHigh)}`;
    document.getElementById('estScore').textContent = `${score} / 100`;
}
// ===== DATABASE BUY / RECOMMENDATION FLOW =====
async function purchaseVehicle(vehicleRef) {
    const user = getCurrentUser();
    if (!user) {
        const next = encodeURIComponent(window.location.pathname + window.location.search);
        window.location.href = `login.html?next=${next}`;
        return;
    }

    const button = document.querySelector('.btn-action.buy');
    if (button) {
        button.disabled = true;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending request…';
    }

    try {
        const r = await fetch('/api/purchases', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify({ vehicle_id: vehicleRef })
        });
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || 'Could not create purchase request.');
        showPurchaseSuccess(data);
    } catch (err) {
        alert(err.message);
    } finally {
        if (button) {
            button.disabled = false;
            button.innerHTML = '<i class="fas fa-shopping-cart"></i> Buy Now';
        }
    }
}

function showPurchaseSuccess(data) {
    const old = document.getElementById('purchaseSuccessModal');
    if (old) old.remove();
    const recs = Array.isArray(data.recommendations) ? data.recommendations : [];
    const recHtml = recs.length ? `
        <div style="margin-top:20px;">
            <h3 style="color:var(--primary);margin-bottom:12px;">Smart recommendations for you</h3>
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;">
                ${recs.map(v => `
                    <div style="background:#f8faff;border-radius:10px;padding:10px;cursor:pointer;"
                         onclick="window.location.href='detail.html?id=${encodeURIComponent(v.catalogId || 'db-' + v.id)}'">
                        <img ${vehicleImageAttrs(v)} alt="${escapeHtml(v.brand + ' ' + v.model)}"
                             style="width:100%;height:90px;object-fit:cover;border-radius:8px;">
                        <b style="display:block;margin-top:6px;">${escapeHtml(v.brand)} ${escapeHtml(v.model)}</b>
                        <span style="color:var(--primary);font-weight:700;">${formatPrice(v.price)}</span>
                    </div>
                `).join('')}
            </div>
        </div>` : '';

    const modal = document.createElement('div');
    modal.id = 'purchaseSuccessModal';
    modal.className = 'modal-overlay open';
    modal.innerHTML = `
        <div class="modal" style="max-width:720px;">
            <button class="close-btn" onclick="this.closest('.modal-overlay').remove();document.body.style.overflow='';">&times;</button>
            <div style="text-align:center;">
                <div style="font-size:52px;">✅</div>
                <h2>Buy request recorded</h2>
                <p style="color:var(--text-muted);">${escapeHtml(data.message || 'Your request has been saved.')}</p>
                <p><strong>Request #${data.request_id || '—'}</strong></p>
            </div>
            ${recHtml}
            <div style="margin-top:20px;text-align:center;">
                <button class="btn-solid" style="border:0;padding:11px 24px;border-radius:30px;cursor:pointer;"
                    onclick="this.closest('.modal-overlay').remove();document.body.style.overflow='';">Continue browsing</button>
            </div>
        </div>`;
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
}

function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, m => ({
        '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'
    }[m]));
}
