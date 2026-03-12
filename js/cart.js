// Cart Module
const LOCAL_CART_KEY = 'wellsty_local_cart';

let cartState = {
  items: [],
  totals: { subtotal: 0, shipping: 99, tax: 0, discount: 0, total: 0 }
};

function getLocalCart() {
  try { return JSON.parse(localStorage.getItem(LOCAL_CART_KEY)) || []; } catch { return []; }
}

function saveLocalCart(items) {
  localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(items));
}

function computeLocalTotals(items) {
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const shipping = subtotal > 999 ? 0 : 99;
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + shipping + tax;
  return { subtotal, shipping, tax, discount: 0, total };
}

function formatPrice(n) { return '₹' + Math.round(n).toLocaleString('en-IN'); }

function updateCartCount(count) {
  const el = document.getElementById('cartCount');
  if (el) { el.textContent = count; el.style.display = count > 0 ? 'flex' : 'none'; }
}

function renderCart() {
  const cartItemsEl = document.getElementById('cartItems');
  const cartEmptyEl = document.getElementById('cartEmpty');
  const cartFooterEl = document.getElementById('cartFooter');
  const cartLabelEl = document.getElementById('cartItemsLabel');
  const items = cartState.items;
  const t = cartState.totals;

  if (cartLabelEl) cartLabelEl.textContent = `(${items.length} item${items.length !== 1 ? 's' : ''})`;
  updateCartCount(items.reduce((s, i) => s + i.qty, 0));

  if (!cartItemsEl) return;

  if (!items.length) {
    cartEmptyEl && (cartEmptyEl.style.display = 'flex');
    cartItemsEl.innerHTML = '';
    cartFooterEl && (cartFooterEl.style.display = 'none');
    return;
  }

  cartEmptyEl && (cartEmptyEl.style.display = 'none');
  cartFooterEl && (cartFooterEl.style.display = 'block');

  cartItemsEl.innerHTML = items.map(item => `
    <div class="cart-item" data-id="${item._id || item.localId}">
      <div class="cart-item-img"><img src="${item.image}" alt="${item.name}" loading="lazy"></div>
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-meta">${[item.size, item.color].filter(Boolean).join(' • ')}</div>
        <div class="cart-item-price">${formatPrice(item.price)}</div>
        <div class="cart-item-controls">
          <div class="qty-stepper">
            <button class="qty-btn" onclick="changeQty('${item._id || item.localId}', ${item.qty - 1})">−</button>
            <span class="qty-val">${item.qty}</span>
            <button class="qty-btn" onclick="changeQty('${item._id || item.localId}', ${item.qty + 1})">+</button>
          </div>
          <span class="cart-item-remove" onclick="removeItem('${item._id || item.localId}')"><i class="fas fa-trash"></i> Remove</span>
        </div>
      </div>
    </div>
  `).join('');

  // Update totals
  const set = (id, val) => { const el = document.getElementById(id); if(el) el.textContent = val; };
  set('cartSubtotal', formatPrice(t.subtotal));
  set('cartShipping', t.shipping === 0 ? 'FREE 🎉' : formatPrice(t.shipping));
  set('cartTax', formatPrice(t.tax));
  set('cartTotal', formatPrice(t.total));
  if (t.discount > 0) {
    document.getElementById('discountRow') && (document.getElementById('discountRow').style.display = 'flex');
    set('cartDiscount', '-' + formatPrice(t.discount));
  }
}

async function loadCartFromAPI() {
  const token = localStorage.getItem('wellsty_token');
  if (!token) {
    const items = getLocalCart();
    cartState.items = items;
    cartState.totals = computeLocalTotals(items);
    renderCart();
    return;
  }
  try {
    const data = await api.getCart();
    cartState.items = data.cart.items || [];
    cartState.totals = data.totals || computeLocalTotals(cartState.items);
    renderCart();
  } catch {
    const items = getLocalCart();
    cartState.items = items;
    cartState.totals = computeLocalTotals(items);
    renderCart();
  }
}

async function addToCart(product, qty = 1, size = '', color = '') {
  const token = localStorage.getItem('wellsty_token');
  if (!token) {
    // Local cart fallback
    const items = getLocalCart();
    const existing = items.find(i => i.productId === (product._id || product.id) && i.size === size);
    if (existing) { existing.qty = Math.min(existing.qty + qty, 10); }
    else { items.push({ localId: Date.now().toString(), productId: product._id || product.id, name: product.name, image: product.images[0], price: product.price, qty, size, color }); }
    saveLocalCart(items);
    cartState.items = items;
    cartState.totals = computeLocalTotals(items);
    renderCart();
    showToast(`${product.name} added to bag!`, 'success');
    openCart();
    return;
  }
  try {
    const data = await api.addToCart({ productId: product._id, qty, size, color });
    cartState.items = data.cart.items;
    cartState.totals = data.totals;
    renderCart();
    showToast(`${product.name} added to bag!`, 'success');
    openCart();
  } catch (e) { showToast(e.message, 'error'); }
}

async function changeQty(itemId, qty) {
  const token = localStorage.getItem('wellsty_token');
  if (!token) {
    const items = getLocalCart();
    if (qty <= 0) { const idx = items.findIndex(i => i.localId === itemId); if(idx>-1) items.splice(idx,1); }
    else { const item = items.find(i => i.localId === itemId); if(item) item.qty = Math.min(qty,10); }
    saveLocalCart(items);
    cartState.items = items;
    cartState.totals = computeLocalTotals(items);
    renderCart();
    return;
  }
  try {
    const data = await api.updateCartItem(itemId, qty);
    cartState.items = data.cart.items;
    cartState.totals = data.totals;
    renderCart();
  } catch (e) { showToast(e.message, 'error'); }
}

async function removeItem(itemId) {
  const token = localStorage.getItem('wellsty_token');
  if (!token) {
    const items = getLocalCart().filter(i => i.localId !== itemId);
    saveLocalCart(items);
    cartState.items = items;
    cartState.totals = computeLocalTotals(items);
    renderCart();
    showToast('Item removed', 'info');
    return;
  }
  try {
    const data = await api.removeFromCart(itemId);
    cartState.items = data.cart.items;
    cartState.totals = data.totals;
    renderCart();
    showToast('Item removed', 'info');
  } catch (e) { showToast(e.message, 'error'); }
}

function openCart() {
  document.getElementById('cartSidebar')?.classList.add('open');
  document.getElementById('cartOverlay')?.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  document.getElementById('cartSidebar')?.classList.remove('open');
  document.getElementById('cartOverlay')?.classList.remove('open');
  document.body.style.overflow = '';
}

function initCart() {
  document.getElementById('cartBtn')?.addEventListener('click', openCart);
  document.getElementById('cartClose')?.addEventListener('click', closeCart);
  document.getElementById('cartOverlay')?.addEventListener('click', closeCart);

  document.getElementById('applyCouponBtn')?.addEventListener('click', async () => {
    const code = document.getElementById('couponInput')?.value?.trim();
    if (!code) return;
    const token = localStorage.getItem('wellsty_token');
    if (!token) { showToast('Login to use coupon codes', 'error'); return; }
    try {
      const data = await api.applyCoupon(code);
      cartState.totals = data.totals;
      renderCart();
      showToast(data.message, 'success');
    } catch (e) { showToast(e.message, 'error'); }
  });

  loadCartFromAPI();
}

window.cartState = cartState;
window.addToCart = addToCart;
window.changeQty = changeQty;
window.removeItem = removeItem;
window.openCart = openCart;
window.closeCart = closeCart;
window.loadCartFromAPI = loadCartFromAPI;
window.formatPrice = formatPrice;

document.addEventListener('DOMContentLoaded', initCart);
