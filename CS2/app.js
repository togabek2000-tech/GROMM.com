// State Management
let currentCurrency = 'RUB';
let discountMultiplier = 1.0;
let verifiedId = '';
let activePackage = null;

// Pricing: 3-4 Rubles cheaper than secreti4 rates
const UC_PACKAGES = [
  { id: 'uc_60', uc: 60, bonus: 0, rub: 85, uzs: 11900, usd: 0.89, tag: 'Starter', cat: 'all', img: '📦' },
  { id: 'uc_325', uc: 300, bonus: 25, rub: 445, uzs: 62000, usd: 4.65, tag: 'Popular', cat: 'popular', img: '🪙' },
  { id: 'uc_660', uc: 600, bonus: 60, rub: 875, uzs: 122000, usd: 9.15, tag: 'Royale Pass', cat: 'pass', popular: true, img: '🎫' },
  { id: 'uc_1800', uc: 1500, bonus: 300, rub: 2195, uzs: 307000, usd: 22.95, tag: 'Hot Deal', cat: 'popular', img: '💎' },
  { id: 'uc_3850', uc: 3000, bonus: 850, rub: 4345, uzs: 608000, usd: 45.50, tag: 'Elite Plus', cat: 'pass', img: '👑' },
  { id: 'uc_8100', uc: 6000, bonus: 2100, rub: 8695, uzs: 1217000, usd: 91.00, tag: 'Best Value', cat: 'popular', bestValue: true, img: '🏆' },
  { id: 'uc_16200', uc: 12000, bonus: 4200, rub: 17295, uzs: 2420000, usd: 181.00, tag: 'Mythic Pack', cat: 'all', img: '🔥' },
  { id: 'uc_32400', uc: 24000, bonus: 8400, rub: 34495, uzs: 4825000, usd: 361.00, tag: 'Titan Whale', cat: 'all', img: '⚡' }
];

function formatPrice(pack) {
  if (currentCurrency === 'RUB') {
    return Math.round(pack.rub * discountMultiplier).toLocaleString() + ' ₽';
  } else if (currentCurrency === 'UZS') {
    return (Math.round((pack.uzs * discountMultiplier) / 500) * 500).toLocaleString() + ' UZS';
  } else {
    return '$' + (pack.usd * discountMultiplier).toFixed(2);
  }
}

function renderProducts(filter = 'all') {
  const container = document.getElementById('productGrid');
  if (!container) return;
  container.innerHTML = '';

  const filtered = UC_PACKAGES.filter(p => filter === 'all' || p.cat === filter || (filter === 'popular' && p.popular));

  filtered.forEach(p => {
    const totalUC = p.uc + p.bonus;
    const card = document.createElement('div');
    card.className = `relative bg-brand-card/80 border ${p.popular ? 'border-brand-accent shadow-lg shadow-brand-accent/10' : 'border-brand-border/80'} rounded-2xl p-5 flex flex-col justify-between card-glow`;

    card.innerHTML = `
      ${p.tag ? `
        <div class="absolute -top-3 right-4 bg-gradient-to-r ${p.popular ? 'from-brand-accent to-emerald-400 text-black' : 'from-brand-border to-brand-card text-brand-accent border border-brand-accent/30'} px-2.5 py-0.5 rounded-full text-[11px] font-orbitron font-bold uppercase tracking-wider shadow">
          ${p.tag}
        </div>
      ` : ''}

      <div>
        <div class="flex items-center justify-between mb-3">
          <span class="text-3xl">${p.img}</span>
          <span class="text-[10px] font-mono text-brand-accent bg-brand-accent/10 px-2 py-0.5 rounded">Lowest Price</span>
        </div>

        <div class="font-orbitron font-black text-2xl text-white tracking-wide">
          ${totalUC.toLocaleString()} <span class="text-brand-accent text-lg">UC</span>
        </div>

        ${p.bonus > 0 ? `
          <div class="text-xs text-brand-accent font-semibold mt-0.5">
            ${p.uc} + <span class="underline">${p.bonus} Free Bonus</span>
          </div>
        ` : `
          <div class="text-xs text-gray-500 mt-0.5">Direct top-up</div>
        `}
      </div>

      <div class="mt-6 pt-4 border-t border-brand-border/60 flex items-center justify-between">
        <div>
          <div class="text-[10px] uppercase font-rajdhani text-gray-400 font-bold">Price</div>
          <div class="font-orbitron font-bold text-lg text-white">${formatPrice(p)}</div>
        </div>

        <button onclick="openModal('${p.id}')" 
                class="px-4 py-2 bg-brand-accent/15 hover:bg-brand-accent text-brand-accent hover:text-black font-rajdhani font-bold text-sm uppercase rounded-xl border border-brand-accent/40 transition-all flex items-center space-x-1.5 shadow-sm">
          <span>Checkout</span>
          <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
        </button>
      </div>
    `;
    container.appendChild(card);
  });

  if (window.lucide) lucide.createIcons();
}

function setCurrency(curr) {
  currentCurrency = curr;
  document.querySelectorAll('.curr-btn').forEach(btn => {
    btn.classList.remove('active-curr', 'text-black');
    btn.classList.add('text-gray-400');
  });
  const activeBtn = document.getElementById(`curr-${curr}`);
  if (activeBtn) {
    activeBtn.classList.add('active-curr');
    activeBtn.classList.remove('text-gray-400');
  }
  renderProducts();
  updateCalculator();
}

function filterPacks(cat) {
  document.querySelectorAll('.pack-filter-btn').forEach(b => {
    b.classList.remove('active-filter');
    b.classList.add('text-gray-400');
  });
  const btn = document.querySelector(`[data-cat="${cat}"]`);
  if (btn) {
    btn.classList.add('active-filter');
    btn.classList.remove('text-gray-400');
  }
  renderProducts(cat);
}

function verifyPlayerId() {
  const input = document.getElementById('globalPlayerId');
  const msg = document.getElementById('idStatusMessage');
  const val = input.value.trim();

  if (!/^[0-9]{7,15}$/.test(val)) {
    msg.className = 'mt-2 text-xs font-semibold pl-4 sm:pl-16 text-red-400 block';
    msg.textContent = 'Invalid PUBG ID. Please enter between 7 and 15 numbers.';
    return false;
  }
  verifiedId = val;
  msg.className = 'mt-2 text-xs font-semibold pl-4 sm:pl-16 text-brand-accent block';
  msg.textContent = `Player ID #${val} verified & ready for automatic recharge!`;
  return true;
}

const rangeInput = document.getElementById('calcRangeInput');
const numInput = document.getElementById('calcNumberInput');
const totalElem = document.getElementById('calcTotalAmount');
const badgeElem = document.getElementById('calcCurrencyBadge');

function updateCalculator() {
  if (!numInput || !totalElem) return;
  const uc = parseInt(numInput.value) || 0;
  const rubPrice = uc * 1.32;

  if (currentCurrency === 'RUB') {
    totalElem.textContent = Math.round(rubPrice * discountMultiplier).toLocaleString();
    badgeElem.textContent = 'RUB (₽)';
  } else if (currentCurrency === 'UZS') {
    const uzsPrice = Math.round((rubPrice * 140 * discountMultiplier) / 500) * 500;
    totalElem.textContent = uzsPrice.toLocaleString();
    badgeElem.textContent = 'UZS';
  } else {
    const usdPrice = (rubPrice / 95 * discountMultiplier).toFixed(2);
    totalElem.textContent = '$' + usdPrice;
    badgeElem.textContent = 'USD';
  }
}

if (rangeInput && numInput) {
  rangeInput.addEventListener('input', (e) => {
    numInput.value = e.target.value;
    updateCalculator();
  });
  numInput.addEventListener('input', (e) => {
    rangeInput.value = e.target.value;
    updateCalculator();
  });
}

function orderCustomCalculatedUC() {
  const uc = parseInt(numInput.value) || 60;
  activePackage = {
    id: 'custom',
    uc: uc,
    bonus: 0,
    name: `${uc.toLocaleString()} UC (Custom Pack)`,
    priceStr: totalElem.textContent + ' ' + badgeElem.textContent
  };
  openModal('custom');
}

function openModal(packId) {
  const modal = document.getElementById('checkoutModal');
  const modalPackName = document.getElementById('modalPackName');
  const modalPackPrice = document.getElementById('modalPackPrice');
  const modalPlayerId = document.getElementById('modalPlayerId');

  if (packId === 'custom') {
    modalPackName.textContent = activePackage.name;
    modalPackPrice.textContent = activePackage.priceStr;
  } else {
    const p = UC_PACKAGES.find(item => item.id === packId);
    activePackage = p;
    modalPackName.textContent = `${(p.uc + p.bonus).toLocaleString()} UC Pack`;
    modalPackPrice.textContent = formatPrice(p);
  }

  const globalId = document.getElementById('globalPlayerId').value.trim();
  if (globalId) {
    modalPlayerId.value = globalId;
  } else if (verifiedId) {
    modalPlayerId.value = verifiedId;
  }

  modal.classList.remove('hidden');
  setTimeout(() => {
    modal.classList.remove('opacity-0');
  }, 10);
}

function closeModal() {
  const modal = document.getElementById('checkoutModal');
  modal.classList.add('opacity-0');
  setTimeout(() => {
    modal.classList.add('hidden');
  }, 250);
}

function applyPromo() {
  const code = document.getElementById('promoCode').value.trim().toUpperCase();
  const notice = document.getElementById('promoNotice');
  if (code === 'OGABEK' || code === 'DASTURCHI') {
    discountMultiplier = 0.95;
    notice.classList.remove('hidden');
    notice.textContent = `Promo "${code}" applied: extra 5% discount activated!`;
    renderProducts();
    updateCalculator();
    if (activePackage) {
      if (activePackage.id === 'custom') {
        orderCustomCalculatedUC();
      } else {
        openModal(activePackage.id);
      }
    }
  } else {
    alert('Invalid coupon code. Try: OGABEK');
  }
}

// АВТОМАТИЧЕСКАЯ ОБРАБОТКА ОПЛАТЫ (БАНК, КЛИК, КРИПТА)
function processOnlinePayment() {
  const playerIdInput = document.getElementById('modalPlayerId');
  const err = document.getElementById('modalIdError');
  const pId = playerIdInput.value.trim();

  if (!/^[0-9]{7,15}$/.test(pId)) {
    err.classList.remove('hidden');
    playerIdInput.focus();
    return;
  }
  err.classList.add('hidden');

  const selectedGateway = document.querySelector('input[name="payGateway"]:checked')?.value || 'click_uzum';
  const packTitle = document.getElementById('modalPackName').textContent;
  const finalPrice = document.getElementById('modalPackPrice').textContent;
  const numericPrice = parseFloat(finalPrice.replace(/[^0-9.]/g, ''));

  // 1. ПРИЛОЖЕНИЕ CLICK / UZUM / PAYME
  if (selectedGateway === 'click_uzum') {
    // Ссылка на оплату счета в приложении Click/Uzum:
    const clickPaymentUrl = `https://my.click.uz/services/pay?service_id=YOUR_SERVICE_ID&merchant_id=YOUR_MERCHANT_ID&amount=${numericPrice}&transaction_param=${pId}`;
    
    alert(`Перенаправление в платёжное приложение Click / Uzum на сумму ${finalPrice}...\nPlayer ID: ${pId}`);
    window.location.href = clickPaymentUrl;
    return;
  }

  // 2. БАНКОВСКИЕ КАРТЫ И СБП (Шлюз Aaio / FreeKassa / Payeer)
  if (selectedGateway === 'card_online') {
    const cardGatewayUrl = `https://aaio.so/merchant/pay?merchant_id=YOUR_MERCHANT_ID&amount=${numericPrice}&order_id=${pId}_${Date.now()}`;
    
    alert(`Переход на защищённый шлюз оплаты картой на сумму ${finalPrice}...\nPlayer ID: ${pId}`);
    window.location.href = cardGatewayUrl;
    return;
  }

  // 3. АВТОМАТИЧЕСКИЙ КРИПТО-СЧЁТ (CryptoBot / Cryptomus)
  if (selectedGateway === 'crypto_bot') {
    const cryptoUrl = `https://t.me/CryptoBot?start=invoice_${pId}_${numericPrice}`;
    
    alert(`Открытие инвойса CryptoBot на сумму ${finalPrice}...\nPlayer ID: ${pId}`);
    window.location.href = cryptoUrl;
    return;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  renderProducts();
  updateCalculator();
  if (window.lucide) lucide.createIcons();
});