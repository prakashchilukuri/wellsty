// API Client — All requests to the backend
const API_BASE = 'http://localhost:5000/api';

const api = {
  token: localStorage.getItem('wellsty_token'),

  headers(auth = true) {
    const h = { 'Content-Type': 'application/json' };
    if (auth && this.token) h['Authorization'] = `Bearer ${this.token}`;
    return h;
  },

  async request(method, path, body = null, auth = true) {
    const opts = { method, headers: this.headers(auth) };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(`${API_BASE}${path}`, opts);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Request failed');
    return data;
  },

  get: (path, auth = true) => api.request('GET', path, null, auth),
  post: (path, body, auth = true) => api.request('POST', path, body, auth),
  put: (path, body, auth = true) => api.request('PUT', path, body, auth),
  delete: (path, auth = true) => api.request('DELETE', path, null, auth),

  // Products
  getProducts: (params = {}) => api.get('/products?' + new URLSearchParams(params), false),
  getProduct: (id) => api.get(`/products/${id}`, false),
  addReview: (id, data) => api.post(`/products/${id}/reviews`, data),

  // Auth
  login: (data) => api.post('/auth/login', data, false),
  register: (data) => api.post('/auth/register', data, false),
  getMe: () => api.get('/auth/me'),

  // Cart
  getCart: () => api.get('/cart'),
  addToCart: (data) => api.post('/cart', data),
  updateCartItem: (itemId, qty) => api.put(`/cart/${itemId}`, { qty }),
  removeFromCart: (itemId) => api.delete(`/cart/${itemId}`),
  clearCart: () => api.delete('/cart'),
  applyCoupon: (code) => api.post('/cart/coupon', { code }),

  // Orders
  createOrder: (data) => api.post('/orders', data),
  getMyOrders: () => api.get('/orders/my'),
  getOrder: (id) => api.get(`/orders/${id}`),

  // User
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  getWishlist: () => api.get('/users/wishlist'),
  toggleWishlist: (productId) => api.put(`/users/wishlist/${productId}`, {}),
  getAddresses: () => api.get('/users/addresses'),
  addAddress: (data) => api.post('/users/addresses', data),
  deleteAddress: (id) => api.delete(`/users/addresses/${id}`),

  // Admin
  getStats: () => api.get('/products/stats'),
  getOrderStats: () => api.get('/orders/stats'),
  getAllOrders: (params) => api.get('/orders?' + new URLSearchParams(params)),
  updateOrderStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
  createProduct: (data) => api.post('/products', data),
  updateProduct: (id, data) => api.put(`/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/products/${id}`),
  getAllUsers: () => api.get('/users')
};

window.api = api;
