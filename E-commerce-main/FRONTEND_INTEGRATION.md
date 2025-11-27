# Frontend Integration Guide

Connect your existing HTML/CSS/JavaScript frontend to the Node.js backend.

## API Base URL

Update your frontend to use the backend API:

```javascript
const API_URL = 'http://localhost:5000/api';
```

## Authentication

### Registration
```javascript
async function register(name, email, password) {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password })
  });
  const data = await response.json();
  if (data.success) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
  }
  return data;
}
```

### Login
```javascript
async function login(email, password) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await response.json();
  if (data.success) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
  }
  return data;
}
```

### Get Current User
```javascript
async function getCurrentUser() {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/auth/me`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return await response.json();
}
```

## Products

### Get All Products
```javascript
async function getProducts(search = '', category = '', page = 1, limit = 10) {
  let url = `${API_URL}/products?page=${page}&limit=${limit}`;
  if (search) url += `&search=${search}`;
  if (category) url += `&category=${category}`;
  
  const response = await fetch(url);
  return await response.json();
}
```

### Get Single Product
```javascript
async function getProduct(id) {
  const response = await fetch(`${API_URL}/products/${id}`);
  return await response.json();
}
```

### Create Product (Admin)
```javascript
async function createProduct(productData) {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(productData)
  });
  return await response.json();
}
```

## Shopping Cart

### Add to Cart
```javascript
async function addToCart(productId, quantity = 1) {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/cart/add`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ productId, quantity })
  });
  return await response.json();
}
```

### Get Cart
```javascript
async function getCart() {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/cart`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return await response.json();
}
```

### Update Cart Item
```javascript
async function updateCartItem(productId, quantity) {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/cart/update/${productId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ quantity })
  });
  return await response.json();
}
```

### Remove from Cart
```javascript
async function removeFromCart(productId) {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/cart/remove/${productId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return await response.json();
}
```

### Clear Cart
```javascript
async function clearCart() {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/cart/clear`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return await response.json();
}
```

## Orders

### Create Order
```javascript
async function createOrder(shippingAddress, paymentMethod = 'cash_on_delivery') {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/orders/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ shippingAddress, paymentMethod })
  });
  return await response.json();
}
```

### Get User Orders
```javascript
async function getUserOrders() {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/orders`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return await response.json();
}
```

### Get Single Order
```javascript
async function getOrder(orderId) {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/orders/${orderId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return await response.json();
}
```

## Updated script.js Integration

Add to your existing `script.js`:

```javascript
const API_URL = 'http://localhost:5000/api';

function getToken() {
  return localStorage.getItem('token');
}

function isLoggedIn() {
  return !!getToken();
}

async function handleAddToCart(productId, quantity = 1) {
  if (!isLoggedIn()) {
    // Redirect to login
    window.location.href = 'signin.html';
    return;
  }
  
  const result = await addToCart(productId, quantity);
  if (result.success) {
    alert('Product added to cart!');
  } else {
    alert('Error adding to cart');
  }
}

async function displayCart() {
  const cartData = await getCart();
  if (cartData.success) {
    const cart = cartData.cart;
    displayCartItems(cart.items);
    updateCartTotal(cart.totalPrice);
  }
}

function displayCartItems(items) {
  const cartContainer = document.getElementById('cart-items');
  cartContainer.innerHTML = items.map(item => `
    <div class="cart-item">
      <img src="${item.product.image}" alt="${item.product.name}">
      <div>
        <h4>${item.product.name}</h4>
        <p>Rs. ${item.product.price}</p>
      </div>
      <input type="number" value="${item.quantity}" onchange="updateItem('${item.product._id}', this.value)">
      <button onclick="removeItem('${item.product._id}')">Remove</button>
    </div>
  `).join('');
}

async function handleCheckout() {
  if (!isLoggedIn()) {
    window.location.href = 'signin.html';
    return;
  }
  
  const shippingAddress = {
    street: document.getElementById('street').value,
    city: document.getElementById('city').value,
    state: document.getElementById('state').value,
    postalCode: document.getElementById('postalCode').value,
    country: document.getElementById('country').value
  };
  
  const result = await createOrder(shippingAddress);
  if (result.success) {
    alert('Order created successfully!');
    window.location.href = 'dashboard.html';
  } else {
    alert('Error creating order');
  }
}
```

## Update HTML Files

### signin.html - Update Login Form
```html
<form onsubmit="handleLogin(event)">
  <input type="email" id="email" placeholder="Email" required>
  <input type="password" id="password" placeholder="Password" required>
  <button type="submit">Sign In</button>
</form>

<script>
async function handleLogin(event) {
  event.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const result = await login(email, password);
  if (result.success) {
    window.location.href = 'index.html';
  } else {
    alert(result.message);
  }
}
</script>
```

### signup.html - Update Registration Form
```html
<form onsubmit="handleRegister(event)">
  <input type="text" id="name" placeholder="Full Name" required>
  <input type="email" id="email" placeholder="Email" required>
  <input type="password" id="password" placeholder="Password" required>
  <button type="submit">Sign Up</button>
</form>

<script>
async function handleRegister(event) {
  event.preventDefault();
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const result = await register(name, email, password);
  if (result.success) {
    window.location.href = 'index.html';
  } else {
    alert(result.message);
  }
}
</script>
```

## CORS Configuration

The backend already has CORS enabled for all origins. If you need to restrict it, update `server.js`:

```javascript
app.use(cors({
  origin: 'http://localhost:5500'  // Your frontend URL
}));
```

## Testing with Postman

1. Import the API endpoints into Postman
2. Test each endpoint with sample data
3. Save successful requests for team reference

## Common Issues

### Token Expired
- Token expires after 7 days (set in `.env`)
- User needs to login again
- Store token with expiration time

### CORS Error
- Make sure backend is running
- Check API_URL is correct
- Verify CORS is enabled in backend

### Product not Showing
- Verify product data exists in MongoDB
- Check product image paths are correct
- Ensure search query matches product names
