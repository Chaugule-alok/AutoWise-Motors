// AutoWise database authentication.
// Accounts are stored in SQLite through Flask; passwords are hashed server-side.
// The browser keeps only the secure Flask session cookie.

let currentUser = null;
let authReady = false;

async function loadCurrentUser() {
    try {
        const r = await fetch('/api/auth/me', { credentials: 'same-origin', cache: 'no-store' });
        const data = await r.json();
        currentUser = data.user || null;
    } catch (err) {
        currentUser = null;
    }
    authReady = true;
    if (typeof updateAuthHeader === 'function') updateAuthHeader();
    return currentUser;
}

function getCurrentUser() {
    return currentUser;
}

async function signupUser({ name, email, username, password }) {
    try {
        const r = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify({ name, email, username, password })
        });
        const data = await r.json();
        return r.ok ? { ok: true, message: data.message } : { ok: false, error: data.error || 'Signup failed.' };
    } catch (err) {
        return { ok: false, error: 'AutoWise server is not running. Start server.py first.' };
    }
}

async function loginUser({ identifier, password, remember = true }) {
    try {
        const r = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify({ identifier, password, remember })
        });
        const data = await r.json();
        if (!r.ok) return { ok: false, error: data.error || 'Login failed.' };
        currentUser = data.user || null;
        if (typeof updateAuthHeader === 'function') updateAuthHeader();
        return { ok: true, message: data.message, user: currentUser };
    } catch (err) {
        return { ok: false, error: 'AutoWise server is not running. Start server.py first.' };
    }
}

async function logoutUser() {
    try {
        await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' });
    } finally {
        currentUser = null;
        updateAuthHeader();
        window.location.href = 'login.html';
    }
}

document.addEventListener('DOMContentLoaded', loadCurrentUser);
