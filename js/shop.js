// Shop Page JS
const CAT_LABELS = {
  'mens-fashion': "Men's Fashion", 'womens-fashion': "Women's Fashion",
  'footwear': 'Footwear', 'accessories': 'Accessories',
  'beauty': 'Beauty', 'electronics': 'Electronics'
};

let shopParams = {};
let currentPage = 1;

function parseUrlParams() {
  const p = new URLSearchParams(location.search);
  shopParams = {};
  if (p.get('c')) shopParams.category = p.get('c');
  if (p.get('search')) shopParams.search = p.get('search');
  if (p.get('sort')) shopParams.sort = p.get('sort');
  if (p.get('trending')) shopParams.trending = 'true';
  if (p.get('new')) shopParams.newArrival = 'true';
  if (p.get('featured')) shopParams.featured = 'true';
}

function updateHeading() {
  const heading = document.getElementById('shopHeading');
  const sub = document.getElementById('shopSubheading');
  const cat = shopParams.category;
  if (shopParams.search) { if(heading) heading.textContent = `Results for "${shopParams.search}"`; return; }
  if (cat && CAT_LABELS[cat]) { if(heading) heading.textContent = CAT_LABELS[cat]; if(sub) sub.textContent = `Premium ${CAT_LABELS[cat]} at the best prices`; }
  if (shopParams.trending === 'true') { if(heading) heading.textContent = 'Trending Now 🔥'; }
  if (shopParams.newArrival === 'true') { if(heading) heading.textContent = 'New Arrivals ✨'; }
  if (shopParams.sort === 'discount') { if(heading) heading.textContent = 'Sale — Best Deals'; }
}

function syncCatTabs() {
  document.querySelectorAll('.cat-tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.cat === (shopParams.category || ''));
    btn.addEventListener('click', () => {
      const cat = btn.dataset.cat;
      const url = new URL(location.href);
      if (cat) url.searchParams.set('c', cat);
      else url.searchParams.delete('c');
      url.searchParams.delete('search');
      location.href = url.toString();
    });
  });
}

async function loadShopProducts(page = 1) {
  const grid = document.getElementById('shopProductsGrid');
  if (!grid) return;
  grid.innerHTML = Array(6).fill('<div class="product-skeleton"></div>').join('');
  const params = { ...shopParams, page, limit: 12 };
  try {
    const data = await api.getProducts(params);
    const count = document.getElementById('productCount');
    if (count) count.textContent = data.total;
    if (!data.products?.length) {
      grid.innerHTML = `<div class="no-results" style="grid-column:1/-1"><i class="fas fa-search"></i><h3>No products found</h3><p>Try adjusting your filters or search term</p><a href="shop.html" class="btn-solid" style="margin-top:1.5rem">View All Products</a></div>`;
      document.getElementById('pagination').innerHTML = '';
      return;
    }
    grid.innerHTML = data.products.map(p => buildProductCard(p)).join('');
    renderPagination(data.page, data.pages);
  } catch (e) {
    grid.innerHTML = `<div class="no-results" style="grid-column:1/-1"><p>Failed to load products. Make sure the backend server is running.</p></div>`;
  }
}

function renderPagination(page, pages) {
  const el = document.getElementById('pagination');
  if (!el || pages <= 1) { if(el) el.innerHTML=''; return; }
  let html = '';
  if (page > 1) html += `<button class="page-btn" onclick="goPage(${page-1})"><i class="fas fa-chevron-left"></i></button>`;
  for (let i = Math.max(1, page-2); i <= Math.min(pages, page+2); i++) {
    html += `<button class="page-btn ${i===page?'active':''}" onclick="goPage(${i})">${i}</button>`;
  }
  if (page < pages) html += `<button class="page-btn" onclick="goPage(${page+1})"><i class="fas fa-chevron-right"></i></button>`;
  el.innerHTML = html;
}

function goPage(p) { currentPage = p; loadShopProducts(p); window.scrollTo(0, 0); }

// Filter functions
function applyBrandFilter() {
  const selected = [...document.querySelectorAll('#brandFilters input:checked')].map(i => i.value);
  if (selected.length) shopParams.brand = selected.join(',');
  else delete shopParams.brand;
  currentPage = 1; loadShopProducts(); renderActiveFilters();
}

function applyPriceFilter() {
  const min = document.getElementById('minPrice')?.value;
  const max = document.getElementById('maxPrice')?.value;
  if (min) shopParams.minPrice = min; else delete shopParams.minPrice;
  if (max) shopParams.maxPrice = max; else delete shopParams.maxPrice;
  currentPage = 1; loadShopProducts(); renderActiveFilters();
}

function applyDiscountFilter() {
  const val = document.querySelector('input[name=disc]:checked')?.value;
  if (val && val !== '') shopParams.minDiscount = val;
  else delete shopParams.minDiscount;
  currentPage = 1; loadShopProducts(); renderActiveFilters();
}

function applyRatingFilter() {
  const val = document.querySelector('input[name=rat]:checked')?.value;
  if (val) shopParams.minRating = val; else delete shopParams.minRating;
  currentPage = 1; loadShopProducts(); renderActiveFilters();
}

function clearAllFilters() {
  const cat = shopParams.category;
  shopParams = cat ? { category: cat } : {};
  document.querySelectorAll('#filterSidebar input[type=checkbox]').forEach(i => i.checked = false);
  document.querySelectorAll('#filterSidebar input[type=radio]').forEach(i => i.checked = false);
  document.getElementById('minPrice') && (document.getElementById('minPrice').value = '');
  document.getElementById('maxPrice') && (document.getElementById('maxPrice').value = '');
  currentPage = 1; loadShopProducts(); renderActiveFilters();
}

function renderActiveFilters() {
  const el = document.getElementById('activeFilters');
  if (!el) return;
  let chips = '';
  if (shopParams.brand) chips += `<span class="filter-chip">Brand: ${shopParams.brand} <button onclick="delete shopParams.brand;applyBrandFilter()">×</button></span>`;
  if (shopParams.minPrice || shopParams.maxPrice) chips += `<span class="filter-chip">₹${shopParams.minPrice||'0'} – ₹${shopParams.maxPrice||'∞'} <button onclick="delete shopParams.minPrice;delete shopParams.maxPrice;loadShopProducts();renderActiveFilters()">×</button></span>`;
  el.innerHTML = chips;
}

function initFilterSidebar() {
  const btn = document.getElementById('filterToggleBtn');
  const sidebar = document.getElementById('filterSidebar');
  const overlay = document.getElementById('filterOverlay');
  btn?.addEventListener('click', () => { sidebar?.classList.add('open'); overlay?.style && (overlay.style.display='block'); });
}

window.closeFilterSidebar = () => {
  document.getElementById('filterSidebar')?.classList.remove('open');
  const o = document.getElementById('filterOverlay'); if(o) o.style.display='none';
};

window.goPage = goPage;
window.applyBrandFilter = applyBrandFilter;
window.applyPriceFilter = applyPriceFilter;
window.applyDiscountFilter = applyDiscountFilter;
window.applyRatingFilter = applyRatingFilter;
window.clearAllFilters = clearAllFilters;
window.renderActiveFilters = renderActiveFilters;

document.addEventListener('DOMContentLoaded', () => {
  parseUrlParams();
  updateHeading();
  syncCatTabs();
  loadShopProducts();
  initFilterSidebar();

  document.getElementById('sortSelect')?.addEventListener('change', (e) => {
    shopParams.sort = e.target.value || undefined;
    if (!e.target.value) delete shopParams.sort;
    currentPage = 1; loadShopProducts();
  });

  // Pre-select sort if in URL
  const urlSort = new URLSearchParams(location.search).get('sort');
  if (urlSort) { const s = document.getElementById('sortSelect'); if(s) s.value = urlSort; }
  if (new URLSearchParams(location.search).get('trending')) document.getElementById('sortSelect') && (document.getElementById('sortSelect').value='rating');
});
