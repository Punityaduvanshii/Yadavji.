// ============================================
//  CONFIGURATION
// ============================================
const API_URL_NUMBER = 'https://true-call-check.vercel.app/api/truecaller?num=';
const API_URL_TELEGRAM = 'https://api-olive-five-53.vercel.app/tg?id=';

// ============================================
//  DOM REFS
// ============================================
const numberInput = document.getElementById('numberInput');
const searchBtn = document.getElementById('searchBtn');
const tgInput = document.getElementById('tgInput');
const tgSearchBtn = document.getElementById('tgSearchBtn');
const resultsContainer = document.getElementById('resultsContainer');
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

// ============================================
//  TAB SWITCHING
// ============================================
tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const tabId = btn.dataset.tab;
        tabContents.forEach(content => {
            content.classList.remove('active');
            if (content.id === `tab-${tabId}`) {
                content.classList.add('active');
            }
        });
        showEmpty();
    });
});

// ============================================
//  UTILITY FUNCTIONS
// ============================================
function cleanNumber(num) {
    return num.replace(/\D/g, '').slice(0, 10);
}

function formatAddress(address) {
    if (!address) return 'N/A';
    return address.replace(/!/g, ', ').replace(/\|/g, ', ').replace(/NA,/g, '').trim();
}

// ============================================
//  COPY FUNCTION (CLEAN FORMAT)
// ============================================
function copyCardData(cardElement) {
    const dataItems = cardElement.querySelectorAll('.data-item');
    let text = '';
    dataItems.forEach(item => {
        const label = item.querySelector('.label')?.textContent || '';
        const value = item.querySelector('.value')?.textContent || '';
        if (label && value) {
            text += `${label}: ${value}\n`;
        }
    });
    // Remove trailing newline
    text = text.trim();
    
    navigator.clipboard.writeText(text).then(() => {
        const btn = cardElement.querySelector('.copy-btn');
        btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
        btn.classList.add('copied');
        setTimeout(() => {
            btn.innerHTML = '<i class="fas fa-copy"></i> Copy All';
            btn.classList.remove('copied');
        }, 3000);
    }).catch(err => {
        console.error('Copy failed:', err);
        // Fallback
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
    });
}

// ============================================
//  CREATE RESULT CARDS (WITH COPY BUTTON)
// ============================================
function createNumberCard(data, searchedNumber) {
    const card = document.createElement('div');
    card.className = 'result-card api-1';
    card.style.animationDelay = '0.1s';

    const name = data.name || data.fname || 'N/A';
    const father = data.father_name || data.fname || 'N/A';
    const address = formatAddress(data.address);
    const mobile = data.mobile || data.num || 'N/A';
    const circle = data.circle || 'N/A';
    const aadhaar = data.DocumentNumber || data.aadhar || 'N/A';
    const alt = data.alt || 'N/A';

    card.innerHTML = `
        <div class="card-header">
            <h3><i class="fas fa-phone" style="margin-right:8px;color:#ffd700;"></i>Number Info</h3>
            <span class="badge">Primary</span>
        </div>
        <div class="data-grid">
            <div class="data-item">
                <span class="label">Searched Number</span>
                <span class="value highlight">${searchedNumber}</span>
            </div>
            <div class="data-item">
                <span class="label">Name</span>
                <span class="value">${name}</span>
            </div>
            <div class="data-item">
                <span class="label">Father</span>
                <span class="value">${father}</span>
            </div>
            <div class="data-item">
                <span class="label">Mobile (Alternative)</span>
                <span class="value alt-highlight">${mobile}</span>
            </div>
            <div class="data-item">
                <span class="label">Circle</span>
                <span class="value">${circle}</span>
            </div>
            <div class="data-item full-width">
                <span class="label">Address</span>
                <span class="value" style="font-size:13px;line-height:1.5;">${address}</span>
            </div>
            <div class="data-item">
                <span class="label">Aadhaar Number</span>
                <span class="value alt-highlight">${aadhaar}</span>
            </div>
            ${alt !== 'N/A' ? `
                <div class="data-item">
                    <span class="label">Alternate</span>
                    <span class="value">${alt}</span>
                </div>
            ` : ''}
        </div>
        <button class="copy-btn" onclick="copyCardData(this.closest('.result-card'))">
            <i class="fas fa-copy"></i> Copy All
        </button>
    `;
    return card;
}

function createTelegramCard(data) {
    const card = document.createElement('div');
    card.className = 'result-card api-tg';
    card.style.animationDelay = '0.1s';

    const number = data.n || 'N/A';
    const country = data.c || 'N/A';
    const countryCode = data.cc || 'N/A';

    card.innerHTML = `
        <div class="card-header">
            <h3><i class="fab fa-telegram" style="margin-right:8px;color:#0088cc;"></i>Telegram ID Lookup</h3>
            <span class="badge tg-badge">Global</span>
        </div>
        <div class="data-grid">
            <div class="data-item">
                <span class="label">Phone Number</span>
                <span class="value tg-highlight">${number}</span>
            </div>
            <div class="data-item">
                <span class="label">Country</span>
                <span class="value">${country}</span>
            </div>
            <div class="data-item">
                <span class="label">Country Code</span>
                <span class="value country-code">${countryCode}</span>
            </div>
        </div>
        <button class="copy-btn" onclick="copyCardData(this.closest('.result-card'))">
            <i class="fas fa-copy"></i> Copy All
        </button>
    `;
    return card;
}

// ============================================
//  LOADING / EMPTY / ERROR STATES
// ============================================
function showLoading() {
    resultsContainer.innerHTML = `
        <div class="loading-spinner">
            <div class="spinner"></div>
            <p>⚡ Summoning YADAVxGOD...</p>
        </div>
    `;
}

function showEmpty() {
    resultsContainer.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-ghost"></i>
            <p>Enter a number or Telegram ID</p>
            <p style="font-size:12px;color:rgba(255,255,255,0.06);margin-top:8px;">Powered by YADAVxGOD Engine</p>
        </div>
    `;
}

function showError(message) {
    resultsContainer.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-exclamation-triangle" style="font-size:32px;color:rgba(255,215,0,0.15);"></i>
            <p style="color:rgba(255,255,255,0.15);">${message}</p>
        </div>
    `;
}

// ============================================
//  API FETCH FUNCTIONS (FIXED)
// ============================================
async function fetchNumberInfo(number) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    try {
        const response = await fetch(`${API_URL_NUMBER}${number}`, {
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        if (!response.ok) throw new Error('Number API failed');
        return await response.json();
    } catch (error) {
        clearTimeout(timeoutId);
        console.error('Number API Error:', error);
        return null;
    }
}

async function fetchTelegramInfo(id) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    try {
        const response = await fetch(`${API_URL_TELEGRAM}${id}`, {
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        if (!response.ok) throw new Error('Telegram API failed');
        const data = await response.json();
        // ✅ FIX: Check if data has the expected structure
        if (data && data.results && data.results.results) {
            return data;
        } else {
            console.warn('Telegram API returned unexpected structure:', data);
            return null;
        }
    } catch (error) {
        clearTimeout(timeoutId);
        console.error('Telegram API Error:', error);
        return null;
    }
}

// ============================================
//  RENDER RESULTS
// ============================================
function renderNumberResults(data, searchedNumber) {
    resultsContainer.innerHTML = '';
    
    if (data && data.data) {
        const mainRecords = data.data.main_records || [];
        const altRecords = data.data.alternative_records || [];

        if (mainRecords.length === 0 && altRecords.length === 0) {
            showError('No data found for this number');
            return;
        }

        mainRecords.forEach(record => {
            if (record.name || record.mobile) {
                const card = createNumberCard(record, searchedNumber);
                resultsContainer.appendChild(card);
            }
        });

        altRecords.forEach(record => {
            if (record.name || record.mobile) {
                const card = createNumberCard(record, searchedNumber);
                resultsContainer.appendChild(card);
            }
        });
    } else {
        showError('Number API not responding');
    }
}

function renderTelegramResults(data) {
    resultsContainer.innerHTML = '';
    
    if (data && data.results && data.results.results) {
        const info = data.results.results;
        if (info.n) {
            const card = createTelegramCard(info);
            resultsContainer.appendChild(card);
        } else {
            showError('No data found for this Telegram ID');
        }
    } else {
        showError('Telegram API not responding');
    }
}

// ============================================
//  SEARCH FUNCTIONS
// ============================================
async function searchNumber() {
    let number = cleanNumber(numberInput.value);
    if (number.length !== 10) {
        showError('Enter exactly 10 digits');
        return;
    }

    showLoading();
    const data = await fetchNumberInfo(number);
    renderNumberResults(data, number);
}

async function searchTelegram() {
    let id = tgInput.value.trim();
    if (!id || isNaN(id)) {
        showError('Enter a valid Telegram User ID (numeric)');
        return;
    }

    showLoading();
    const data = await fetchTelegramInfo(id);
    renderTelegramResults(data);
}

// ============================================
//  EVENT LISTENERS
// ============================================
searchBtn.addEventListener('click', searchNumber);
numberInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchNumber();
});
numberInput.addEventListener('input', () => {
    numberInput.value = cleanNumber(numberInput.value);
});

tgSearchBtn.addEventListener('click', searchTelegram);
tgInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchTelegram();
});

// ============================================
//  INIT
// ============================================
showEmpty();
console.log('👑 YADAVxGOD Number & Telegram Intelligence System Loaded');
console.log('⚡ Dual Engine Active');
console.log('🦚 Developer: уα∂αν נιι (@ydvjii0)');
