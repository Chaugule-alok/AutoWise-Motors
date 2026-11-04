document.addEventListener('DOMContentLoaded', async function () {
  const form = document.getElementById('sellForm');
  if (!form) return;

  const user = getCurrentUser();
  // auth.js loads asynchronously; wait briefly if the session is still loading.
  if (!user && !window.location.search.includes('guest=1')) {
    await new Promise(resolve => setTimeout(resolve, 250));
  }

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const current = getCurrentUser();
    if (!current) {
      const next = encodeURIComponent('sell.html');
      window.location.href = `login.html?next=${next}`;
      return;
    }

    const submit = form.querySelector('.btn-submit');
    const oldText = submit.innerHTML;
    submit.disabled = true;
    submit.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving to database…';

    const fd = new FormData();
    const get = id => document.getElementById(id)?.value || '';
    fd.append('regNumber', get('regNumber'));
    fd.append('brand', get('brand'));
    fd.append('model', get('model'));
    fd.append('year', get('year'));
    fd.append('km', get('km'));
    fd.append('fullName', get('fullName') || current.name);
    fd.append('mobile', get('mobile'));
    fd.append('email', get('email') || current.email);
    fd.append('address', get('address'));
    fd.append('price', get('price'));
    fd.append('category', get('category'));
    fd.append('fuel', get('fuel'));
    fd.append('trans', get('trans'));
    fd.append('city', get('city'));

    const images = document.getElementById('images');
    if (images) Array.from(images.files).forEach(file => fd.append('images', file, file.name));

    try {
      const r = await fetch('/api/seller/listings', {
        method: 'POST',
        credentials: 'same-origin',
        body: fd
      });
      const data = await r.json();
      if (!r.ok) {
        if (data.code === 'LOGIN_REQUIRED') {
          window.location.href = `login.html?next=${encodeURIComponent('sell.html')}`;
          return;
        }
        throw new Error(data.error || 'Could not save listing.');
      }

      const box = document.createElement('div');
      box.style.cssText = 'margin:18px 0;padding:16px 18px;border-radius:12px;background:#dcfce7;color:#166534;font-weight:600;';
      box.innerHTML = `<i class="fas fa-check-circle"></i> ${escapeHtml(data.message)}
        <br><small>Listing ID: ${escapeHtml(String(data.listing.id))} · ${escapeHtml(data.listing.brand)} ${escapeHtml(data.listing.model)}</small>`;
      form.parentNode.insertBefore(box, form);
      form.reset();
    } catch (err) {
      alert(err.message);
    } finally {
      submit.disabled = false;
      submit.innerHTML = oldText;
    }
  });

  function escapeHtml(str) {
    return String(str || '').replace(/[&<>"']/g, c =>
      ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])
    );
  }
});
