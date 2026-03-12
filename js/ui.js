// UI Module — shared UI behaviors

// ══ TOAST ══
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const icons = { success: 'fa-check', error: 'fa-times', info: 'fa-info' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <div class="toast-icon"><i class="fas ${icons[type] || icons.info}"></i></div>
    <div class="toast-msg">${message}</div>
    <button class="toast-close" onclick="this.parentElement.remove()"><i class="fas fa-times"></i></button>
  `;
  container.appendChild(toast);
  setTimeout(() => { toast.classList.add('out'); setTimeout(() => toast.remove(), 300); }, 4000);
}

// ══ HEADER SCROLL ══
function initHeader() {
  const header = document.getElementById('siteHeader');
  const announcementBar = document.getElementById('announcementBar');
  if (!header) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 80) { header.classList.add('scrolled'); if(announcementBar) announcementBar.style.display='none'; }
    else { header.classList.remove('scrolled'); if(announcementBar) announcementBar.style.display=''; }
  }, { passive: true });
}

// ══ MOBILE NAV ══
function initMobileNav() {
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobileNav');
  const overlay = document.getElementById('mobileNavOverlay');
  const closeBtn = document.getElementById('mobileNavClose');

  const openMobile = () => {
    mobileNav?.classList.add('open');
    overlay?.classList.add('open');
    hamburger?.classList.add('open');
    document.body.style.overflow = 'hidden';
  };
  const closeMobile = () => {
    mobileNav?.classList.remove('open');
    overlay?.classList.remove('open');
    hamburger?.classList.remove('open');
    document.body.style.overflow = '';
  };

  hamburger?.addEventListener('click', openMobile);
  overlay?.addEventListener('click', closeMobile);
  closeBtn?.addEventListener('click', closeMobile);
}

// ══ SEARCH ══
function initSearch() {
  const toggleBtn = document.getElementById('searchToggle');
  const dropdown = document.getElementById('searchDropdown');
  const closeBtn = document.getElementById('searchClose');
  const input = document.getElementById('searchInput');

  toggleBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown?.classList.toggle('open');
    if (dropdown?.classList.contains('open')) input?.focus();
  });

  closeBtn?.addEventListener('click', () => dropdown?.classList.remove('open'));
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-box')) dropdown?.classList.remove('open');
  });

  let searchTimer;
  input?.addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      const q = input.value.trim();
      if (q.length > 1) {
        const suggestionsEl = document.getElementById('searchSuggestions');
        if (suggestionsEl) {
          suggestionsEl.innerHTML = `<div style="padding:.5rem 0; color:var(--text-muted); font-size:.88rem;"><i class="fas fa-search" style="margin-right:.5rem"></i> Searching for "<strong>${q}</strong>"...</div>`;
        }
      }
    }, 300);
  });

  input?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const q = input.value.trim();
      if (q) window.location.href = `shop.html?search=${encodeURIComponent(q)}`;
    }
  });
}

// ══ PRODUCT CARD BUILDER ══
function buildProductCard(product, classes = '') {
  const discount = product.discount || 0;
  const isNew = product.isNewArrival;
  const isTrending = product.isTrending;
  const badge = discount >= 10 ? `<span class="product-badge badge-sale">${discount}% OFF</span>`
    : isNew ? `<span class="product-badge badge-new">New</span>`
    : isTrending ? `<span class="product-badge badge-trending">Trending</span>` : '';

  const stars = '★'.repeat(Math.round(product.rating || 0)) + '☆'.repeat(5 - Math.round(product.rating || 0));
  const fp = formatPrice || (n => '₹' + n);

  return `
    <div class="product-card ${classes}" onclick="location.href='product.html?id=${product._id}'">
      <div class="product-img">
        ${badge}
        <img src="${product.images?.[0] || ''}" alt="${product.name}" loading="lazy">
        <div class="product-actions">
          <button class="product-action-btn" onclick="event.stopPropagation();handleWishlistToggle('${product._id}',this)" title="Wishlist"><i class="far fa-heart"></i></button>
          <button class="product-action-btn" onclick="event.stopPropagation();openQuickView('${product._id}')" title="Quick View"><i class="fas fa-eye"></i></button>
        </div>
      </div>
      <div class="product-info">
        <div class="product-brand">${product.brand}</div>
        <div class="product-name">${product.name}</div>
        <div class="product-rating">
          <span class="stars">${'⭐'.repeat(Math.round(product.rating||0))}</span>
          <span class="rating-count">(${product.numReviews||0})</span>
        </div>
        <div class="product-pricing">
          <span class="price-current">${fp(product.price)}</span>
          ${product.originalPrice ? `<span class="price-original">${fp(product.originalPrice)}</span>` : ''}
          ${discount > 0 ? `<span class="price-discount">${discount}% off</span>` : ''}
        </div>
        <button class="product-add-btn" onclick="event.stopPropagation();quickAddToCart('${product._id}')">
          <i class="fas fa-shopping-bag"></i> Add to Bag
        </button>
      </div>
    </div>
  `;
}

// ══ QUICK VIEW ══
let quickViewProductCache = {};

async function openQuickView(productId) {
  const overlay = document.getElementById('quickViewOverlay');
  const modal = document.getElementById('quickViewModal');
  const content = document.getElementById('quickViewContent');
  overlay?.classList.add('open');
  modal?.classList.add('open');
  document.body.style.overflow = 'hidden';
  if (!content) return;
  content.innerHTML = '<div style="padding:3rem;text-align:center"><div class="spinner" style="width:40px;height:40px;border-width:3px;margin:auto"></div></div>';
  try {
    const product = quickViewProductCache[productId] || (await api.getProduct(productId)).product;
    quickViewProductCache[productId] = product;
    const sizesHtml = product.sizes?.map(s => `<button class="size-opt" onclick="this.closest('.size-options').querySelectorAll('.size-opt').forEach(b=>b.classList.remove('active'));this.classList.add('active')">${s}</button>`).join('') || '<span style="color:var(--text-dim)">One Size</span>';
    content.innerHTML = `
      <div class="quick-view-inner">
        <div class="qv-gallery"><img src="${product.images?.[0]||''}" alt="${product.name}"></div>
        <div class="qv-info">
          <div class="qv-brand">${product.brand}</div>
          <div class="qv-name">${product.name}</div>
          <div class="qv-prices">
            <span class="qv-price">${formatPrice(product.price)}</span>
            ${product.originalPrice?`<span class="qv-original">${formatPrice(product.originalPrice)}</span>`:''}
            ${product.discount?`<span class="qv-disc">${product.discount}% off</span>`:''}
          </div>
          ${product.sizes?.length ? `<p class="qv-label">Select Size</p><div class="size-options">${sizesHtml}</div>` : ''}
          <div class="qv-actions">
            <button class="qv-cart-btn" onclick="quickAddToCart('${product._id}');closeQuickView()">
              <i class="fas fa-shopping-bag"></i> Add to Bag
            </button>
            <button class="qv-wish-btn" onclick="handleWishlistToggle('${product._id}',this)">
              <i class="far fa-heart"></i> Add to Wishlist
            </button>
          </div>
          <p style="margin-top:1rem;font-size:.85rem;color:var(--text-muted);">${product.description}</p>
          <a href="product.html?id=${product._id}" style="display:inline-block;margin-top:1rem;color:var(--primary);font-size:.88rem;font-weight:600;">View Full Details →</a>
        </div>
      </div>
    `;
  } catch { content.innerHTML = '<p style="padding:2rem;color:var(--text-muted)">Failed to load product.</p>'; }
}

function closeQuickView() {
  document.getElementById('quickViewOverlay')?.classList.remove('open');
  document.getElementById('quickViewModal')?.classList.remove('open');
  document.body.style.overflow = '';
}

// ══ WISHLIST ══
let wishlistIds = new Set(JSON.parse(localStorage.getItem('wellsty_wishlist') || '[]'));

function updateWishlistCount() {
  const el = document.getElementById('wishlistCount');
  if (el) { el.textContent = wishlistIds.size; el.style.display = wishlistIds.size > 0 ? 'flex' : 'none'; }
}

async function handleWishlistToggle(productId, btn) {
  const token = localStorage.getItem('wellsty_token');
  if (!token) { showToast('Please login to use wishlist', 'error'); openAuthModal('login'); return; }
  try {
    const data = await api.toggleWishlist(productId);
    if (data.added) { wishlistIds.add(productId); btn?.querySelector('i')?.classList.replace('far','fas'); showToast('Added to wishlist ❤️', 'success'); }
    else { wishlistIds.delete(productId); btn?.querySelector('i')?.classList.replace('fas','far'); showToast('Removed from wishlist', 'info'); }
    updateWishlistCount();
  } catch (e) { showToast(e.message, 'error'); }
}

async function quickAddToCart(productId) {
  try {
    const product = quickViewProductCache[productId] || (await api.getProduct(productId)).product;
    quickViewProductCache[productId] = product;
    await addToCart(product, 1);
  } catch (e) { showToast(e.message || 'Failed to add to cart', 'error'); }
}

// ══ NEWSLETTER ══
function handleNewsletter(e) {
  e.preventDefault();
  showToast('You\'re subscribed! Watch your inbox for exclusive drops 📬', 'success');
  e.target.reset();
}

// ══ BOTTOM NAV ══
function initBottomNav() {
  const nav = document.createElement('div');
  nav.className = 'bottom-nav';
  nav.innerHTML = `
    <div class="bottom-nav-inner">
      <a href="index.html" class="bottom-nav-btn ${location.pathname.includes('index') || location.pathname === '/' ? 'active' : ''}"><i class="fas fa-home"></i><span>Home</span></a>
      <a href="shop.html" class="bottom-nav-btn ${location.pathname.includes('shop') ? 'active' : ''}"><i class="fas fa-search"></i><span>Shop</span></a>
      <button class="bottom-nav-btn ${location.pathname.includes('wishlist') ? 'active' : ''}" onclick="location.href='wishlist.html'"><i class="far fa-heart"></i><span>Wishlist</span></button>
      <button class="bottom-nav-btn" onclick="openCart()"><i class="fas fa-shopping-bag"></i><span>Cart</span></button>
      <button class="bottom-nav-btn ${location.pathname.includes('profile') ? 'active' : ''}" onclick="openAuthModal('login')"><i class="far fa-user"></i><span>Account</span></button>
    </div>
  `;
  document.body.appendChild(nav);
}

function initUI() {
  initHeader();
  initMobileNav();
  initSearch();
  initBottomNav();
  updateWishlistCount();
  document.getElementById('quickViewOverlay')?.addEventListener('click', closeQuickView);
}

window.showToast = showToast;
window.buildProductCard = buildProductCard;
window.openQuickView = openQuickView;
window.closeQuickView = closeQuickView;
window.handleWishlistToggle = handleWishlistToggle;
window.quickAddToCart = quickAddToCart;
window.handleNewsletter = handleNewsletter;
window.updateWishlistCount = updateWishlistCount;

document.addEventListener('DOMContentLoaded', initUI);
