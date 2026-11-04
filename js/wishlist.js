// wishlist.js – render wishlist vehicles
function renderWishlist() {
    const grid = document.getElementById('wishlistGrid');
    const wishIds = getWishlist();
    if (!wishIds.length) {
        grid.innerHTML = `
            <div class="wishlist-empty" style="grid-column:1/-1;">
                <i class="fas fa-heart" style="color:#e74c3c;"></i>
                <h2>Your wishlist is empty</h2>
                <p>Start adding vehicles you love by clicking the heart ❤️ on any listing.</p>
                <a href="buy.html" class="btn-solid" style="display:inline-block;margin-top:16px;padding:12px 32px;border-radius:30px;background:var(--primary);color:#fff;">Browse Vehicles</a>
            </div>
        `;
        return;
    }

    const all = getAllVehicles();
    const wishlistItems = all.filter(v => wishIds.includes(v.id));

    if (!wishlistItems.length) {
        grid.innerHTML = `<p style="grid-column:1/-1;text-align:center;padding:20px;">No matching vehicles found in wishlist.</p>`;
        return;
    }

    grid.innerHTML = wishlistItems.map(v => {
        const mismatchLabel = {
            green: 'Fair Price',
            yellow: 'Overpriced',
            red: '⚠️ Fraud Alert'
        } [v.priceMismatch] || '';
        const damageTags = v.damage && v.damage.length ?
            v.damage.map(d => `<span class="tag damage"><i class="fas fa-exclamation-triangle"></i> ${d}</span>`).join('') :
            `<span class="tag good"><i class="fas fa-check-circle"></i> No damage</span>`;
        const qrId = `AW-${v.id.toUpperCase()}-${String(v.year).slice(-2)}`;
        return `
            <div class="vehicle-card" onclick="openDetail('${v.id}')">
                <button class="wishlist-btn active" data-vid="${v.id}" title="Remove from wishlist" onclick="event.stopPropagation(); removeFromWishlist('${v.id}')">
                    <i class="fas fa-heart"></i>
                </button>
                <div class="img-wrap">
                    <img ${vehicleImageAttrs(v)} alt="${v.brand} ${v.model}" loading="lazy" />
                    <span class="price-tag">${formatPrice(v.price)}</span>
                    <span class="price-mismatch ${v.priceMismatch}">${mismatchLabel}</span>
                </div>
                <div class="card-body">
                    <h3>${v.brand} ${v.model}</h3>
                    <div class="sub">${v.year} · ${v.city} · ${v.owner} owner</div>
                    <div class="specs">
                        <span><i class="fas fa-tachometer-alt"></i> ${v.km.toLocaleString()} km</span>
                        <span><i class="fas fa-gas-pump"></i> ${v.fuel}</span>
                        <span><i class="fas fa-cog"></i> ${v.trans}</span>
                    </div>
                    <div class="features">${damageTags}</div>
                    <div class="qr-row">
                        <i class="fas fa-qrcode"></i>
                        <span class="qr-label">Car Passport</span>
                        <span class="qr-code">${qrId}</span>
                        <span style="margin-left:auto;font-size:12px;color:var(--text-muted);"><i class="fas fa-scan"></i> Scan</span>
                    </div>
                    <button class="btn-detail"><i class="fas fa-arrow-right"></i> View Details</button>
                </div>
            </div>
        `;
    }).join('');
}

function removeFromWishlist(id) {
    toggleWishlist(id);
    updateWishlistBadge();
    renderWishlist();
    // Update any visible wishlist buttons across pages
    if (typeof updateWishlistButtons === 'function') updateWishlistButtons();
}

document.addEventListener('DOMContentLoaded', function() {
    renderWishlist();
    updateWishlistBadge();
});