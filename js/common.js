// wellsty.js - Shared functionality for Wellsty
// Updated: 2026-03-13

// ==================== GLOBAL STATE ====================
let cart = [];
let isLoggedIn = false;

// ==================== CART & AUTH PERSISTENCE ====================
function saveCart() {
    localStorage.setItem('wellsty_cart', JSON.stringify(cart));
}

function loadCart() {
    const savedCart = localStorage.getItem('wellsty_cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartCount();
    }
}

function saveAuthState() {
    localStorage.setItem('wellsty_logged_in', isLoggedIn);
}

function loadAuthState() {
    const savedState = localStorage.getItem('wellsty_logged_in');
    isLoggedIn = savedState === 'true';
    updateUserIcon();
}

// ==================== MODAL HANDLERS ====================
// NOTE: This function must be called after the modal HTML is loaded into the DOM.
function setupModalHandlers() {
    const modals = document.querySelectorAll('.modal');
    const closeBtns = document.querySelectorAll('.close-modal');
    
    const userBtn = document.getElementById('userBtn');
    if(userBtn) {
        userBtn.addEventListener('click', (e) => {
            e.preventDefault();
            openModal('userModal');
        });
    }
    
    const cartBtn = document.getElementById('cartBtn');
    if(cartBtn) {
        cartBtn.addEventListener('click', (e) => {
            e.preventDefault();
            openModal('cartModal');
            renderCart();
        });
    }
    
    // FIX: Enhanced logic for closing modals 
    closeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // 1. Try to get the ID from the data-modal attribute
            let modalId = this.getAttribute('data-modal');
            
            // 2. Fallback: If not found, find the closest parent modal
            if (!modalId) {
                const parentModal = this.closest('.modal');
                if (parentModal) {
                    modalId = parentModal.id;
                }
            }
            
            if (modalId) {
                closeModal(modalId);
            }
        });
    });
    
    // Logic to close modal when clicking the backdrop
    modals.forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal(this.id);
            }
        });
    });
    
    // Logic to close modal on Escape key press
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            modals.forEach(modal => {
                if (modal.classList.contains('active')) {
                    closeModal(modal.id);
                }
            });
            closeInlineSearch();
        }
    });
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

function redirectToLogin() {
    closeModal('cartModal');
    
    const authTabs = document.querySelectorAll('.auth-tab');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    authTabs.forEach(t => {
        if(t.dataset.tab === 'login') t.classList.add('active');
        else t.classList.remove('active');
    });
    
    if(loginForm) loginForm.classList.add('active');
    if(registerForm) registerForm.classList.remove('active');
    
    openModal('userModal');
}

// ==================== SEARCH FUNCTIONALITY ====================
function setupInlineSearch() {
    const searchTrigger = document.getElementById('searchTrigger');
    const searchExpand = document.getElementById('searchExpand');
    const searchInput = document.getElementById('searchInput');
    const searchClose = document.getElementById('searchClose');
    const searchWrapper = document.getElementById('searchWrapper');
    const searchResults = document.getElementById('searchResults');
    
    let searchTimeout;
    
    if(searchTrigger) {
        searchTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            searchExpand.classList.add('active');
            searchTrigger.style.opacity = '0';
            setTimeout(() => {
                searchInput.focus();
            }, 400);
        });
    }
    
    if(searchClose) {
        searchClose.addEventListener('click', () => {
            closeInlineSearch();
        });
    }
    
    if(searchInput) {
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            const query = this.value.trim().toLowerCase();
            
            if (query.length === 0) {
                searchResults.classList.remove('active');
                searchResults.innerHTML = '';
                return;
            }
            
            searchTimeout = setTimeout(() => {
                performInlineSearch(query);
            }, 300);
        });
    }
    
    document.addEventListener('click', (e) => {
        if (searchWrapper && !searchWrapper.contains(e.target)) {
            closeInlineSearch();
        }
    });
}

function closeInlineSearch() {
    const searchExpand = document.getElementById('searchExpand');
    const searchTrigger = document.getElementById('searchTrigger');
    const searchResults = document.getElementById('searchResults');
    const searchInput = document.getElementById('searchInput');
    
    if(searchExpand) searchExpand.classList.remove('active');
    if(searchResults) searchResults.classList.remove('active');
    if(searchTrigger) searchTrigger.style.opacity = '1';
    if(searchInput) searchInput.value = '';
    if(searchResults) searchResults.innerHTML = '';
}

function performInlineSearch(query) {
    const searchResults = document.getElementById('searchResults');
    
    // Get products from window.pageProducts (set by each page)
    const allProducts = window.pageProducts || [];
    
    const results = allProducts.filter(product => 
        product.name.toLowerCase().includes(query) || 
        product.category.toLowerCase().includes(query)
    );
    
    if (results.length === 0) {
        searchResults.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <p>No products found</p>
            </div>
        `;
        searchResults.classList.add('active');
        return;
    }
    
    searchResults.innerHTML = results.map(product => `
        <div class="search-result-item" onclick="navigateToPage('${product.url}')">
            <i class="fas fa-external-link-alt"></i>
            <div style="flex: 1;">
                <div style="font-weight: 600; margin-bottom: 3px;">${product.name}</div>
                <div style="color: var(--text-light); font-size: 0.85rem;">Go to ${product.category} Page</div>
            </div>
            <i class="fas fa-chevron-right" style="font-size: 0.8rem; color: var(--text-light);"></i>
        </div>
    `).join('');
    
    searchResults.classList.add('active');
}

function navigateToPage(url) {
    if (url && url !== 'undefined') {
        window.location.href = url;
    } else {
        showNotification('Page under construction', 'info');
    }
    closeInlineSearch();
}

// ==================== AUTHENTICATION ====================
// NOTE: This function must be called after the modal HTML is loaded into the DOM.
function setupAuthForms() {
    const authTabs = document.querySelectorAll('.auth-tab');
    const loginForm = document.getElementById('loginFormElement');
    const registerForm = document.getElementById('registerFormElement');
    
    authTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            
            authTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            document.querySelectorAll('.auth-form').forEach(form => {
                form.classList.remove('active');
            });
            
            if (tabName === 'login') {
                document.getElementById('loginForm').classList.add('active');
            } else {
                document.getElementById('registerForm').classList.add('active');
            }
        });
    });
    
    if(loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            isLoggedIn = true;
            saveAuthState();
            showNotification('Login successful! Welcome back!', 'success');
            closeModal('userModal');
            loginForm.reset();
            updateUserIcon();
            renderCart();
        });
    }
    
    if(registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            isLoggedIn = true;
            saveAuthState();
            showNotification('Registration successful!', 'success');
            closeModal('userModal');
            registerForm.reset();
            updateUserIcon();
            renderCart();
        });
    }
}

function updateUserIcon() {
    const userBtn = document.getElementById('userBtn');
    if (!userBtn) return;
    
    const icon = userBtn.querySelector('i');
    
    if (isLoggedIn) {
        icon.classList.remove('far');
        icon.classList.add('fas');
        icon.style.color = 'var(--primary)';
    } else {
        icon.classList.remove('fas');
        icon.classList.add('far');
        icon.style.color = '';
    }
}

// ==================== CART FUNCTIONALITY ====================
function setupCartFunctionality() {
    const checkoutBtn = document.getElementById('checkoutBtn');
    
    if(checkoutBtn) {
        checkoutBtn.addEventListener('click', function() {
            if (!isLoggedIn) {
                redirectToLogin();
                return;
            }

            if (cart.length === 0) {
                showNotification('Your cart is empty!', 'error');
                return;
            }
            
            showNotification('Order placed successfully!', 'success');
            cart = [];
            saveCart();
            updateCartCount();
            renderCart();
        });
    }
}

function addToCart(product) {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    saveCart();
    updateCartCount();
    showNotification(`${product.name} added to cart!`, 'success');
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartCount();
    renderCart();
}

function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            saveCart();
            renderCart();
            updateCartCount();
        }
    }
}

function renderCart() {
    const cartItemsContainer = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    const checkoutBtn = document.getElementById('checkoutBtn');
    
    if (!isLoggedIn) {
        if(checkoutBtn) checkoutBtn.style.display = 'none';
        
        cartItemsContainer.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-lock" style="margin-bottom: 15px;"></i>
                <h3>Login Required</h3>
                <p style="margin-bottom: 20px;">Please login to view your cart and checkout.</p>
                <button onclick="redirectToLogin()" class="auth-submit-btn" style="width: auto; padding: 10px 30px;">
                    Login / Register
                </button>
            </div>
        `;
        cartTotal.textContent = '$0.00';
        return;
    }

    if(checkoutBtn) checkoutBtn.style.display = 'block';

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <h3>Your cart is empty</h3>
                <p>Add some products to get started!</p>
            </div>
        `;
        cartTotal.textContent = '$0.00';
        return;
    }
    
    cartItemsContainer.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-image" style="background: var(--bg-light); display: flex; align-items: center; justify-content: center; color: var(--text-light);">
                <i class="fas fa-image" style="font-size: 2rem;"></i>
            </div>
            <div class="cart-item-details">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                <div class="cart-item-quantity">
                    <button class="qty-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button class="qty-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                </div>
            </div>
            <i class="fas fa-trash cart-item-remove" onclick="removeFromCart(${item.id})"></i>
        </div>
    `).join('');
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.textContent = `$${total.toFixed(2)}`;
}

function updateCartCount() {
    const cartCount = document.getElementById('cartCount');
    if(cartCount) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
    }
}

// ==================== UTILITIES ====================
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    
    if (type === 'success') notification.style.backgroundColor = '#10b981';
    else if (type === 'error') notification.style.backgroundColor = '#ef4444';
    else notification.style.backgroundColor = '#3b82f6';
    
    document.body.appendChild(notification);
    
    setTimeout(() => { notification.style.transform = 'translateX(0)'; }, 100);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) notification.parentNode.removeChild(notification);
        }, 300);
    }, 4000);
}

function setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href !== '#') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });
}

function setupHeaderScroll() {
    let lastScroll = 0;
// Wellsty Global Configuration
const BRAND_NAME = 'Wellsty';
const STORAGE_PREFIX = 'wellsty_';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initApp();
    setupGlobalListeners();
});

function initApp() {
    updateCartCount();
    checkAuthStatus();
    loadModals();
}

function setupGlobalListeners() {
    // Scroll Effect for Header
    window.addEventListener('scroll', () => {
        const header = document.getElementById('mainHeader');
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            // Keep scrolled class if on subpages that need it
            if (!document.body.classList.contains('index-page')) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }
    });

    // Search Toggle
    const searchTrigger = document.getElementById('searchTrigger');
    const searchExpand = document.getElementById('searchExpand');
    const searchClose = document.getElementById('searchClose');

    if (searchTrigger) {
        searchTrigger.addEventListener('click', () => {
            searchExpand.classList.add('active');
            document.getElementById('searchInput').focus();
        });
    }

    if (searchClose) {
        searchClose.addEventListener('click', () => {
            searchExpand.classList.remove('active');
        });
    }
}

// Dynamic Product Rendering
function renderProducts(containerId, productList) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = productList.map(product => `
        <div class="product-card glass" data-id="${product.id}">
            <div class="product-image-wrap" onclick="location.href='product-details.html?id=${product.id}'">
                <img src="${product.image}" alt="${product.title}">
                <div class="wishlist-btn" onclick="toggleWishlist(event, ${product.id})">
                    <i class="${isProductInWishlist(product.id) ? 'fas' : 'far'} fa-heart"></i>
                </div>
            </div>
            <div class="product-info">
                <span class="product-category">${product.category}</span>
                <h3 class="product-title" onclick="location.href='product-details.html?id=${product.id}'">${product.title}</h3>
                <div class="price-row">
                    <span class="price">$${parseFloat(product.price).toFixed(2)}</span>
                    <button class="add-cart-btn" onclick="handleAddToCart(event, ${JSON.stringify(product).replace(/"/g, '&quot;')})">
                        Add to Bag
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Global Wishlist Logic
function toggleWishlist(event, productId) {
    event.stopPropagation();
    let wishlist = JSON.parse(localStorage.getItem(STORAGE_PREFIX + 'wishlist')) || [];
    const index = wishlist.indexOf(productId);
    
    if (index === -1) {
        wishlist.push(productId);
        showNotification('Added to Wishlist', 'success');
    } else {
        wishlist.splice(index, 1);
        showNotification('Removed from Wishlist', 'info');
    }
    
    localStorage.setItem(STORAGE_PREFIX + 'wishlist', JSON.stringify(wishlist));
    
    // Update icons in the DOM
    const icon = event.currentTarget.querySelector('i');
    icon.classList.toggle('fas');
    icon.classList.toggle('far');
}

function isProductInWishlist(productId) {
    let wishlist = JSON.parse(localStorage.getItem(STORAGE_PREFIX + 'wishlist')) || [];
    return wishlist.includes(productId);
}

// Improved Add to Cart Feedback
function handleAddToCart(event, product) {
    const btn = event.currentTarget;
    if (btn.disabled) return;

    addToCart(product);
    
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-check"></i> Added';
    btn.style.background = 'var(--accent)';
    
    setTimeout(() => {
        btn.innerHTML = originalText;
        btn.disabled = false;
        btn.style.background = '';
    }, 2000);
}

// Common Modal Loader
function loadModals() {
    const container = document.getElementById('modalsContainer');
    if (container && !container.innerHTML) {
        fetch('common-modals.html')
            .then(res => res.text())
            .then(html => {
                container.innerHTML = html;
                setupModalHandlers();
                setupAuthForms();
            });
    }
}

function showNotification(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast-notification ${type} active`;
    toast.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-info-circle'}"></i>
        <span>${message}</span>
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.remove('active');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
    const header = document.querySelector('header');
    
    if (header) {
        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;
            if (currentScroll > lastScroll && currentScroll > 100) {
                header.style.transform = 'translateY(-100%)';
            } else {
                header.style.transform = 'translateY(0)';
            }
            lastScroll = currentScroll;
        });
    }
}

// ==================== INITIALIZATION ====================
// We removed the auto-initialization. You must call these functions manually 
// after the HTML is loaded via fetch (see index.html script block).
function initCommonFeatures() {
    loadCart();
    loadAuthState();
    setupInlineSearch();
    setupCartFunctionality();
    setupSmoothScrolling();
    setupHeaderScroll();
}

// Manually run non-modal-dependent initialization right away
document.addEventListener('DOMContentLoaded', initCommonFeatures);