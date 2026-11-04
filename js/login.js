document.addEventListener('DOMContentLoaded', () => {
    const tabs = document.querySelectorAll('.tab-btn');
    const forms = document.querySelectorAll('.auth-form');
    const messageBox = document.getElementById('authMessage');

    function setMessage(text, type = 'info') {
        if (!messageBox) return;
        messageBox.textContent = text;
        messageBox.className = `message-box visible ${type}`;
    }

    function clearMessage() {
        if (!messageBox) return;
        messageBox.textContent = '';
        messageBox.className = 'message-box';
    }

    const authCard = document.querySelector('.auth-card');
    function setAuthMode(mode) {
        if (!authCard) return;
        authCard.classList.toggle('signin', mode === 'signin');
        authCard.classList.toggle('signup', mode === 'signup');
    }

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(btn => {
                btn.classList.toggle('active', btn === tab);
                btn.setAttribute('aria-selected', btn === tab ? 'true' : 'false');
            });
            const target = tab.dataset.tab;
            forms.forEach(form => {
                form.classList.toggle('active', form.id === `${target}Form`);
            });
            setAuthMode(target);
            clearMessage();
        });
    });
    setAuthMode('signin');

    const signinForm = document.getElementById('signinForm');
    const signupForm = document.getElementById('signupForm');

    if (signinForm) {
        signinForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const identifier = document.getElementById('signinEmail').value.trim();
            const password = document.getElementById('signinPassword').value.trim();
            if (!identifier || !password) {
                setMessage('Please enter both email/username and password.', 'error');
                return;
            }
            setMessage('Signing in...', 'info');
            const remember = document.getElementById('rememberMe')?.checked !== false;
            const result = await loginUser({ identifier, password, remember });
            if (!result.ok) {
                setMessage(result.error, 'error');
                return;
            }
            setMessage(result.message, 'success');
            setTimeout(() => {
                const next = new URLSearchParams(window.location.search).get('next');
                window.location.href = next || 'index.html';
            }, 500);
        });
    }

    if (signupForm) {
        signupForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const name = document.getElementById('signupName').value.trim();
            const email = document.getElementById('signupEmail').value.trim();
            const username = document.getElementById('signupUsername').value.trim();
            const password = document.getElementById('signupPassword').value.trim();
            const confirm = document.getElementById('signupConfirm').value.trim();

            if (!name || !email || !username || !password || !confirm) {
                setMessage('Please fill out every field to create your account.', 'error');
                return;
            }
            if (password !== confirm) {
                setMessage('Passwords do not match. Please try again.', 'error');
                return;
            }
            setMessage('Creating account...', 'info');
            const result = await signupUser({ name, email, username, password });
            if (!result.ok) {
                setMessage(result.error, 'error');
                return;
            }
            setMessage(result.message, 'success');
            signupForm.reset();
            tabs[0].click();
            setMessage(result.message, 'success');
        });
    }
});

function socialLogin(provider) {
    const message = `${provider} sign-in is not available in offline mode.`;
    const messageBox = document.getElementById('authMessage');
    if (messageBox) {
        messageBox.textContent = message;
        messageBox.className = 'message-box visible info';
    }
    setTimeout(() => {
        alert(`${provider} sign-in needs an online account service. AutoWise stores accounts on this laptop only, so please use the Sign Up form instead.`);
    }, 600);
}