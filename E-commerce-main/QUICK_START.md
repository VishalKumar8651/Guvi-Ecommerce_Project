# E-Commerce Backend - Quick Start Guide

## 🚀 Overview

Your e-commerce website now has a complete **Node.js + Express + MongoDB** backend with:
- User authentication (JWT)
- Product management
- Shopping cart
- Order processing
- RESTful API

## 📋 Prerequisites

1. **Node.js & npm** installed
   - Download: https://nodejs.org/
   - Verify: `node --version` and `npm --version`

2. **MongoDB Atlas account** ✅ Already set up
   - Connection string: `mongodb+srv://every_db:every-pass@cluster0.mw7fggq.mongodb.net/ecommerce?retryWrites=true&w=majority`

## ⚡ Quick Setup (5 minutes)

### Step 1: Navigate to Backend
```cmd
cd E-commerce-main/backend
```

### Step 2: Install Dependencies
```cmd
npm install
```

### Step 3: Start Backend
```cmd
npm run dev
```

You should see:
```
MongoDB Connected
Server is running on port 5000
```

**✅ Backend is now running!**

## 🧪 Test It Immediately

### Health Check
Visit in browser: `http://localhost:5000/health`

### Create Test Account

**Register:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

Save the returned `token` for testing other endpoints.

### Get Products
```bash
curl http://localhost:5000/api/products
```

## 📂 Backend Structure

```
backend/
├── server.js                    # Main application file
├── package.json                 # Dependencies
├── .env                         # Configuration (MongoDB URI, JWT Secret)
├── seedData.js                  # Database seeding script
├── API_DOCUMENTATION.md         # Full API reference
├── README.md                    # Backend README
│
├── middleware/
│   └── auth.js                 # JWT authentication middleware
│
├── models/                      # MongoDB schemas
│   ├── User.js
│   ├── Product.js
│   ├── Cart.js
│   └── Order.js
│
└── routes/                      # API endpoints
    ├── auth.js                 # /api/auth/*
    ├── products.js             # /api/products/*
    ├── cart.js                 # /api/cart/*
    └── orders.js               # /api/orders/*
```

## 🔌 Connect Frontend to Backend

### Option 1: Update script.js (Easy)
Add this at the top of your `script.js`:

```javascript
const API_URL = 'http://localhost:5000/api';

// Helper function for login
async function login(email, password) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await response.json();
  if (data.success) {
    localStorage.setItem('token', data.token);
  }
  return data;
}

// Helper function to add products to cart
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

### Option 2: Use Integration Guide
Check `FRONTEND_INTEGRATION.md` for complete examples.

## 📊 Seed Sample Data

Add 16 sample products to database:

```cmd
node seedData.js
```

Output:
```
MongoDB Connected
16 products seeded successfully
Database connection closed
```

## 🔑 API Endpoints Summary

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (needs token)
- `PUT /api/auth/update` - Update profile (needs token)

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (needs token)
- `PUT /api/products/:id` - Update product (needs token)
- `DELETE /api/products/:id` - Delete product (needs token)

### Cart
- `GET /api/cart` - Get cart (needs token)
- `POST /api/cart/add` - Add item (needs token)
- `PUT /api/cart/update/:productId` - Update quantity (needs token)
- `DELETE /api/cart/remove/:productId` - Remove item (needs token)
- `DELETE /api/cart/clear` - Clear cart (needs token)

### Orders
- `GET /api/orders` - Get user orders (needs token)
- `GET /api/orders/:id` - Get single order (needs token)
- `POST /api/orders/create` - Create order (needs token)
- `PUT /api/orders/:id/status` - Update order status (needs token)
- `DELETE /api/orders/:id` - Cancel order (needs token)

## 🛠️ Common Commands

```cmd
# Start development server (auto-reload)
npm run dev

# Start production server
npm start

# Seed database with sample products
node seedData.js

# View MongoDB data
# Visit: https://cloud.mongodb.com/
```

## 🔐 Authentication Flow

1. **Register/Login** → Get JWT token
2. **Store token** in `localStorage`
3. **Include token** in Authorization header: `Bearer <token>`
4. Token valid for 7 days
5. After expiry, user needs to login again

## 📈 Database Structure

### Users Table
- name, email, password (hashed), phone
- address (street, city, state, postal code, country)
- createdAt timestamp

### Products Table
- name, description, price, image, brand
- category (T-Shirts, Electronics, Accessories, etc.)
- stock quantity, rating (1-5), reviews
- timestamps

### Orders Table
- user reference, items array
- shipping address
- order status (pending, shipped, delivered, etc.)
- payment status, payment method
- amounts (subtotal, tax, shipping, total)
- timestamps

### Cart Table
- user reference
- items (product + quantity + price)
- total price

## 🐛 Troubleshooting

### "npm is not recognized"
- Install Node.js from https://nodejs.org/
- Restart terminal after installation

### MongoDB Connection Error
- Verify `.env` has correct MongoDB URI
- Check if you're connected to internet
- Ensure IP is whitelisted in MongoDB Atlas

### Port 5000 Already in Use
```cmd
# Change port in .env
PORT=5001
```

### CORS Errors
- Already enabled in backend
- If still getting errors, check API_URL in frontend

### Products Not Showing
```cmd
# Seed sample products
node seedData.js
```

## 📚 Documentation Files

- `BACKEND_SETUP.md` - Detailed setup instructions
- `API_DOCUMENTATION.md` - Complete API reference
- `FRONTEND_INTEGRATION.md` - Connect frontend to backend
- `backend/README.md` - Backend-specific docs

## 🚀 Next Steps

1. ✅ Backend running
2. ✅ Database connected
3. 📝 **Update frontend** to call API endpoints
4. 🧪 **Test** each feature
5. 🔒 **Add payments** (Stripe/PayPal)
6. 📧 **Email notifications**
7. 👨‍💼 **Admin dashboard**

## 📞 Example: Complete Flow

```javascript
// 1. User registers
const registerResult = await fetch('http://localhost:5000/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123'
  })
});
const { token } = await registerResult.json();
localStorage.setItem('token', token);

// 2. Get products
const productsResult = await fetch('http://localhost:5000/api/products');
const { products } = await productsResult.json();

// 3. Add product to cart
await fetch('http://localhost:5000/api/cart/add', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    productId: products[0]._id,
    quantity: 1
  })
});

// 4. Create order
const orderResult = await fetch('http://localhost:5000/api/orders/create', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    shippingAddress: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      postalCode: '10001',
      country: 'USA'
    },
    paymentMethod: 'cash_on_delivery'
  })
});
const { order } = await orderResult.json();
console.log('Order created:', order);
```

## 💡 Pro Tips

1. **Save token in localStorage** for persistent login
2. **Check token before API calls** to avoid unnecessary requests
3. **Handle errors gracefully** - show user-friendly messages
4. **Test with Postman** before updating frontend
5. **Seed database** after setup for quick testing
6. **Monitor console errors** in browser DevTools

## 📞 Support

- Check error messages in console
- Review API_DOCUMENTATION.md for endpoint details
- Verify MongoDB connection string in .env
- Ensure Node.js and npm are up to date

---

**Your e-commerce backend is ready to use!** 🎉
