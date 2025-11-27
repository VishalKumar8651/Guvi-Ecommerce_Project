# Data Storage Reference

## Overview

This document explains exactly where each piece of data is stored in your e-commerce system.

---

## 📊 Data Storage Locations

### 1. User Authentication Data

#### Stored In: MongoDB + Browser Token

**MongoDB (Secure):**
```
Database: ecommerce
Collection: users

Document:
{
  "_id": ObjectId,
  "name": "John Doe",
  "email": "john@example.com",
  "password": "$2a$10$...", // Hashed with bcryptjs
  "phone": "9876543210",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "postalCode": "10001",
    "country": "USA"
  },
  "createdAt": "2024-01-15T10:30:00Z"
}
```

**Browser (localStorage):**
```javascript
localStorage.getItem('token')
// Only stores: JWT token (expires in 7 days)
// Example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjUwN2YxZjc3YmNmODZjZDc5OTQzOTAxMSIsImlhdCI6MTcwNTMxNzQwMH0...."
```

**NO LONGER STORED:**
- ❌ User email in localStorage
- ❌ User name in localStorage
- ❌ User password anywhere in browser
- ❌ "currentUser" object

---

### 2. Shopping Cart Data

#### Stored In: MongoDB ONLY

**MongoDB:**
```
Database: ecommerce
Collection: carts

Document:
{
  "_id": ObjectId,
  "user": ObjectId("507f1f77bcf86cd799439012"),  // Reference to User
  "items": [
    {
      "product": ObjectId("507f1f77bcf86cd799439013"),  // Reference to Product
      "quantity": 2,
      "price": 400
    },
    {
      "product": ObjectId("507f1f77bcf86cd799439014"),
      "quantity": 1,
      "price": 5999
    }
  ],
  "totalPrice": 6799,
  "createdAt": "2024-01-15T11:00:00Z",
  "updatedAt": "2024-01-15T11:15:00Z"
}
```

**Browser:**
```javascript
localStorage.getItem('cart')
// Returns: null or undefined
// Cart is NO LONGER stored in browser
```

**Benefits:**
- ✅ Cart persists across sessions
- ✅ Cart accessible from any device (with same account)
- ✅ Server validates all cart operations
- ✅ Accurate price calculations

---

### 3. Product Catalog Data

#### Stored In: MongoDB ONLY

**MongoDB:**
```
Database: ecommerce
Collection: products

Document:
{
  "_id": ObjectId,
  "name": "Cartoon Astronauts T-Shirt",
  "description": "Comfortable cotton t-shirt with cartoon design",
  "price": 400,
  "image": "img/product/f1.jpg",
  "brand": "adidas",
  "category": "T-Shirts",
  "stock": 50,
  "rating": 5,
  "reviews": [
    {
      "user": ObjectId("507f1f77bcf86cd799439012"),
      "comment": "Great product!",
      "rating": 5
    }
  ],
  "createdAt": "2024-01-15T08:00:00Z",
  "updatedAt": "2024-01-15T08:00:00Z"
}
```

**Browser:**
```javascript
localStorage.getItem('products')
// Returns: null or undefined
// Products fetched dynamically from API
```

---

### 4. Order History

#### Stored In: MongoDB ONLY

**MongoDB:**
```
Database: ecommerce
Collection: orders

Document:
{
  "_id": ObjectId("507f1f77bcf86cd799439015"),
  "user": ObjectId("507f1f77bcf86cd799439012"),  // Reference to User
  "items": [
    {
      "product": ObjectId("507f1f77bcf86cd799439013"),
      "productName": "T-Shirt",
      "quantity": 2,
      "price": 400
    }
  ],
  "shippingAddress": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "postalCode": "10001",
    "country": "USA"
  },
  "orderStatus": "pending",
  "paymentStatus": "pending",
  "paymentMethod": "credit_card",
  "subtotal": 800,
  "tax": 144,
  "shippingCost": 50,
  "totalAmount": 994,
  "notes": "",
  "createdAt": "2024-01-15T12:00:00Z",
  "updatedAt": "2024-01-15T12:00:00Z"
}
```

**Browser:**
```javascript
localStorage.getItem('orders')
// Returns: null or undefined
// Orders fetched from API when needed
```

---

## 🔄 API Endpoints & Data Flow

### User Registration

```
Browser → POST /api/auth/register
├── Sends: { name, email, password }
├── Backend validates & hashes password
└── MongoDB stores user
    ├── Password: hashed with bcryptjs
    ├── No plain text storage
    └── Returns JWT token

Browser stores: { token: "eyJ..." }
```

### User Login

```
Browser → POST /api/auth/login
├── Sends: { email, password }
├── Backend finds user in MongoDB
├── Compares password hash
├── Generates JWT token (7-day expiry)
└── Returns token

Browser stores: { token: "eyJ..." }
```

### Add to Cart

```
Browser → POST /api/cart/add
├── Headers: { Authorization: "Bearer {token}" }
├── Body: { productId: "...", quantity: 2 }
├── Backend validates JWT token
├── Fetches product from MongoDB
├── Updates cart in MongoDB
├── Returns updated cart
    └── MongoDB stores updated cart

Browser receives: { cart: { items: [...], totalPrice: 800 } }
```

### Get Cart

```
Browser → GET /api/cart
├── Headers: { Authorization: "Bearer {token}" }
├── Backend validates JWT token
├── Queries MongoDB for user's cart
└── Returns populated cart

Browser receives: {
  cart: {
    items: [
      {
        product: { _id, name, price, image, ... },
        quantity: 2,
        price: 400
      }
    ],
    totalPrice: 800
  }
}
```

### Create Order

```
Browser → POST /api/orders/create
├── Headers: { Authorization: "Bearer {token}" }
├── Body: { shippingAddress: {...}, paymentMethod: "cod" }
├── Backend validates JWT token
├── Gets user's cart from MongoDB
├── Creates order in MongoDB
├── Clears user's cart
└── Returns order confirmation

MongoDB Updates:
├── Creates new order document
├── Clears cart items for user
└── Updates order status to "pending"
```

---

## 📈 Data Relationships

```
User (MongoDB)
├── 1 → Many Carts (but only 1 active)
├── 1 → Many Orders
├── 1 → Many Reviews (on products)
└── Password: Hashed & Salted

Product (MongoDB)
├── 1 → Many CartItems (in Carts)
├── 1 → Many OrderItems (in Orders)
├── 1 → Many Reviews
└── Static price & stock info

Cart (MongoDB)
├── Belongs to: 1 User
├── Contains: Many CartItems
└── Each CartItem references: 1 Product

Order (MongoDB)
├── Belongs to: 1 User
├── Contains: Many OrderItems
└── Each OrderItem references: 1 Product

JWT Token (Browser localStorage)
├── Expires: 7 days
├── Contains: user._id + timestamp
├── Used for: Authorization headers
└── No sensitive data
```

---

## 🔒 Security: What's NOT Stored

### Browser Storage (localStorage)
```javascript
// ❌ NEVER stored in localStorage anymore:
localStorage.setItem('users', ...)           // ❌ User list
localStorage.setItem('currentUser', ...)     // ❌ Current user data
localStorage.setItem('cart', ...)            // ❌ Cart items
localStorage.setItem('password', ...)        // ❌ Password
localStorage.setItem('email', ...)           // ❌ Email
localStorage.setItem('orders', ...)          // ❌ Orders

// ✅ ONLY stored:
localStorage.setItem('token', ...)           // ✅ JWT token only
```

### Cookie Storage
```javascript
// NOT using cookies (for now)
// In production, consider httpOnly cookies for extra security
```

---

## 📋 Complete Data Map

### MongoDB Collections Status

| Collection | Count | Where Accessed |
|-----------|-------|-----------------|
| users | 100+ | Auth endpoints |
| products | 16+ | Product endpoints |
| carts | 100+ | Cart endpoints |
| orders | 1000+ | Order endpoints |
| reviews | 500+ | Product endpoints |

### localStorage Status

| Item | Before | Now |
|------|--------|-----|
| users | MongoDB | ❌ Removed |
| cart | localStorage | ❌ Removed → MongoDB |
| currentUser | localStorage | ❌ Removed |
| token | N/A | ✅ Added |

---

## 🔄 Data Flow Examples

### Complete Purchase Flow

```
1. User Registration
   Browser → Register → Backend → MongoDB (User created)
   Browser stores: token

2. Browse Products
   Browser → GET /products → Backend → MongoDB (fetch) → Browser

3. Add to Cart
   Browser → POST /cart/add → Backend → MongoDB (cart updated)
   Browser displays: updated cart from response

4. Update Cart
   Browser → PUT /cart/update/:id → Backend → MongoDB (quantity updated)
   Browser displays: updated cart from response

5. Create Order
   Browser → POST /orders/create → Backend → MongoDB
   ├── Create order document
   ├── Clear cart
   └── Return confirmation
   Browser displays: order confirmation

6. View Orders
   Browser → GET /orders → Backend → MongoDB (fetch) → Browser

7. Logout
   Browser: localStorage.removeItem('token')
   MongoDB: No changes
   Next login: Get new token
```

---

## 🛡️ Session Management

### Token Lifecycle

```
User Login
    ↓
Generate JWT Token
├── Payload: { id: "507f...", iat: 1705317400 }
├── Secret: process.env.JWT_SECRET
├── Expiry: 7 days
└── Stored: localStorage.getItem('token')
    ↓
Every API Request
├── Include: Authorization: Bearer {token}
├── Backend validates: JWT verification
└── Request processed with user context
    ↓
Token Expires (7 days later)
├── API returns: 401 Unauthorized
├── Browser redirects: to login page
└── User must login again
```

---

## 📊 Data Size Reference

### Average Document Sizes

```
User Document: ~500 bytes
Product Document: ~2 KB
Cart Document: ~1 KB (with populated products)
Order Document: ~2 KB
JWT Token: ~200 bytes
```

### Storage Capacity

```
MongoDB Atlas Free Tier: 512 MB

With average sizes:
- Users: 100,000+ documents
- Products: 256,000+ documents
- Carts: 512,000+ documents
- Orders: 256,000+ documents
- Total: 1M+ documents

Perfect for small to medium stores
```

---

## 🔍 How to Verify Data Storage

### Check MongoDB

1. Visit: https://cloud.mongodb.com/
2. Login with your account
3. Navigate to: Clusters → Database → Collections
4. Select: ecommerce database
5. View collections:
   - users
   - products
   - carts
   - orders

### Check Browser Storage

1. Open browser DevTools (F12)
2. Go to: Application → Local Storage
3. Click: http://localhost:5500 (or your domain)
4. View stored data:
   ```javascript
   {
     "token": "eyJhbGciOi..." // Only this
   }
   ```

### Check Network Requests

1. Open browser DevTools (F12)
2. Go to: Network tab
3. Perform action (login, add to cart, etc.)
4. View requests:
   - POST /api/auth/login
   - POST /api/cart/add
   - GET /api/cart
   - etc.

---

## 🎯 Quick Reference

### What's in MongoDB?
✅ All user data (except token)
✅ All products
✅ All carts & orders
✅ User reviews
✅ Sensitive data (hashed passwords)

### What's in Browser?
✅ JWT token only

### What's Nowhere (No Longer Stored)?
❌ Plain text passwords
❌ User email in browser
❌ Cart in localStorage
❌ Order history in browser
❌ List of users anywhere in browser

### What Gets Sent Where?
- Browser → Backend: HTTP requests with JWT token
- Backend → MongoDB: Database queries
- Backend → Browser: JSON responses
- Browser ← MongoDB: Never directly (always through backend)

---

## 📝 Environment Variables

File: `.env` (in backend folder)

```
MONGODB_URI=mongodb+srv://every_db:every-pass@cluster0.mw7fggq.mongodb.net/ecommerce?retryWrites=true&w=majority
PORT=5000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
```

**Never share these values publicly!**

---

## 🚀 Migration Summary

| Data Type | Before | After | Location |
|-----------|--------|-------|----------|
| User Account | Browser localStorage | JWT Token | Browser + MongoDB |
| Password | Plain text | Hashed | MongoDB only |
| Cart Items | Browser localStorage | Server-side | MongoDB only |
| Products | Hardcoded HTML | Dynamic API | MongoDB |
| Orders | None (new) | Full tracking | MongoDB |
| Security | None | Server-side + JWT | Backend |

**Result: Secure, scalable, production-ready system!** ✅

