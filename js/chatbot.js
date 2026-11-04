// chatbot.js – AutoWise assistant. Loaded on every page; it builds its own
// button and window, keeps the conversation in localStorage and can answer
// from the live vehicle catalog (cheapest car, bikes under a budget, ...).

const CHAT_HISTORY_KEY = 'autowise_chat_history';

const chatbotRules = [
    { keys: ['hello', 'hi ', 'hii', 'hey', 'namaste'], reply: 'Hello! 👋 I am your AutoWise assistant. Ask me about prices, buying, selling, wishlist or the Car AI tool.' },
    { keys: ['help', 'what can you do', 'options'], reply: 'I can help you with:\n• Prices – say "price"\n• Buying – say "buy"\n• Selling – say "sell"\n• Damage check – say "damage"\n• Wishlist – say "wishlist"\n• Login – say "login"\n• Car AI tool – say "car ai"\nYou can also ask things like "cheapest car" or "bikes under 100000".' },
    { keys: ['price', 'value', 'estimate', 'worth'], reply: 'Use the Market Price Estimator on the Home page – it uses year, KM, services and accidents. Every listing also shows a Price Mismatch badge: green = fair, yellow = overpriced, red = suspicious.' },
    { keys: ['sell'], reply: 'Go to the Sell page, fill in your vehicle details and upload photos. You will get an estimated price straight away.' },
    { keys: ['buy', 'search', 'find', 'browse'], reply: 'Open the Buy page. Use the filters (type, fuel, KM, year, price) or the search box, and press "See more" in any section to load the full list.' },
    { keys: ['damage', 'dent', 'scratch', 'accident'], reply: 'The AI Damage Detector lives in the Car AI tool. Click the yellow "Upload More Details to Get Best Price" button on the Home page, upload a photo and it reports damaged parts with a confidence score.' },
    { keys: ['car ai', 'car-ai', 'yellow button', 'estimator tool'], reply: 'Car AI is a small Python app. Start it once with:\n    cd Car-Ai\n    python app.py\nThen press the yellow button on the Home page and it opens at http://127.0.0.1:5000.' },
    { keys: ['wishlist', 'favourite', 'favorite', 'heart'], reply: 'Tap the heart ❤️ on any vehicle card – it turns red and the number next to the heart in the header goes up. Open the Wishlist page from the header to see everything you saved.' },
    { keys: ['login', 'sign in', 'sign up', 'account', 'register', 'password'], reply: 'AutoWise keeps accounts on your own laptop – no database or internet needed. Create one on the Login page (Sign Up tab) and you stay signed in on every page until you press Logout.' },
    { keys: ['see more', 'see less', 'expand'], reply: 'Every section shows 8 vehicles. Press "See more" to expand the whole section and "See less" to collapse it again.' },
    { keys: ['image', 'photo', 'picture'], reply: 'Photos are set manually in js/images.js. Put your files in the Images folder and add the paths under the vehicle id, for example:\n    c1: ["Images/Suzuki/front.png", "Images/Suzuki/side.png"]' },
    { keys: ['future value', 'depreciation', 'resale'], reply: 'Each detail page shows the estimated value after 3 years, based on age, KM and condition.' },
    { keys: ['qr', 'passport'], reply: 'Every vehicle has a QR Car Passport code (for example AW-C1-20) that links its price, damage report and ownership history.' },
    { keys: ['contact', 'support', 'phone'], reply: 'Use the Contact Us page, or call the seller directly from any vehicle detail page.' },
    { keys: ['thanks', 'thank you', 'thnx'], reply: 'You are welcome! 😊 Happy to help – drive safe!' },
    { keys: ['bye', 'goodbye'], reply: 'Bye! Come back any time you need help choosing a vehicle. 👋' }
];

const CHAT_SUGGESTIONS = ['Cheapest car', 'Bikes under 100000', 'How do I sell?', 'Open Car AI', 'Help'];

function formatChatPrice(amount) {
    return typeof formatPrice === 'function' ? formatPrice(amount) : `₹${amount}`;
}

// Answers questions that need the live catalog, e.g. "cheapest car",
// "bikes under 100000", "show me trucks".
function catalogAnswer(text) {
    if (typeof getAllVehicles !== 'function') return null;

    const catMatch = text.match(/\b(car|bike|truck)s?\b/);
    if (!catMatch) return null;
    const cat = catMatch[1];

    let list = getAllVehicles().filter(v => v._cat === cat);
    if (!list.length) return null;

    const budget = text.match(/(?:under|below|less than|budget)\s*(?:rs\.?|₹)?\s*([\d,]{4,})/);
    if (budget) {
        const limit = parseInt(budget[1].replace(/,/g, ''), 10);
        list = list.filter(v => v.price <= limit).sort((a, b) => a.price - b.price);
        if (!list.length) return `I could not find any ${cat} under ${formatChatPrice(limit)}. Try a higher budget.`;
        const top = list.slice(0, 3)
            .map(v => `• ${v.brand} ${v.model} (${v.year}) – ${formatChatPrice(v.price)}`)
            .join('\n');
        return `${list.length} ${cat}s are under ${formatChatPrice(limit)}. The best value ones:\n${top}\nOpen the Buy page to see them all.`;
    }

    if (/cheap|lowest|budget|affordable/.test(text)) {
        const v = list.reduce((a, b) => (a.price <= b.price ? a : b));
        return `The cheapest ${cat} right now is the ${v.brand} ${v.model} (${v.year}, ${v.city}) at ${formatChatPrice(v.price)}.`;
    }
    if (/expensive|costly|highest|premium|best/.test(text)) {
        const v = list.reduce((a, b) => (a.price >= b.price ? a : b));
        return `The most premium ${cat} listed is the ${v.brand} ${v.model} (${v.year}) at ${formatChatPrice(v.price)}.`;
    }
    if (/how many|count|total/.test(text)) {
        return `We currently have ${list.length} ${cat}s listed on the Buy page.`;
    }
    return null;
}

function getChatbotResponse(input) {
    const text = ` ${input.toLowerCase().trim()} `;

    const fromCatalog = catalogAnswer(text);
    if (fromCatalog) return fromCatalog;

    const rule = chatbotRules.find(r => r.keys.some(k => text.includes(k)));
    if (rule) return rule.reply;

    return 'I did not understand that one. Try "price", "buy", "sell", "damage", "wishlist", "login", "car ai" – or ask something like "cheapest car".';
}

// ===== UI =====
let chatOpen = false;

function getChatHistory() {
    try {
        return JSON.parse(sessionStorage.getItem(CHAT_HISTORY_KEY) || '[]');
    } catch (err) {
        return [];
    }
}

function saveChatHistory(history) {
    sessionStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(history.slice(-40)));
}

function toggleChat() {
    const win = document.getElementById('chatWindow');
    const toggleBtn = document.getElementById('chatToggle');
    if (!win || !toggleBtn) return;

    chatOpen = !chatOpen;
    win.classList.toggle('open', chatOpen);
    toggleBtn.innerHTML = chatOpen ? '<i class="fas fa-times"></i>' : '<i class="fas fa-comment-dots"></i>';
    toggleBtn.setAttribute('aria-label', chatOpen ? 'Close chat' : 'Open chat');

    if (chatOpen) {
        document.getElementById('chatInput').focus();
        if (!document.getElementById('chatMessages').children.length) {
            addChatMessage('bot', 'Hello! 👋 I am the AutoWise assistant. Ask me anything, or pick one of the buttons below.');
        }
    }
}

function sendChatMessage(preset) {
    const input = document.getElementById('chatInput');
    const text = (preset || input.value).trim();
    if (!text) return;

    addChatMessage('user', text);
    input.value = '';

    const typing = addChatMessage('bot', '…');
    typing.classList.add('typing');
    setTimeout(() => {
        typing.classList.remove('typing');
        typing.textContent = getChatbotResponse(text);
        const container = document.getElementById('chatMessages');
        container.scrollTop = container.scrollHeight;
        const history = getChatHistory();
        history.push({ type: 'bot', text: typing.textContent });
        saveChatHistory(history);
    }, 450);
}

function addChatMessage(type, text, remember = true) {
    const container = document.getElementById('chatMessages');
    const div = document.createElement('div');
    div.className = `message ${type}`;
    div.textContent = text;
    div.style.whiteSpace = 'pre-line';
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;

    if (remember && text !== '…') {
        const history = getChatHistory();
        history.push({ type, text });
        saveChatHistory(history);
    }
    return div;
}

function buildChatbot() {
    if (document.getElementById('chatToggle') && document.getElementById('chatWindow')) return;

    let toggleBtn = document.getElementById('chatToggle');
    if (!toggleBtn) {
        toggleBtn = document.createElement('button');
        toggleBtn.className = 'chatbot-toggle';
        toggleBtn.id = 'chatToggle';
        toggleBtn.type = 'button';
        toggleBtn.setAttribute('aria-label', 'Open chat');
        toggleBtn.innerHTML = '<i class="fas fa-comment-dots"></i>';
        document.body.appendChild(toggleBtn);
    }
    toggleBtn.onclick = toggleChat;
    if (toggleBtn.parentNode !== document.body) document.body.appendChild(toggleBtn);

    let chatWindow = document.getElementById('chatWindow');
    if (!chatWindow) {
        chatWindow = document.createElement('div');
        chatWindow.className = 'chatbot-window';
        chatWindow.id = 'chatWindow';
        chatWindow.innerHTML = `
            <div class="chatbot-header">
                <span>💬 AutoWise Assistant</span>
                <button class="close-chat" type="button" onclick="toggleChat()">&times;</button>
            </div>
            <div class="chatbot-messages" id="chatMessages"></div>
            <div class="chatbot-suggestions" id="chatSuggestions">
                ${CHAT_SUGGESTIONS.map(s => `<button type="button" onclick="sendChatMessage('${s}')">${s}</button>`).join('')}
            </div>
            <div class="chatbot-input-area">
                <input type="text" id="chatInput" placeholder="Ask me anything..." autocomplete="off" />
                <button type="button" onclick="sendChatMessage()">Send</button>
            </div>
        `;
        document.body.appendChild(chatWindow);
    }
    if (chatWindow.parentNode !== document.body) document.body.appendChild(chatWindow);

    const input = document.getElementById('chatInput');
    input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') sendChatMessage();
    });

    // Restore the conversation so it continues when the user changes page.
    getChatHistory().forEach(m => addChatMessage(m.type, m.text, false));
}

document.addEventListener('DOMContentLoaded', buildChatbot);
