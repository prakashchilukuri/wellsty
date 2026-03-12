// Auth Module
let currentUser = null;

function getStoredUser() {
  try { return JSON.parse(localStorage.getItem('wellsty_user')); } catch { return null; }
}

function setAuthData(token, user) {
  localStorage.setItem('wellsty_token', token);
  localStorage.setItem('wellsty_user', JSON.stringify(user));
  api.token = token;
  currentUser = user;
}

function clearAuthData() {
  localStorage.removeItem('wellsty_token');
  localStorage.removeItem('wellsty_user');
  api.token = null;
  currentUser = null;
}

function updateHeaderUI(user) {
  const ddHeader = document.getElementById('userDdHeader');
  const ddAuth = document.getElementById('userDdAuth');
  const ddLinks = document.getElementById('userDdLinks');
  const mobileAuth = document.getElementById('mobileNavAuth');
  const mobileInfo = document.getElementById('mobileNavUserInfo');
  const mobileUserName = document.getElementById('mobileUserName');

  if (user) {
    if (ddHeader) ddHeader.querySelector('.dd-welcome').textContent = `Hello, ${user.name.split(' ')[0]}! 👋`;
    if (ddHeader) ddHeader.querySelector('.dd-sub').textContent = user.email;
    if (ddAuth) ddAuth.style.display = 'none';
    if (ddLinks) ddLinks.style.display = 'block';
    if (mobileAuth) mobileAuth.style.display = 'none';
    if (mobileInfo) { mobileInfo.style.display = 'block'; if (mobileUserName) mobileUserName.textContent = user.name.split(' ')[0]; }
  } else {
    if (ddHeader) ddHeader.querySelector('.dd-welcome').textContent = 'Hello, Guest 👋';
    if (ddHeader) ddHeader.querySelector('.dd-sub').textContent = 'Login for best experience';
    if (ddAuth) ddAuth.style.display = 'flex';
    if (ddLinks) ddLinks.style.display = 'none';
    if (mobileAuth) mobileAuth.style.display = 'block';
    if (mobileInfo) mobileInfo.style.display = 'none';
  }
}

function openAuthModal(tab = 'login') {
  document.getElementById('authOverlay')?.classList.add('open');
  document.getElementById('authModal')?.classList.add('open');
  if (tab) switchTab(tab);
}

function closeAuthModal() {
  document.getElementById('authOverlay')?.classList.remove('open');
  document.getElementById('authModal')?.classList.remove('open');
}

function switchTab(tab) {
  document.querySelectorAll('.auth-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
  document.getElementById('loginForm')?.classList.toggle('active', tab === 'login');
  document.getElementById('registerForm')?.classList.toggle('active', tab === 'register');
}

async function handleLogin() {
  const email = document.getElementById('loginEmail')?.value?.trim();
  const password = document.getElementById('loginPassword')?.value;
  const errEl = document.getElementById('loginError');
  const btn = document.getElementById('loginSubmitBtn');
  if (!email || !password) { if(errEl) errEl.textContent = 'Please fill all fields'; return; }
  btn.innerHTML = '<span class="spinner"></span>';
  btn.disabled = true;
  try {
    const data = await api.login({ email, password });
    setAuthData(data.token, data.user);
    updateHeaderUI(data.user);
    closeAuthModal();
    showToast('Welcome back, ' + data.user.name.split(' ')[0] + '! 🎉', 'success');
    if (typeof loadCartFromAPI === 'function') loadCartFromAPI();
    if (typeof updateWishlistCount === 'function') updateWishlistCount();
  } catch (e) { if(errEl) errEl.textContent = e.message; }
  finally { btn.innerHTML = 'Login <i class="fas fa-arrow-right"></i>'; btn.disabled = false; }
}

async function handleRegister() {
  const name = document.getElementById('regName')?.value?.trim();
  const email = document.getElementById('regEmail')?.value?.trim();
  const password = document.getElementById('regPassword')?.value;
  const errEl = document.getElementById('registerError');
  const btn = document.getElementById('registerSubmitBtn');
  if (!name || !email || !password) { if(errEl) errEl.textContent = 'Please fill all fields'; return; }
  if (password.length < 6) { if(errEl) errEl.textContent = 'Password must be at least 6 characters'; return; }
  btn.innerHTML = '<span class="spinner"></span>';
  btn.disabled = true;
  try {
    const data = await api.register({ name, email, password });
    setAuthData(data.token, data.user);
    updateHeaderUI(data.user);
    closeAuthModal();
    showToast('Account created! Welcome to Wellsty 🎉', 'success');
  } catch (e) { if(errEl) errEl.textContent = e.message; }
  finally { btn.innerHTML = 'Create Account <i class="fas fa-arrow-right"></i>'; btn.disabled = false; }
}

function togglePassword(inputId) {
  const inp = document.getElementById(inputId);
  if (!inp) return;
  inp.type = inp.type === 'password' ? 'text' : 'password';
}

function initAuth() {
  currentUser = getStoredUser();
  api.token = localStorage.getItem('wellsty_token');
  if (currentUser) updateHeaderUI(currentUser);

  // Tab switching
  document.querySelectorAll('.auth-tab').forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab.dataset.tab));
  });

  // Overlay / close
  document.getElementById('authOverlay')?.addEventListener('click', closeAuthModal);
  document.getElementById('authClose')?.addEventListener('click', closeAuthModal);

  // Logout
  document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
    e.preventDefault();
    clearAuthData();
    updateHeaderUI(null);
    showToast('Logged out successfully', 'info');
    cartState.items = [];
    renderCart();
  });

  // Enter key in forms
  document.getElementById('loginPassword')?.addEventListener('keydown', e => { if(e.key==='Enter') handleLogin(); });
  document.getElementById('regPassword')?.addEventListener('keydown', e => { if(e.key==='Enter') handleRegister(); });
}

window.openAuthModal = openAuthModal;
window.closeAuthModal = closeAuthModal;
window.switchTab = switchTab;
window.handleLogin = handleLogin;
window.handleRegister = handleRegister;
window.togglePassword = togglePassword;
window.getStoredUser = getStoredUser;
window.currentUser = currentUser;

document.addEventListener('DOMContentLoaded', initAuth);
