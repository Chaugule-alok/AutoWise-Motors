(function() {
    // DOM refs
    const imageZone = document.getElementById('imageZone');
    const imageInput = document.getElementById('imageInput');
    const cameraInput = document.getElementById('cameraInput');
    const cameraBtn = document.getElementById('cameraBtn');
    const uploadBtn = document.getElementById('uploadBtn');
    const mainCaptureBtn = document.getElementById('mainCaptureBtn');
    const previewContainer = document.getElementById('previewContainer');
    const previewImg = document.getElementById('previewImg');
    const overlayCanvas = document.getElementById('overlayCanvas');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const progressFill = document.getElementById('progressFill');
    const loadingText = document.getElementById('loadingText');
    const reanalyzeBtn = document.getElementById('reanalyzeBtn');
    const removeImageBtn = document.getElementById('removeImageBtn');

    const damageResults = document.getElementById('damageResults');
    const damageScore = document.getElementById('damageScore');
    const damageBar = document.getElementById('damageBar');
    const damageStatusDisplay = document.getElementById('damageStatusDisplay');
    const damageAreaList = document.getElementById('damageAreaList');

    const placeholderInfo = document.getElementById('placeholderInfo');
    const vehicleForm = document.getElementById('vehicleForm');
    const getMarketBtn = document.getElementById('getMarketBtn');
    const marketResults = document.getElementById('marketResults');
    const marketPrice = document.getElementById('marketPrice');
    const marketRange = document.getElementById('marketRange');
    const marketConfidence = document.getElementById('marketConfidence');
    const mismatchBox = document.getElementById('mismatchBox');
    const mismatchStatus = document.getElementById('mismatchStatus');
    const mismatchDetail = document.getElementById('mismatchDetail');
    const dropPredictionGrid = document.getElementById('dropPredictionGrid');
    const dropSummary = document.getElementById('dropSummary');

    let dropChartInstance = null;
    let currentImageFile = null;
    let damageData = null;  // store damage results from first call

    // Upload triggers
    uploadBtn.addEventListener('click', (e) => { e.stopPropagation(); imageInput.click(); });
    cameraBtn.addEventListener('click', (e) => { e.stopPropagation(); cameraInput.click(); });
    mainCaptureBtn.addEventListener('click', () => { cameraInput.click(); });
    imageZone.addEventListener('click', (e) => { if (!e.target.closest('button')) imageInput.click(); });

    imageInput.addEventListener('change', (e) => { if (e.target.files.length) handleFile(e.target.files[0]); e.target.value = ''; });
    cameraInput.addEventListener('change', (e) => { if (e.target.files.length) handleFile(e.target.files[0]); e.target.value = ''; });

    // Drag & drop
    imageZone.addEventListener('dragover', (e) => { e.preventDefault(); imageZone.classList.add('dragover'); });
    imageZone.addEventListener('dragleave', () => { imageZone.classList.remove('dragover'); });
    imageZone.addEventListener('drop', (e) => {
        e.preventDefault();
        imageZone.classList.remove('dragover');
        if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
    });

    function handleFile(file) {
        if (!file.type.startsWith('image/')) { alert('Please upload an image.'); return; }
        if (file.size > 10 * 1024 * 1024) { alert('Image too large (max 10MB).'); return; }
        currentImageFile = file;
        const reader = new FileReader();
        reader.onload = (e) => {
            previewImg.src = e.target.result;
            previewContainer.classList.remove('hidden');
            placeholderInfo.classList.add('hidden');
            vehicleForm.classList.add('hidden'); // hide until damage results come
            marketResults.classList.add('hidden');
            damageResults.classList.add('hidden');
            // Send only image to get damage detection
            detectDamage(file);
        };
        reader.readAsDataURL(file);
    }

    function detectDamage(file) {
        loadingOverlay.classList.add('active');
        progressFill.style.width = '0%';
        loadingText.textContent = 'Detecting damage...';

        const formData = new FormData();
        formData.append('image', file);

        fetch('/analyze', { method: 'POST', body: formData })
            .then(response => response.json())
            .then(data => {
                loadingOverlay.classList.remove('active');
                if (data.error) { alert('Server error: ' + data.error); return; }
                // Store damage data
                damageData = data.damage;
                displayDamage(damageData);
                // Show vehicle form
                vehicleForm.classList.remove('hidden');
                // Clear previous market results
                marketResults.classList.add('hidden');
                if (dropChartInstance) { dropChartInstance.destroy(); dropChartInstance = null; }
            })
            .catch(err => {
                loadingOverlay.classList.remove('active');
                alert('Error: ' + err.message);
            });
    }

    function displayDamage(damage) {
        damageResults.classList.remove('hidden');
        const conf = damage.confidence;
        damageScore.textContent = conf + '%';
        damageBar.style.width = conf + '%';
        let statusClass = 'low';
        if (conf > 70) statusClass = 'high';
        else if (conf > 40) statusClass = 'medium';
        damageStatusDisplay.innerHTML = `<span class="damage-tag ${statusClass}">${damage.status}</span>`;
        damageAreaList.innerHTML = damage.areas.map(a => `<span>${a}</span>`).join('') || '<span class="text-muted">No damage detected</span>';

        drawBoundingBoxes(damage.areas.length);
    }

    // Get Market Value button
    getMarketBtn.addEventListener('click', function() {
        if (!currentImageFile) {
            alert('Please upload an image first.');
            return;
        }
        // Gather vehicle data
        const vehicle = {
            make: document.getElementById('make').value,
            model: document.getElementById('model').value,
            year: parseInt(document.getElementById('year').value) || 2020,
            color: document.getElementById('color').value,
            km: parseInt(document.getElementById('km').value) || 0,
            owner: document.getElementById('owner').value,
            listed_price: parseFloat(document.getElementById('listedPrice').value) || 0
        };

        // Send image + vehicle data
        loadingOverlay.classList.add('active');
        progressFill.style.width = '0%';
        loadingText.textContent = 'Calculating market value...';

        const formData = new FormData();
        formData.append('image', currentImageFile);
        for (let key in vehicle) {
            formData.append(key, vehicle[key]);
        }

        fetch('/analyze', { method: 'POST', body: formData })
            .then(response => response.json())
            .then(data => {
                loadingOverlay.classList.remove('active');
                if (data.error) { alert('Server error: ' + data.error); return; }
                displayFullResults(data);
            })
            .catch(err => {
                loadingOverlay.classList.remove('active');
                alert('Error: ' + err.message);
            });
    });

    function displayFullResults(data) {
        // Market value
        marketResults.classList.remove('hidden');
        const m = data.market.inr;
        marketPrice.textContent = m.value.toLocaleString();
        marketRange.textContent = 'Range: ₹' + m.range_low.toLocaleString() + ' – ₹' + m.range_high.toLocaleString();
        marketConfidence.textContent = 'Confidence ' + data.market.usd.value + '%'; // could use a separate confidence

        // Mismatch alert
        const mismatch = data.mismatch;
        const colorMap = { green: 'success', yellow: 'warning', red: 'danger' };
        mismatchStatus.textContent = mismatch.status;
        mismatchStatus.className = 'alert-badge ' + colorMap[mismatch.color] || '';
        const diffSign = mismatch.diff > 0 ? '+' : '';
        mismatchDetail.textContent = `Listed: ₹${mismatch.listed.toLocaleString()} | Market: ₹${mismatch.market.toLocaleString()} | Difference: ${diffSign}₹${mismatch.diff.toLocaleString()} (${mismatch.percent.toFixed(1)}%)`;

        // Price Drop Prediction
        const pred = data.prediction;
        dropPredictionGrid.innerHTML = pred.intervals.map(item => {
            const isDown = item.change < 0;
            const sign = isDown ? '' : '+';
            return `<div class="drop-card">
                        <div class="period">${item.label}</div>
                        <div class="drop-value ${isDown ? 'down' : 'up'}">₹${item.value.toLocaleString()}</div>
                        <div class="drop-percent ${isDown ? 'down' : 'up'}">${sign}${item.change.toFixed(1)}%</div>
                    </div>`;
        }).join('');

        const totalChange = ((pred.forecast[pred.forecast.length - 1] - pred.base_price) / pred.base_price * 100);
        document.getElementById('dropSummary').innerHTML = `
                    <div class="pred-item"><div class="num ${totalChange < 0 ? 'down' : 'up'}">${totalChange < 0 ? '' : '+'}${totalChange.toFixed(1)}%</div><div class="lbl">30-day change</div></div>
                    <div class="pred-item"><div class="num">₹${pred.base_price.toLocaleString()}</div><div class="lbl">Current value</div></div>
                    <div class="pred-item"><div class="num">${pred.intervals[0].change.toFixed(1)}%</div><div class="lbl">7-day trend</div></div>
                `;

        // Chart
        const ctx = document.getElementById('dropChart').getContext('2d');
        if (dropChartInstance) dropChartInstance.destroy();
        dropChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: Array.from({ length: 31 }, (_, i) => i + 'd'),
                datasets: [
                    { label: 'Predicted Price (INR)', data: pred.forecast, borderColor: '#1a73e8', backgroundColor: 'rgba(26,115,232,0.06)', fill: true, tension: 0.3, pointRadius: 1, borderWidth: 2.5 },
                    { label: 'Current Value', data: Array(31).fill(pred.base_price), borderColor: '#d93025', borderDash: [6, 4], borderWidth: 1.5, pointRadius: 0, fill: false }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { labels: { font: { size: 10 }, boxWidth: 12, padding: 8 } } },
                scales: {
                    x: { grid: { display: false }, ticks: { maxTicksLimit: 10, font: { size: 9 } } },
                    y: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { callback: (v) => '₹' + v.toLocaleString(), font: { size: 9 } } }
                }
            }
        });
    }

    function drawBoundingBoxes(count) {
        const img = previewImg;
        const canvas = overlayCanvas;
        const ctx = canvas.getContext('2d');
        const w = img.clientWidth || img.naturalWidth || 400;
        const h = img.clientHeight || img.naturalHeight || 300;
        canvas.width = w;
        canvas.height = h;
        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';
        ctx.clearRect(0, 0, w, h);

        if (count === 0) {
            ctx.fillStyle = 'rgba(13,158,110,0.12)';
            ctx.strokeStyle = '#0d9e6e';
            ctx.lineWidth = 2;
            ctx.setLineDash([6, 6]);
            ctx.strokeRect(10, 10, w - 20, h - 20);
            ctx.setLineDash([]);
            ctx.fillStyle = '#0d9e6e';
            ctx.font = 'bold 14px Inter, sans-serif';
            ctx.fillText('✓ No damage detected', 20, 36);
            return;
        }

        const colors = ['#d93025', '#ff6b5a', '#e37400', '#d93025', '#ff6b5a'];
        for (let i = 0; i < Math.min(count, 5); i++) {
            const x = 20 + Math.random() * (w - 120);
            const y = 20 + Math.random() * (h - 120);
            const bw = 50 + Math.random() * 80;
            const bh = 40 + Math.random() * 70;
            const color = colors[i % colors.length];
            ctx.shadowColor = 'rgba(217,48,37,0.25)';
            ctx.shadowBlur = 12;
            ctx.strokeStyle = color;
            ctx.lineWidth = 3;
            ctx.strokeRect(x, y, bw, bh);
            ctx.shadowBlur = 0;
            ctx.fillStyle = color + '30';
            ctx.fillRect(x, y, bw, bh);
            ctx.fillStyle = color;
            ctx.font = 'bold 11px Inter, sans-serif';
            ctx.fillText('⚠ damage', x + 4, y - 6);
        }
    }

    // Re-analyze
    reanalyzeBtn.addEventListener('click', () => {
        if (currentImageFile) {
            detectDamage(currentImageFile);
        }
    });

    removeImageBtn.addEventListener('click', () => {
        previewContainer.classList.add('hidden');
        placeholderInfo.classList.remove('hidden');
        vehicleForm.classList.add('hidden');
        marketResults.classList.add('hidden');
        damageResults.classList.add('hidden');
        currentImageFile = null;
        damageData = null;
        const ctx = overlayCanvas.getContext('2d');
        ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
        previewImg.src = '';
        if (dropChartInstance) { dropChartInstance.destroy(); dropChartInstance = null; }
    });
})();