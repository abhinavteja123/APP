/* ========================================
   DataForge — MERN Dashboard Application
   API Base: http://localhost:5000/api
   ======================================== */

const API = 'http://localhost:5000/api';

// ── Global State ─────────────────────────
let allUsers    = [];
let allProducts = [];
let allOrders   = [];
let pendingDeleteFn = null;

// ── Page Navigation ───────────────────────
function showPage(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById(`page-${page}`).classList.add('active');
  document.getElementById(`nav-${page}`).classList.add('active');

  const titles = {
    dashboard: ['Dashboard', 'Welcome back — here\'s what\'s happening'],
    users:     ['Users',     'Manage your customer accounts'],
    products:  ['Products',  'Browse and control your inventory'],
    orders:    ['Orders',    'Track and manage all orders'],
  };
  document.getElementById('page-title').textContent    = titles[page][0];
  document.getElementById('page-subtitle').textContent = titles[page][1];

  // Close mobile sidebar
  document.getElementById('sidebar').classList.remove('mobile-open');

  if (page === 'users')     loadUsers();
  if (page === 'products')  loadProducts();
  if (page === 'orders')    loadOrders();
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('mobile-open');
}

// ── API Helper ────────────────────────────
async function apiFetch(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || data.error || `HTTP ${res.status}`);
  return data;
}

// ── API Status Check ──────────────────────
async function checkApiStatus() {
  const dot  = document.getElementById('status-dot');
  const text = document.getElementById('status-text');
  try {
    await fetch(`${API}/users`, { signal: AbortSignal.timeout(3000) });
    dot.className  = 'status-dot online';
    text.textContent = 'API Online';
  } catch {
    dot.className  = 'status-dot offline';
    text.textContent = 'API Offline';
  }
}

// ── Toast Notifications ───────────────────
function showToast(message, type = 'info', sub = '') {
  const container = document.getElementById('toast-container');
  const icons = {
    success: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22d3a0" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 10"/></svg>`,
    error:   `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f04e6b" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
    info:    `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4f8ef7" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
  };
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <div class="toast-icon">${icons[type]}</div>
    <div>
      <div class="toast-text">${message}</div>
      ${sub ? `<div class="toast-sub">${sub}</div>` : ''}
    </div>`;
  container.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateX(100%)'; toast.style.transition = '300ms ease'; setTimeout(() => toast.remove(), 300); }, 3500);
}

// ── Modal Helpers ─────────────────────────
function openModal(id) {
  document.getElementById(id).classList.add('open');
}

function closeModal(id) {
  document.getElementById(id).classList.remove('open');
}

function closeModalOnOverlay(event, id) {
  if (event.target === event.currentTarget) closeModal(id);
}

// ── Table Filter ──────────────────────────
function filterTable(tableId, query) {
  const q = query.toLowerCase().trim();
  const rows = document.querySelectorAll(`#${tableId} tbody tr`);
  rows.forEach(row => {
    row.style.display = row.textContent.toLowerCase().includes(q) ? '' : 'none';
  });
}

function filterOrdersByStatus(status) {
  const rows = document.querySelectorAll('#order-table tbody tr');
  rows.forEach(row => {
    if (!status) { row.style.display = ''; return; }
    row.style.display = row.dataset.status === status ? '' : 'none';
  });
}

// ── Format Helpers ────────────────────────
function formatCurrency(val) {
  return '₹' + Number(val).toLocaleString('en-IN');
}

function shortId(id) {
  if (!id) return '—';
  return id.slice(-6).toUpperCase();
}

function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  DASHBOARD
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
async function loadDashboard() {
  try {
    const [users, products, orders] = await Promise.all([
      apiFetch('/users'),
      apiFetch('/products'),
      apiFetch('/orders'),
    ]);

    allUsers    = users    || [];
    allProducts = products || [];
    allOrders   = orders   || [];

    // Stat counts
    document.getElementById('stat-user-count').textContent    = allUsers.length;
    document.getElementById('stat-product-count').textContent = allProducts.length;
    document.getElementById('stat-order-count').textContent   = allOrders.length;

    const totalRevenue = allOrders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
    document.getElementById('stat-revenue-count').textContent = formatCurrency(totalRevenue);

    renderRecentOrders(allOrders.slice(-5).reverse());
    renderStatusBreakdown(allOrders);
  } catch (e) {
    console.error('Dashboard load error:', e);
    document.getElementById('stat-user-count').textContent    = '—';
    document.getElementById('stat-product-count').textContent = '—';
    document.getElementById('stat-order-count').textContent   = '—';
    document.getElementById('stat-revenue-count').textContent = '—';
    showToast('Failed to load dashboard data', 'error', e.message);
  }
}

function renderRecentOrders(orders) {
  const container = document.getElementById('recent-orders-list');
  if (!orders.length) {
    container.innerHTML = '<p style="padding:24px 20px;color:var(--text-muted);font-size:.82rem;text-align:center;">No orders yet</p>';
    return;
  }
  container.innerHTML = orders.map(o => {
    const name = o.userId?.name || 'Unknown';
    const initials = getInitials(name);
    return `
      <div class="recent-item">
        <div class="recent-avatar">${initials}</div>
        <div class="recent-info">
          <div class="recent-name">${name}</div>
          <div class="recent-sub">#${shortId(o._id)} · <span class="badge badge-${o.status}">${o.status}</span></div>
        </div>
        <div class="recent-amount">${formatCurrency(o.totalAmount)}</div>
      </div>`;
  }).join('');
}

function renderStatusBreakdown(orders) {
  const container = document.getElementById('order-status-breakdown');
  const statuses = ['pending', 'confirmed', 'shipped', 'delivered'];
  const counts = {};
  statuses.forEach(s => counts[s] = 0);
  orders.forEach(o => { if (counts[o.status] !== undefined) counts[o.status]++; });
  const total = orders.length || 1;

  container.innerHTML = statuses.map(s => `
    <div class="status-row">
      <span class="status-label-text">${s}</span>
      <div class="status-bar-track">
        <div class="status-bar-fill fill-${s}" style="width:${(counts[s] / total * 100).toFixed(1)}%"></div>
      </div>
      <span class="status-count-text text-${s}">${counts[s]}</span>
    </div>`).join('');
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  USERS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
async function loadUsers() {
  const tbody = document.getElementById('user-tbody');
  tbody.innerHTML = '<tr><td colspan="5" class="table-loading">Loading users…</td></tr>';
  try {
    allUsers = await apiFetch('/users');
    renderUserTable(allUsers);
  } catch (e) {
    tbody.innerHTML = `<tr><td colspan="5" class="table-empty">Failed to load users: ${e.message}</td></tr>`;
    showToast('Error loading users', 'error', e.message);
  }
}

function renderUserTable(users) {
  const tbody = document.getElementById('user-tbody');
  if (!users.length) {
    tbody.innerHTML = '<tr><td colspan="5" class="table-empty">No users found. Add your first user!</td></tr>';
    return;
  }
  tbody.innerHTML = users.map(u => `
    <tr>
      <td class="cell-name">${escHtml(u.name)}</td>
      <td>${escHtml(u.email)}</td>
      <td>${escHtml(u.phone)}</td>
      <td title="${escHtml(u.address)}">${escHtml(u.address)}</td>
      <td>
        <div class="action-btns">
          <button class="icon-btn view" title="View" onclick="viewUser('${u._id}')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          </button>
          <button class="icon-btn edit" title="Edit" onclick="editUser('${u._id}')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="icon-btn delete" title="Delete" onclick="deleteUser('${u._id}', '${escHtml(u.name)}')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
          </button>
        </div>
      </td>
    </tr>`).join('');
}

function openAddUserModal() {
  document.getElementById('user-form').reset();
  document.getElementById('user-id').value = '';
  document.getElementById('user-modal-title').textContent = 'Add User';
  document.getElementById('user-submit-btn').textContent = 'Create User';
  openModal('user-modal');
}

function editUser(id) {
  const user = allUsers.find(u => u._id === id);
  if (!user) return;
  document.getElementById('user-id').value      = user._id;
  document.getElementById('user-name').value    = user.name;
  document.getElementById('user-email').value   = user.email;
  document.getElementById('user-phone').value   = user.phone;
  document.getElementById('user-address').value = user.address;
  document.getElementById('user-modal-title').textContent = 'Edit User';
  document.getElementById('user-submit-btn').textContent = 'Save Changes';
  openModal('user-modal');
}

async function submitUser(e) {
  e.preventDefault();
  const id   = document.getElementById('user-id').value;
  const body = {
    name:    document.getElementById('user-name').value.trim(),
    email:   document.getElementById('user-email').value.trim(),
    phone:   document.getElementById('user-phone').value.trim(),
    address: document.getElementById('user-address').value.trim(),
  };
  const btn = document.getElementById('user-submit-btn');
  btn.disabled = true;
  btn.textContent = id ? 'Saving…' : 'Creating…';
  try {
    if (id) {
      await apiFetch(`/users/${id}`, { method: 'PUT', body: JSON.stringify(body) });
      showToast('User updated successfully', 'success');
    } else {
      await apiFetch('/users', { method: 'POST', body: JSON.stringify(body) });
      showToast('User created successfully', 'success');
    }
    closeModal('user-modal');
    loadUsers();
  } catch (err) {
    showToast('Failed to save user', 'error', err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = id ? 'Save Changes' : 'Create User';
  }
}

function viewUser(id) {
  const user = allUsers.find(u => u._id === id);
  if (!user) return;
  document.getElementById('detail-modal-title').textContent = 'User Details';
  document.getElementById('detail-content').innerHTML = `
    <div class="detail-field"><div class="detail-field-label">ID</div><div class="detail-field-value mono">${user._id}</div></div>
    <div class="detail-field"><div class="detail-field-label">Full Name</div><div class="detail-field-value">${escHtml(user.name)}</div></div>
    <div class="detail-field"><div class="detail-field-label">Email</div><div class="detail-field-value">${escHtml(user.email)}</div></div>
    <div class="detail-field"><div class="detail-field-label">Phone</div><div class="detail-field-value">${escHtml(user.phone)}</div></div>
    <div class="detail-field"><div class="detail-field-label">Address</div><div class="detail-field-value">${escHtml(user.address)}</div></div>
    ${user.createdAt ? `<hr class="detail-divider"><div class="detail-field"><div class="detail-field-label">Created At</div><div class="detail-field-value">${new Date(user.createdAt).toLocaleString()}</div></div>` : ''}`;
  openModal('detail-modal');
}

function deleteUser(id, name) {
  document.getElementById('delete-message').textContent = `Are you sure you want to delete the user "${name}"? This action cannot be undone.`;
  pendingDeleteFn = async () => {
    await apiFetch(`/users/${id}`, { method: 'DELETE' });
    showToast('User deleted', 'success');
    loadUsers();
  };
  openModal('delete-modal');
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  PRODUCTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
async function loadProducts() {
  const tbody = document.getElementById('product-tbody');
  tbody.innerHTML = '<tr><td colspan="6" class="table-loading">Loading products…</td></tr>';
  try {
    allProducts = await apiFetch('/products');
    renderProductTable(allProducts);
  } catch (e) {
    tbody.innerHTML = `<tr><td colspan="6" class="table-empty">Failed to load products: ${e.message}</td></tr>`;
    showToast('Error loading products', 'error', e.message);
  }
}

function renderProductTable(products) {
  const tbody = document.getElementById('product-tbody');
  if (!products.length) {
    tbody.innerHTML = '<tr><td colspan="6" class="table-empty">No products found. Add your first product!</td></tr>';
    return;
  }
  tbody.innerHTML = products.map(p => `
    <tr>
      <td class="cell-name">${escHtml(p.name)}</td>
      <td><span class="badge badge-category">${escHtml(p.category)}</span></td>
      <td class="cell-price">${formatCurrency(p.price)}</td>
      <td>${p.quantity}</td>
      <td title="${escHtml(p.description)}">${escHtml(p.description)}</td>
      <td>
        <div class="action-btns">
          <button class="icon-btn view" title="View" onclick="viewProduct('${p._id}')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          </button>
          <button class="icon-btn edit" title="Edit" onclick="editProduct('${p._id}')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="icon-btn delete" title="Delete" onclick="deleteProduct('${p._id}', '${escHtml(p.name)}')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
          </button>
        </div>
      </td>
    </tr>`).join('');
}

function editProduct(id) {
  const p = allProducts.find(x => x._id === id);
  if (!p) return;
  document.getElementById('product-id').value          = p._id;
  document.getElementById('product-name').value        = p.name;
  document.getElementById('product-category').value   = p.category;
  document.getElementById('product-description').value = p.description;
  document.getElementById('product-price').value       = p.price;
  document.getElementById('product-quantity').value    = p.quantity;
  document.getElementById('product-modal-title').textContent = 'Edit Product';
  document.getElementById('product-submit-btn').textContent = 'Save Changes';
  openModal('product-modal');
}

async function submitProduct(e) {
  e.preventDefault();
  const id   = document.getElementById('product-id').value;
  const body = {
    name:        document.getElementById('product-name').value.trim(),
    category:    document.getElementById('product-category').value.trim(),
    description: document.getElementById('product-description').value.trim(),
    price:       parseFloat(document.getElementById('product-price').value),
    quantity:    parseInt(document.getElementById('product-quantity').value, 10),
  };
  const btn = document.getElementById('product-submit-btn');
  btn.disabled = true;
  btn.textContent = id ? 'Saving…' : 'Creating…';
  try {
    if (id) {
      await apiFetch(`/products/${id}`, { method: 'PUT', body: JSON.stringify(body) });
      showToast('Product updated successfully', 'success');
    } else {
      await apiFetch('/products', { method: 'POST', body: JSON.stringify(body) });
      showToast('Product created successfully', 'success');
    }
    closeModal('product-modal');
    loadProducts();
  } catch (err) {
    showToast('Failed to save product', 'error', err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = id ? 'Save Changes' : 'Create Product';
  }
}

function viewProduct(id) {
  const p = allProducts.find(x => x._id === id);
  if (!p) return;
  document.getElementById('detail-modal-title').textContent = 'Product Details';
  document.getElementById('detail-content').innerHTML = `
    <div class="detail-field"><div class="detail-field-label">ID</div><div class="detail-field-value mono">${p._id}</div></div>
    <div class="detail-field"><div class="detail-field-label">Name</div><div class="detail-field-value">${escHtml(p.name)}</div></div>
    <div class="detail-field"><div class="detail-field-label">Category</div><div class="detail-field-value">${escHtml(p.category)}</div></div>
    <div class="detail-field"><div class="detail-field-label">Description</div><div class="detail-field-value">${escHtml(p.description)}</div></div>
    <div class="detail-field"><div class="detail-field-label">Price</div><div class="detail-field-value" style="color:var(--accent-green)">${formatCurrency(p.price)}</div></div>
    <div class="detail-field"><div class="detail-field-label">Quantity</div><div class="detail-field-value">${p.quantity}</div></div>
    ${p.createdAt ? `<hr class="detail-divider"><div class="detail-field"><div class="detail-field-label">Created At</div><div class="detail-field-value">${new Date(p.createdAt).toLocaleString()}</div></div>` : ''}`;
  openModal('detail-modal');
}

function deleteProduct(id, name) {
  document.getElementById('delete-message').textContent = `Are you sure you want to delete the product "${name}"? This action cannot be undone.`;
  pendingDeleteFn = async () => {
    await apiFetch(`/products/${id}`, { method: 'DELETE' });
    showToast('Product deleted', 'success');
    loadProducts();
  };
  openModal('delete-modal');
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  ORDERS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
async function loadOrders() {
  const tbody = document.getElementById('order-tbody');
  tbody.innerHTML = '<tr><td colspan="6" class="table-loading">Loading orders…</td></tr>';
  try {
    allOrders = await apiFetch('/orders');
    renderOrderTable(allOrders);
  } catch (e) {
    tbody.innerHTML = `<tr><td colspan="6" class="table-empty">Failed to load orders: ${e.message}</td></tr>`;
    showToast('Error loading orders', 'error', e.message);
  }
}

function renderOrderTable(orders) {
  const tbody = document.getElementById('order-tbody');
  if (!orders.length) {
    tbody.innerHTML = '<tr><td colspan="6" class="table-empty">No orders found. Create your first order!</td></tr>';
    return;
  }
  tbody.innerHTML = orders.map(o => {
    const customerName = o.userId?.name || o.userId || 'Unknown';
    const productCount = Array.isArray(o.products) ? o.products.length : 0;
    return `
      <tr data-status="${o.status}">
        <td class="cell-id">#${shortId(o._id)}</td>
        <td class="cell-name">${escHtml(String(customerName))}</td>
        <td>${productCount} item${productCount !== 1 ? 's' : ''}</td>
        <td class="cell-price">${formatCurrency(o.totalAmount)}</td>
        <td><span class="badge badge-${o.status}">${o.status}</span></td>
        <td>
          <div class="action-btns">
            <button class="icon-btn view" title="View" onclick="viewOrder('${o._id}')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
            <button class="icon-btn edit" title="Edit Status" onclick="editOrder('${o._id}')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            <button class="icon-btn delete" title="Delete" onclick="deleteOrder('${o._id}')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
            </button>
          </div>
        </td>
      </tr>`;
  }).join('');
}

// ── Order Modal Helpers ───────────────────
async function openOrderModal() {
  document.getElementById('order-form').reset();
  document.getElementById('order-id').value = '';
  document.getElementById('order-modal-title').textContent = 'Create Order';
  document.getElementById('order-submit-btn').textContent = 'Create Order';

  // Populate user dropdown
  const userSel = document.getElementById('order-user');
  if (!allUsers.length) {
    try { allUsers = await apiFetch('/users'); } catch {}
  }
  userSel.innerHTML = '<option value="">Select a customer…</option>' +
    allUsers.map(u => `<option value="${u._id}">${escHtml(u.name)} (${escHtml(u.email)})</option>`).join('');

  // Populate product options and reset rows
  if (!allProducts.length) {
    try { allProducts = await apiFetch('/products'); } catch {}
  }
  document.getElementById('order-products-container').innerHTML = '';
  addOrderProductRow();

  openModal('order-modal');
}

function addOrderProductRow() {
  const container = document.getElementById('order-products-container');
  const rowIndex = container.children.length;
  const productOptions = allProducts.map(p =>
    `<option value="${p._id}" data-price="${p.price}">${escHtml(p.name)} (${formatCurrency(p.price)})</option>`
  ).join('');

  const row = document.createElement('div');
  row.className = 'order-product-row';
  row.innerHTML = `
    <select class="form-input form-select" name="productId_${rowIndex}" required onchange="updateOrderTotal()">
      <option value="">Select product…</option>
      ${productOptions}
    </select>
    <input class="form-input" type="number" name="qty_${rowIndex}" placeholder="Qty" min="1" value="1" required onchange="updateOrderTotal()" />
    <input class="form-input" type="number" name="price_${rowIndex}" placeholder="Price" min="0" step="0.01" required />
    <button type="button" class="remove-row-btn" onclick="removeOrderProductRow(this)" title="Remove">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    </button>`;

  // Auto-fill price when product selected
  const sel = row.querySelector('select');
  const priceInput = row.querySelector(`[name="price_${rowIndex}"]`);
  sel.addEventListener('change', () => {
    const opt = sel.options[sel.selectedIndex];
    if (opt && opt.dataset.price) {
      priceInput.value = opt.dataset.price;
      updateOrderTotal();
    }
  });

  container.appendChild(row);
}

function removeOrderProductRow(btn) {
  const container = document.getElementById('order-products-container');
  if (container.children.length > 1) {
    btn.closest('.order-product-row').remove();
    updateOrderTotal();
  }
}

function updateOrderTotal() {
  const container = document.getElementById('order-products-container');
  let total = 0;
  container.querySelectorAll('.order-product-row').forEach(row => {
    const qty   = parseFloat(row.querySelector('[name^="qty_"]')?.value) || 0;
    const price = parseFloat(row.querySelector('[name^="price_"]')?.value) || 0;
    total += qty * price;
  });
  document.getElementById('order-total').value = total.toFixed(2);
}

async function submitOrder(e) {
  e.preventDefault();
  const id = document.getElementById('order-id').value;
  const container = document.getElementById('order-products-container');

  const products = [];
  let valid = true;
  container.querySelectorAll('.order-product-row').forEach(row => {
    const productId = row.querySelector('select')?.value;
    const qty       = parseInt(row.querySelector('[name^="qty_"]')?.value, 10);
    const price     = parseFloat(row.querySelector('[name^="price_"]')?.value);
    if (productId && qty > 0 && price >= 0) {
      products.push({ productId, quantity: qty, price });
    } else { valid = false; }
  });

  if (!valid || !products.length) {
    showToast('Please fill all product fields correctly', 'error');
    return;
  }

  const body = {
    userId:      document.getElementById('order-user').value,
    products,
    totalAmount: parseFloat(document.getElementById('order-total').value),
    status:      document.getElementById('order-status').value,
  };

  const btn = document.getElementById('order-submit-btn');
  btn.disabled = true;
  btn.textContent = id ? 'Saving…' : 'Creating…';
  try {
    if (id) {
      await apiFetch(`/orders/${id}`, { method: 'PUT', body: JSON.stringify({ status: body.status, totalAmount: body.totalAmount, products: body.products }) });
      showToast('Order updated successfully', 'success');
    } else {
      await apiFetch('/orders', { method: 'POST', body: JSON.stringify(body) });
      showToast('Order created successfully', 'success');
    }
    closeModal('order-modal');
    loadOrders();
  } catch (err) {
    showToast('Failed to save order', 'error', err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = id ? 'Save Changes' : 'Create Order';
  }
}

function editOrder(id) {
  const order = allOrders.find(o => o._id === id);
  if (!order) return;
  // For editing, open modal in update mode (status + total only for simplicity)
  openOrderModal().then(() => {
    document.getElementById('order-id').value = order._id;
    document.getElementById('order-modal-title').textContent = 'Edit Order';
    document.getElementById('order-submit-btn').textContent = 'Save Changes';
    document.getElementById('order-status').value = order.status;
    document.getElementById('order-total').value  = order.totalAmount;
    if (order.userId?._id || order.userId) {
      document.getElementById('order-user').value = order.userId?._id || order.userId;
    }
  });
}

function viewOrder(id) {
  const o = allOrders.find(x => x._id === id);
  if (!o) return;
  const customerName = o.userId?.name || o.userId || 'Unknown';
  const productRows = Array.isArray(o.products) && o.products.length
    ? o.products.map(p => `
        <div class="detail-product-item">
          <span>${p.productId?.name || p.productId || 'Unknown Product'} × ${p.quantity}</span>
          <span style="color:var(--accent-green)">${formatCurrency(p.price)}</span>
        </div>`).join('')
    : '<p style="color:var(--text-muted);font-size:.82rem;">No products listed</p>';

  document.getElementById('detail-modal-title').textContent = 'Order Details';
  document.getElementById('detail-content').innerHTML = `
    <div class="detail-field"><div class="detail-field-label">Order ID</div><div class="detail-field-value mono">${o._id}</div></div>
    <div class="detail-field"><div class="detail-field-label">Customer</div><div class="detail-field-value">${escHtml(String(customerName))}</div></div>
    <div class="detail-field"><div class="detail-field-label">Status</div><div class="detail-field-value"><span class="badge badge-${o.status}">${o.status}</span></div></div>
    <div class="detail-field"><div class="detail-field-label">Total Amount</div><div class="detail-field-value" style="color:var(--accent-green);font-weight:700;">${formatCurrency(o.totalAmount)}</div></div>
    <hr class="detail-divider">
    <div class="detail-field">
      <div class="detail-field-label">Products</div>
      <div class="detail-products-list">${productRows}</div>
    </div>
    ${o.createdAt ? `<hr class="detail-divider"><div class="detail-field"><div class="detail-field-label">Created At</div><div class="detail-field-value">${new Date(o.createdAt).toLocaleString()}</div></div>` : ''}`;
  openModal('detail-modal');
}

function deleteOrder(id) {
  document.getElementById('delete-message').textContent = `Are you sure you want to delete order #${shortId(id)}? This action cannot be undone.`;
  pendingDeleteFn = async () => {
    await apiFetch(`/orders/${id}`, { method: 'DELETE' });
    showToast('Order deleted', 'success');
    loadOrders();
  };
  openModal('delete-modal');
}

// ── Delete Confirmation ───────────────────
async function confirmDelete() {
  if (!pendingDeleteFn) return;
  const btn = document.getElementById('delete-confirm-btn');
  btn.disabled = true;
  btn.textContent = 'Deleting…';
  try {
    await pendingDeleteFn();
    closeModal('delete-modal');
  } catch (err) {
    showToast('Failed to delete', 'error', err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Delete';
    pendingDeleteFn = null;
  }
}

// ── "Add" button overrides for reset ─────
document.addEventListener('DOMContentLoaded', () => {
  // Override "Add User" button
  document.querySelector('[onclick="openModal(\'user-modal\')"]')
    ?.setAttribute('onclick', 'openAddUserModal()');

  // Override "Add Product" button
  document.querySelector('[onclick="openModal(\'product-modal\')"]')
    ?.addEventListener('click', () => {
      document.getElementById('product-form').reset();
      document.getElementById('product-id').value = '';
      document.getElementById('product-modal-title').textContent = 'Add Product';
      document.getElementById('product-submit-btn').textContent = 'Create Product';
    });

  // Override "Add Order" button
  document.querySelector('[onclick="openModal(\'order-modal\')"]')
    ?.setAttribute('onclick', 'openOrderModal()');
});

// ── Security Helpers ──────────────────────
function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ── Keyboard Shortcuts ────────────────────
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.open').forEach(m => m.classList.remove('open'));
  }
});

// ── Init ──────────────────────────────────
(async () => {
  await checkApiStatus();
  setInterval(checkApiStatus, 30000);
  loadDashboard();
})();
