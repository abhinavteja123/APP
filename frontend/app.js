/* ========================================================
   Simple Frontend Script for MERN CRUD Admin Dashboard
   Handles Navigation, Data Loading, and API CRUD requests
   ======================================================== */

// The base URL for our backend API
const API_URL = 'http://localhost:5000/api';

// Global cache variables to store data locally
let usersList = [];
let productsList = [];
let ordersList = [];

// ==========================================
// 1. Navigation & UI Section Switching
// ==========================================

function showSection(sectionId) {
  // Hide all sections first
  const sections = ['dashboard', 'users', 'products', 'orders'];
  sections.forEach(sec => {
    document.getElementById(`section-${sec}`).classList.add('hidden');
    document.getElementById(`btn-${sec}`).classList.remove('active');
  });

  // Show the selected section
  document.getElementById(`section-${sectionId}`).classList.remove('hidden');
  document.getElementById(`btn-${sectionId}`).classList.add('active');

  // Trigger data loading depending on the section clicked
  if (sectionId === 'dashboard') {
    loadDashboardStats();
  } else if (sectionId === 'users') {
    loadUsers();
  } else if (sectionId === 'products') {
    loadProducts();
  } else if (sectionId === 'orders') {
    loadOrders();
  }
}

// ==========================================
// 2. Status check & Toast Notifications
// ==========================================

async function checkApiStatus() {
  const statusText = document.getElementById('status-text');
  try {
    const res = await fetch(`${API_URL}/users`);
    if (res.ok) {
      statusText.textContent = 'Online';
      statusText.className = 'status-online';
    } else {
      statusText.textContent = 'Error';
      statusText.className = 'status-offline';
    }
  } catch (error) {
    statusText.textContent = 'Offline';
    statusText.className = 'status-offline';
  }
}

function showToast(message, type = 'info') {
  const banner = document.getElementById('toast-banner');
  banner.textContent = message;
  banner.className = `toast-banner toast-${type}`;
  banner.classList.remove('hidden');

  // Auto-hide the message after 4 seconds
  setTimeout(() => {
    banner.classList.add('hidden');
  }, 4000);
}

// ==========================================
// 3. Dashboard Logic
// ==========================================

async function loadDashboardStats() {
  try {
    // Parallel fetch all data for faster rendering
    const [usersRes, productsRes, ordersRes] = await Promise.all([
      fetch(`${API_URL}/users`),
      fetch(`${API_URL}/products`),
      fetch(`${API_URL}/orders`)
    ]);

    const users = await usersRes.json();
    const products = await productsRes.json();
    const orders = await ordersRes.json();

    usersList = users;
    productsList = products;
    ordersList = orders;

    // Update the numbers in the DOM
    document.getElementById('count-users').textContent = users.length;
    document.getElementById('count-products').textContent = products.length;
    document.getElementById('count-orders').textContent = orders.length;

    // Calculate revenue (Sum of all orders totalAmount)
    const revenue = orders.reduce((sum, order) => sum + (Number(order.totalAmount) || 0), 0);
    document.getElementById('count-revenue').textContent = `₹${revenue.toLocaleString('en-IN')}`;

  } catch (error) {
    console.error('Error loading dashboard stats:', error);
    showToast('Failed to load dashboard statistics', 'error');
  }
}

// ==========================================
// 4. Users CRUD
// ==========================================

async function loadUsers() {
  const tableBody = document.getElementById('users-table-body');
  tableBody.innerHTML = '<tr><td colspan="5">Loading users...</td></tr>';

  try {
    const res = await fetch(`${API_URL}/users`);
    usersList = await res.json();

    if (usersList.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="5">No users found. Click "+ Add New User" to create one.</td></tr>';
      return;
    }

    tableBody.innerHTML = '';
    usersList.forEach(user => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td><strong>${escapeHtml(user.name)}</strong></td>
        <td>${escapeHtml(user.email)}</td>
        <td>${escapeHtml(user.phone)}</td>
        <td>${escapeHtml(user.address)}</td>
        <td>
          <button class="edit-btn" onclick="editUser('${user._id}')">Edit</button>
          <button class="delete-btn" onclick="deleteUser('${user._id}')">Delete</button>
        </td>
      `;
      tableBody.appendChild(row);
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    tableBody.innerHTML = '<tr><td colspan="5">Error loading users data from API.</td></tr>';
  }
}

function openAddUserForm() {
  document.getElementById('user-form').reset();
  document.getElementById('user-id').value = '';
  document.getElementById('user-form-title').textContent = 'Add User';
  document.getElementById('user-form-container').classList.remove('hidden');
}

function closeUserForm() {
  document.getElementById('user-form-container').classList.add('hidden');
}

async function handleUserSubmit(event) {
  event.preventDefault();

  const id = document.getElementById('user-id').value;
  const name = document.getElementById('user-name').value;
  const email = document.getElementById('user-email').value;
  const phone = document.getElementById('user-phone').value;
  const address = document.getElementById('user-address').value;

  const userData = { name, email, phone, address };

  try {
    let response;
    if (id) {
      // UPDATE existing user
      response = await fetch(`${API_URL}/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
    } else {
      // CREATE new user
      response = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
    }

    if (response.ok) {
      showToast(id ? 'User updated successfully!' : 'User created successfully!', 'success');
      closeUserForm();
      loadUsers();
    } else {
      const err = await response.json();
      showToast(err.message || 'Error saving user', 'error');
    }
  } catch (error) {
    console.error('Error saving user:', error);
    showToast('Network error saving user', 'error');
  }
}

function editUser(userId) {
  const user = usersList.find(u => u._id === userId);
  if (!user) return;

  document.getElementById('user-id').value = user._id;
  document.getElementById('user-name').value = user.name;
  document.getElementById('user-email').value = user.email;
  document.getElementById('user-phone').value = user.phone;
  document.getElementById('user-address').value = user.address;

  document.getElementById('user-form-title').textContent = 'Edit User';
  document.getElementById('user-form-container').classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function deleteUser(userId) {
  if (!confirm('Are you sure you want to delete this user?')) return;

  try {
    const response = await fetch(`${API_URL}/users/${userId}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      showToast('User deleted successfully!', 'success');
      loadUsers();
    } else {
      showToast('Error deleting user', 'error');
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    showToast('Network error deleting user', 'error');
  }
}

// ==========================================
// 5. Products CRUD
// ==========================================

async function loadProducts() {
  const tableBody = document.getElementById('products-table-body');
  tableBody.innerHTML = '<tr><td colspan="6">Loading products...</td></tr>';

  try {
    const res = await fetch(`${API_URL}/products`);
    productsList = await res.json();

    if (productsList.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="6">No products found. Click "+ Add New Product" to create one.</td></tr>';
      return;
    }

    tableBody.innerHTML = '';
    productsList.forEach(prod => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td><strong>${escapeHtml(prod.name)}</strong></td>
        <td>${escapeHtml(prod.category)}</td>
        <td>${escapeHtml(prod.description)}</td>
        <td>₹${Number(prod.price).toLocaleString('en-IN')}</td>
        <td>${prod.quantity}</td>
        <td>
          <button class="edit-btn" onclick="editProduct('${prod._id}')">Edit</button>
          <button class="delete-btn" onclick="deleteProduct('${prod._id}')">Delete</button>
        </td>
      `;
      tableBody.appendChild(row);
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    tableBody.innerHTML = '<tr><td colspan="6">Error loading products data from API.</td></tr>';
  }
}

function openAddProductForm() {
  document.getElementById('product-form').reset();
  document.getElementById('product-id').value = '';
  document.getElementById('product-form-title').textContent = 'Add Product';
  document.getElementById('product-form-container').classList.remove('hidden');
}

function closeProductForm() {
  document.getElementById('product-form-container').classList.add('hidden');
}

async function handleProductSubmit(event) {
  event.preventDefault();

  const id = document.getElementById('product-id').value;
  const name = document.getElementById('product-name').value;
  const category = document.getElementById('product-category').value;
  const description = document.getElementById('product-description').value;
  const price = parseFloat(document.getElementById('product-price').value);
  const quantity = parseInt(document.getElementById('product-quantity').value, 10);

  const productData = { name, category, description, price, quantity };

  try {
    let response;
    if (id) {
      // UPDATE product
      response = await fetch(`${API_URL}/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });
    } else {
      // CREATE product
      response = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });
    }

    if (response.ok) {
      showToast(id ? 'Product updated successfully!' : 'Product created successfully!', 'success');
      closeProductForm();
      loadProducts();
    } else {
      const err = await response.json();
      showToast(err.message || 'Error saving product', 'error');
    }
  } catch (error) {
    console.error('Error saving product:', error);
    showToast('Network error saving product', 'error');
  }
}

function editProduct(productId) {
  const prod = productsList.find(p => p._id === productId);
  if (!prod) return;

  document.getElementById('product-id').value = prod._id;
  document.getElementById('product-name').value = prod.name;
  document.getElementById('product-category').value = prod.category;
  document.getElementById('product-description').value = prod.description;
  document.getElementById('product-price').value = prod.price;
  document.getElementById('product-quantity').value = prod.quantity;

  document.getElementById('product-form-title').textContent = 'Edit Product';
  document.getElementById('product-form-container').classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function deleteProduct(productId) {
  if (!confirm('Are you sure you want to delete this product?')) return;

  try {
    const response = await fetch(`${API_URL}/products/${productId}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      showToast('Product deleted successfully!', 'success');
      loadProducts();
    } else {
      showToast('Error deleting product', 'error');
    }
  } catch (error) {
    console.error('Error deleting product:', error);
    showToast('Network error deleting product', 'error');
  }
}

// ==========================================
// 6. Orders CRUD
// ==========================================

async function loadOrders() {
  const tableBody = document.getElementById('orders-table-body');
  tableBody.innerHTML = '<tr><td colspan="6">Loading orders...</td></tr>';

  try {
    const res = await fetch(`${API_URL}/orders`);
    ordersList = await res.json();

    if (ordersList.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="6">No orders found. Click "+ Create New Order" to create one.</td></tr>';
      return;
    }

    tableBody.innerHTML = '';
    ordersList.forEach(order => {
      // Find customer name from nested userId field or fallback
      const customerName = order.userId && order.userId.name ? order.userId.name : 'Unknown Customer';

      // Format product details string
      let productsHtml = '';
      if (Array.isArray(order.products)) {
        productsHtml = order.products.map(p => {
          const prodName = p.productId && p.productId.name ? p.productId.name : 'Product';
          return `<div>• ${escapeHtml(prodName)} (x${p.quantity}) - ₹${Number(p.price).toLocaleString('en-IN')}</div>`;
        }).join('');
      }

      const row = document.createElement('tr');
      row.innerHTML = `
        <td><code>${order._id.slice(-6).toUpperCase()}</code></td>
        <td>${escapeHtml(customerName)}</td>
        <td>${productsHtml}</td>
        <td><strong>₹${Number(order.totalAmount).toLocaleString('en-IN')}</strong></td>
        <td><span style="font-weight:bold; color:${getStatusColor(order.status)}">${escapeHtml(order.status.toUpperCase())}</span></td>
        <td>
          <button class="edit-btn" onclick="editOrder('${order._id}')">Edit Status</button>
          <button class="delete-btn" onclick="deleteOrder('${order._id}')">Delete</button>
        </td>
      `;
      tableBody.appendChild(row);
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    tableBody.innerHTML = '<tr><td colspan="6">Error loading orders data from API.</td></tr>';
  }
}

// Loads active users and products list into dropdown selectors for form creation
async function populateOrderDropdowns() {
  try {
    const [usersRes, productsRes] = await Promise.all([
      fetch(`${API_URL}/users`),
      fetch(`${API_URL}/products`)
    ]);

    usersList = await usersRes.json();
    productsList = await productsRes.json();

    // Populate user selector
    const userSelect = document.getElementById('order-user');
    userSelect.innerHTML = '<option value="">-- Choose a user --</option>';
    usersList.forEach(user => {
      const option = document.createElement('option');
      option.value = user._id;
      option.textContent = `${user.name} (${user.email})`;
      userSelect.appendChild(option);
    });
  } catch (error) {
    console.error('Error populating order dropdowns:', error);
    showToast('Failed to load customers or products details', 'error');
  }
}

function openAddOrderForm() {
  document.getElementById('order-form').reset();
  document.getElementById('order-id').value = '';
  document.getElementById('order-form-title').textContent = 'Create Order';
  document.getElementById('order-products-list').innerHTML = '';
  document.getElementById('order-total').value = '';
  
  populateOrderDropdowns().then(() => {
    // Add first product line item by default
    addOrderProductLine();
    document.getElementById('order-form-container').classList.remove('hidden');
  });
}

function closeOrderForm() {
  document.getElementById('order-form-container').classList.add('hidden');
}

// Add a product selector row to order form
function addOrderProductLine(selectedProdId = '', quantity = 1, price = 0) {
  const container = document.getElementById('order-products-list');
  const index = container.children.length;

  const row = document.createElement('div');
  row.className = 'order-prod-row';
  
  // Build product options
  let optionsHtml = '<option value="">-- Select Product --</option>';
  productsList.forEach(prod => {
    const selectedAttr = prod._id === selectedProdId ? 'selected' : '';
    optionsHtml += `<option value="${prod._id}" data-price="${prod.price}" ${selectedAttr}>${prod.name} (₹${prod.price})</option>`;
  });

  row.innerHTML = `
    <select name="product_${index}" required onchange="onOrderProductChange(this)">
      ${optionsHtml}
    </select>
    <input type="number" name="qty_${index}" min="1" value="${quantity}" required placeholder="Qty" oninput="calculateOrderTotal()">
    <input type="number" name="price_${index}" min="0" step="0.01" value="${price || ''}" required placeholder="Price" oninput="calculateOrderTotal()">
    <button type="button" class="remove-row-btn" onclick="removeOrderProductLine(this)">X</button>
  `;

  container.appendChild(row);
  calculateOrderTotal();
}

function removeOrderProductLine(button) {
  const container = document.getElementById('order-products-list');
  // Keep at least one item row
  if (container.children.length > 1) {
    button.parentElement.remove();
    calculateOrderTotal();
  } else {
    showToast('An order must contain at least 1 product line item.', 'info');
  }
}

// Auto fill unit price when selecting product
function onOrderProductChange(selectElem) {
  const priceInput = selectElem.parentElement.querySelector('input[name^="price_"]');
  const selectedOption = selectElem.options[selectElem.selectedIndex];
  const price = selectedOption.dataset.price || 0;
  priceInput.value = price;
  calculateOrderTotal();
}

// Calculates and displays the cumulative sum total for the form
function calculateOrderTotal() {
  const container = document.getElementById('order-products-list');
  let sumTotal = 0;

  for (let i = 0; i < container.children.length; i++) {
    const row = container.children[i];
    const qtyInput = row.querySelector('input[name^="qty_"]');
    const priceInput = row.querySelector('input[name^="price_"]');
    
    const qty = parseInt(qtyInput.value, 10) || 0;
    const price = parseFloat(priceInput.value) || 0;
    
    sumTotal += qty * price;
  }

  document.getElementById('order-total').value = sumTotal.toFixed(2);
}

async function handleOrderSubmit(event) {
  event.preventDefault();

  const id = document.getElementById('order-id').value;
  const userId = document.getElementById('order-user').value;
  const status = document.getElementById('order-status').value;
  const totalAmount = parseFloat(document.getElementById('order-total').value);

  // Extract products array from all lines
  const products = [];
  const container = document.getElementById('order-products-list');
  
  for (let i = 0; i < container.children.length; i++) {
    const row = container.children[i];
    const selectElem = row.querySelector('select');
    const qtyInput = row.querySelector('input[name^="qty_"]');
    const priceInput = row.querySelector('input[name^="price_"]');

    const productId = selectElem.value;
    const quantity = parseInt(qtyInput.value, 10) || 1;
    const price = parseFloat(priceInput.value) || 0;

    if (productId) {
      products.push({ productId, quantity, price });
    }
  }

  if (products.length === 0) {
    showToast('Please select at least one product.', 'error');
    return;
  }

  const orderData = { userId, products, totalAmount, status };

  try {
    let response;
    if (id) {
      // UPDATE order status/total
      // The API path supports PUT /orders/:id
      response = await fetch(`${API_URL}/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
    } else {
      // CREATE new order
      response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
    }

    if (response.ok) {
      showToast(id ? 'Order updated successfully!' : 'Order created successfully!', 'success');
      closeOrderForm();
      loadOrders();
    } else {
      const err = await response.json();
      showToast(err.message || 'Error saving order', 'error');
    }
  } catch (error) {
    console.error('Error saving order:', error);
    showToast('Network error saving order', 'error');
  }
}

async function editOrder(orderId) {
  const order = ordersList.find(o => o._id === orderId);
  if (!order) return;

  await populateOrderDropdowns();

  document.getElementById('order-id').value = order._id;
  document.getElementById('order-user').value = order.userId && order.userId._id ? order.userId._id : order.userId || '';
  document.getElementById('order-status').value = order.status;
  document.getElementById('order-total').value = order.totalAmount;

  // Clear products lines and reload products from order
  const container = document.getElementById('order-products-list');
  container.innerHTML = '';

  if (Array.isArray(order.products) && order.products.length > 0) {
    order.products.forEach(p => {
      const prodId = p.productId && p.productId._id ? p.productId._id : p.productId;
      addOrderProductLine(prodId, p.quantity, p.price);
    });
  } else {
    addOrderProductLine();
  }

  document.getElementById('order-form-title').textContent = 'Edit Order';
  document.getElementById('order-form-container').classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function deleteOrder(orderId) {
  if (!confirm('Are you sure you want to delete this order?')) return;

  try {
    const response = await fetch(`${API_URL}/orders/${orderId}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      showToast('Order deleted successfully!', 'success');
      loadOrders();
    } else {
      showToast('Error deleting order', 'error');
    }
  } catch (error) {
    console.error('Error deleting order:', error);
    showToast('Network error deleting order', 'error');
  }
}

// ==========================================
// 7. Utility Helper Functions
// ==========================================

function getStatusColor(status) {
  switch (status.toLowerCase()) {
    case 'pending': return '#ff9800';
    case 'confirmed': return '#2196f3';
    case 'shipped': return '#9c27b0';
    case 'delivered': return '#4caf50';
    default: return '#777';
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ==========================================
// 8. Initialization
// ==========================================

// Run when the script finishes loading
(async function() {
  await checkApiStatus();
  loadDashboardStats();
  
  // Set up background API status checks
  setInterval(checkApiStatus, 15000);
})();
