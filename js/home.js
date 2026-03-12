// Home Page — dynamic content loader

// ══ HERO SLIDER ══
function initSlider() {
  const slides = document.querySelectorAll('.slide');
  const dots = document.querySelectorAll('.dot');
  let current = 0, timer;

  const goTo = (idx) => {
    slides[current]?.classList.remove('active');
    dots[current]?.classList.remove('active');
    current = (idx + slides.length) % slides.length;
    slides[current]?.classList.add('active');
    dots[current]?.classList.add('active');
  };

  const autoPlay = () => { timer = setInterval(() => goTo(current + 1), 5000); };
  const stopPlay = () => clearInterval(timer);

  document.getElementById('sliderNext')?.addEventListener('click', () => { goTo(current + 1); stopPlay(); autoPlay(); });
  document.getElementById('sliderPrev')?.addEventListener('click', () => { goTo(current - 1); stopPlay(); autoPlay(); });
  dots.forEach(d => d.addEventListener('click', () => { goTo(+d.dataset.slide); stopPlay(); autoPlay(); }));

  autoPlay();
}

// ══ COUNTDOWN TIMER ══
function initCountdown() {
  const target = new Date();
  target.setDate(target.getDate() + 3);
  target.setHours(23, 59, 59);

  const update = () => {
    const diff = target - Date.now();
    if (diff <= 0) return;
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    const pad = n => String(n).padStart(2, '0');
    const set = (id, val) => { const el = document.getElementById(id); if(el) el.textContent = pad(val); };
    set('cdDays', d); set('cdHours', h); set('cdMins', m); set('cdSecs', s);
  };
  update();
  setInterval(update, 1000);
}

// ══ LOAD PRODUCTS ══
async function loadTrendingProducts() {
  const container = document.getElementById('trendingProducts');
  if (!container) return;
  try {
    const data = await api.getProducts({ trending: 'true', limit: 8 });
    if (!data.products?.length) { container.innerHTML = '<p style="color:var(--text-muted)">No products found.</p>'; return; }
    container.innerHTML = data.products.map(p => buildProductCard(p)).join('');
  } catch {
    container.innerHTML = '<p style="color:var(--text-muted)">Failed to load products.</p>';
  }
}

async function loadNewArrivals() {
  const container = document.getElementById('newArrivalsGrid');
  if (!container) return;
  try {
    const data = await api.getProducts({ newArrival: 'true', limit: 4 });
    if (!data.products?.length) { container.innerHTML = '<p style="color:var(--text-muted)">No products found.</p>'; return; }
    container.innerHTML = data.products.map(p => buildProductCard(p)).join('');
  } catch {
    container.innerHTML = '<p style="color:var(--text-muted)">Failed to load products.</p>';
  }
}

async function loadFeaturedProducts() {
  const container = document.getElementById('featuredGrid');
  if (!container) return;
  try {
    const data = await api.getProducts({ featured: 'true', limit: 4 });
    if (!data.products?.length) { container.innerHTML = '<p style="color:var(--text-muted)">No products found.</p>'; return; }
    container.innerHTML = data.products.map(p => buildProductCard(p)).join('');
  } catch {
    container.innerHTML = '<p style="color:var(--text-muted)">Failed to load products.</p>';
  }
}

// ══ SCROLL ANIMATIONS ══
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.cat-card, .feature-item, .testimonial-card, .editorial-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = 'opacity .6s ease, transform .6s ease';
    observer.observe(el);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initSlider();
  initCountdown();
  loadTrendingProducts();
  loadNewArrivals();
  loadFeaturedProducts();
  setTimeout(initScrollAnimations, 200);
});
