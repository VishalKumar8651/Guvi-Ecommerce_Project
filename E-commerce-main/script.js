const LOCAL_API = 'http://localhost:5000/api';
const LIVE_API = 'https://every-2.onrender.com/api';
let API_URL = LOCAL_API;
let backendAvailable = null;

async function getAvailableAPI() {
    if (backendAvailable !== null) {
        return backendAvailable ? LOCAL_API : LIVE_API;
    }

    try {
        const response = await fetch('http://localhost:5000/health', {
            method: 'GET',
            timeout: 3000
        });
        backendAvailable = response.ok;
        return backendAvailable ? LOCAL_API : LIVE_API;
    } catch (error) {
        backendAvailable = false;
        return LIVE_API;
    }
}

async function apiCall(endpoint, options = {}) {
    API_URL = await getAvailableAPI();
    return fetch(`${API_URL}${endpoint}`, options);
}
const bar = document.getElementById('bar');
const close = document.getElementById('close');
const nav = document.getElementById('navbar');

if (bar) {
    bar.addEventListener('click', () => {
        nav.classList.add('active');
    })
}
if (close) {
    close.addEventListener('click', () => {
        nav.classList.remove('active');
    })
}

function getToken() {
    return localStorage.getItem('token');
}

function isLoggedIn() {
    return !!getToken();
}

document.addEventListener('DOMContentLoaded', function () {
    updateAuthUI();

    const cartButtons = document.querySelectorAll('a[id^="cbtn"], a[id^="ecbtn"], a[id^="ec2btn"], a[id^="ec3btn"]');
    cartButtons.forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            addToCart(this);
        });
    });

    if (document.getElementById('cart')) {
        loadCartItems();
    }
});

async function addToCart(button) {
    if (!isLoggedIn()) {
        showNotification('Please login first to add items to cart', 'error');
        setTimeout(() => {
            window.location.href = 'signin.html';
        }, 2000);
        return;
    }

    const productDiv = button.closest('.pro');
    const productName = productDiv.querySelector('h5').textContent;
    const priceText = productDiv.querySelector('h4').textContent;

    try {
        const response = await apiCall(`/products?search=${encodeURIComponent(productName)}`);
        const data = await response.json();

        if (data.success && data.products.length > 0) {
            const product = data.products[0];
            const token = getToken();

            const cartResponse = await apiCall(`/cart/add`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    productId: product._id,
                    quantity: 1
                })
            });

            const cartData = await cartResponse.json();
            if (cartData.success) {
                showNotification('Product added to cart!');
            } else {
                showNotification('Error adding to cart', 'error');
            }
        } else {
            showNotification('Product not found', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error adding to cart', 'error');
    }
}

function showNotification() {
    const notification = document.getElementById('notification');
    notification.classList.add('show');
    notification.classList.remove('hide');

    // Hide notification after 3 seconds
    setTimeout(() => {
        notification.classList.add('hide');
        notification.classList.remove('show');
    }, 3000);
}

async function loadCartItems() {
    if (!isLoggedIn()) {
        window.location.href = 'signin.html';
        return;
    }

    const token = getToken();
    try {
        const response = await apiCall(`/cart`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();

        if (!data.success) {
            showNotification('Error loading cart', 'error');
            return;
        }

        const tbody = document.querySelector('#cart table tbody');
        tbody.innerHTML = '';

        const cartData = data.cart;
        const items = cartData.items || [];

        items.forEach(item => {
            const row = document.createElement('tr');
            const rowSubtotal = item.product.price * item.quantity;

            row.innerHTML = `
                <td><a href="#" class="remove-item" data-product-id="${item.product._id}"><i class="fa-regular fa-circle-xmark"></i></a></td>
                <td><img src="${item.product.image}"></td>
                <td>${item.product.name}</td>
                <td>Rs. ${item.product.price}</td>
                <td><input type="number" value="${item.quantity}" min="1" class="quantity-input" data-product-id="${item.product._id}"></td>
                <td>Rs. ${rowSubtotal}</td>
            `;
            tbody.appendChild(row);
        });

        updateCartTotal(cartData.totalPrice);

        document.querySelectorAll('.quantity-input').forEach(input => {
            input.addEventListener('change', updateCartItem);
        });

        document.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', removeCartItem);
        });
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error loading cart', 'error');
    }
}

function updateCartTotal(total) {
    const subtotalEl = document.querySelector('#subtotal td:last-child strong');
    if (subtotalEl) {
        subtotalEl.textContent = `Rs. ${total}`;
    }
}

async function updateCartItem(e) {
    const newQuantity = parseInt(e.target.value);
    const productId = e.target.dataset.productId;
    const token = getToken();

    if (newQuantity < 1) return;

    try {
        const response = await apiCall(`/cart/update/${productId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ quantity: newQuantity })
        });

        const data = await response.json();
        if (data.success) {
            loadCartItems();
        } else {
            showNotification('Error updating cart', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error updating cart', 'error');
    }
}

async function removeCartItem(e) {
    e.preventDefault();
    const productId = e.target.closest('a').dataset.productId;
    const token = getToken();

    try {
        const response = await apiCall(`/cart/remove/${productId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();
        if (data.success) {
            loadCartItems();
            showRemoveNotification();
        } else {
            showNotification('Error removing item', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error removing item', 'error');
    }
}

function showRemoveNotification() {
    const notification = document.getElementById('remove-notification');
    notification.classList.add('show');
    notification.classList.remove('hide');

    // Hide notification after 3 seconds
    setTimeout(() => {
        notification.classList.add('hide');
        notification.classList.remove('show');
    }, 3000);
}

function clearCart() {
    // Clear cart items from local storage or session
    localStorage.removeItem('cart');
    // Reload the page to reflect changes
    location.reload();
}

// Product Modal Functionality
document.addEventListener('DOMContentLoaded', function () {
    // Add click event listeners to all product containers
    const productContainers = document.querySelectorAll('.pro');
    productContainers.forEach(container => {
        container.addEventListener('click', function (e) {
            // Prevent modal opening if clicking on cart button
            if (e.target.closest('a[id^="cbtn"], a[id^="ecbtn"], a[id^="ec2btn"], a[id^="ec3btn"]')) {
                return;
            }
            openProductModal(this);
        });
    });

    // Close modal when clicking outside or on close button
    const modal = document.getElementById('product-modal');
    if (modal) {
        modal.addEventListener('click', function (e) {
            if (e.target === modal || e.target.classList.contains('close-modal')) {
                closeProductModal();
            }
        });

        // Close modal on escape key
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && modal.classList.contains('show')) {
                closeProductModal();
            }
        });
    }
});

function openProductModal(productElement) {
    const modal = document.getElementById('product-modal');
    if (!modal) return;

    // Extract product data
    const imgSrc = productElement.querySelector('img').src;
    const title = productElement.querySelector('h5').textContent;
    const brand = productElement.querySelector('span').textContent;
    const price = productElement.querySelector('h4').textContent;
    const stars = productElement.querySelector('.star').innerHTML;

    // Populate modal with product data
    document.getElementById('modal-main-img').src = imgSrc;
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-price').textContent = price;
    document.getElementById('modal-stars').innerHTML = stars;

    // Generate thumbnail images (using the same image for demo)
    const thumbnails = document.querySelectorAll('.modal-thumb');
    thumbnails.forEach(thumb => {
        thumb.src = imgSrc;
        thumb.addEventListener('click', function () {
            document.getElementById('modal-main-img').src = this.src;
            // Remove active class from all thumbnails
            thumbnails.forEach(t => t.classList.remove('active'));
            // Add active class to clicked thumbnail
            this.classList.add('active');
        });
    });

    // Set first thumbnail as active
    if (thumbnails.length > 0) {
        thumbnails[0].classList.add('active');
    }

    // Generate product description based on product type
    const description = generateProductDescription(title, brand);
    document.getElementById('modal-description').innerHTML = `<p>${description}</p>`;

    // Generate mock reviews
    const reviews = generateMockReviews();
    const reviewsList = document.getElementById('reviews-list');
    reviewsList.innerHTML = reviews.map(review => `
        <div class="review-item">
            <div class="review-author">${review.author}</div>
            <div class="review-rating">${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</div>
            <div class="review-text">${review.text}</div>
        </div>
    `).join('');

    // Update reviews count
    document.getElementById('modal-reviews-count').textContent = `(${reviews.length} reviews)`;

    // Show/hide options based on product type
    updateModalOptions(title);

    // Show modal
    modal.classList.add('show');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

function closeProductModal() {
    const modal = document.getElementById('product-modal');
    if (!modal) return;

    modal.classList.remove('show');
    document.body.style.overflow = 'auto'; // Restore scrolling
}

function generateProductDescription(title, brand) {
    const descriptions = {
        'adidas': 'High-quality product from adidas, known for comfort and style. Perfect for everyday wear.',
        'Amazon': 'Premium smart device from Amazon with advanced features and reliable performance.',
        'Canon': 'Professional-grade camera from Canon, delivering stunning image quality and versatility.',
        'iPhone': 'Latest iPhone model featuring cutting-edge technology, sleek design, and powerful performance.',
        'Samsung': 'Samsung flagship device with innovative features and exceptional display quality.',
        'Sony': 'Sony audio product delivering superior sound quality and modern design.',
        'Nokia': 'Reliable Nokia device built for durability and essential communication features.',
        'Huawe': 'Huawei product offering innovative technology and sleek design.',
        'Realme': 'Realme smartphone with impressive specifications at an affordable price.',
        'OnePlus': 'OnePlus device known for fast performance and clean Android experience.',
        'OPPO': 'OPPO smartphone featuring stunning design and advanced camera capabilities.',
        'Infinix': 'Infinix device offering great value with modern features.',
        'Rolex': 'Luxury timepiece from Rolex, symbolizing prestige and craftsmanship.',
        'Sonata': 'Elegant watch from Sonata, perfect for formal and casual occasions.',
        'Ambrane': 'Ambrane accessory providing reliable charging and connectivity solutions.',
        'TECHNO': 'TECHNO product designed for modern lifestyle and convenience.',
        'KTM': 'KTM branded item combining style and functionality.',
        'META': 'META product for immersive virtual reality experiences.',
        'Philips': 'Philips appliance known for quality and innovative design.',
        'Usha': 'Usha product offering reliable performance and durability.',
        'ANGEBOT': 'Premium hair care appliance for professional results.',
        'Surya': 'Quality lighting solution from Surya.',
        'MUCCKILY': 'MUCCKILY kitchen appliance for modern cooking needs.',
        'ARTSTUDIO': 'ARTSTUDIO musical instrument for creative expression.',
        'KEMEI': 'KEMEI grooming product for personal care.',
        'NutriPto': 'NutriPto kitchen accessory for healthy cooking.',
        'TP-Link Tapo': 'TP-Link Tapo smart home security device.',
        'default': 'High-quality product with excellent features and reliable performance.'
    };

    return descriptions[brand] || descriptions['default'];
}

function generateMockReviews() {
    const reviews = [
        {
            author: 'John D.',
            rating: 5,
            text: 'Excellent product! Exactly as described and fast shipping.'
        },
        {
            author: 'Sarah M.',
            rating: 4,
            text: 'Great quality and value for money. Highly recommended!'
        },
        {
            author: 'Mike R.',
            rating: 5,
            text: 'Amazing purchase. Works perfectly and looks fantastic.'
        },
        {
            author: 'Emma L.',
            rating: 4,
            text: 'Very satisfied with this product. Good customer service too.'
        },
        {
            author: 'David K.',
            rating: 5,
            text: 'Outstanding quality and performance. Will buy again!'
        }
    ];

    // Return random subset of reviews (2-4 reviews)
    const numReviews = Math.floor(Math.random() * 3) + 2;
    return reviews.slice(0, numReviews);
}

function updateModalOptions(title) {
    const sizeGroup = document.getElementById('size-group');
    const colorGroup = document.getElementById('color-group');
    const storageGroup = document.getElementById('storage-group');

    // Show size options for clothing items
    if (title.toLowerCase().includes('shirt') || title.toLowerCase().includes('t-shirt') ||
        title.toLowerCase().includes('pant') || title.toLowerCase().includes('kurti') ||
        title.toLowerCase().includes('watch') || title.toLowerCase().includes('shoe')) {
        sizeGroup.style.display = 'block';
    } else {
        sizeGroup.style.display = 'none';
    }

    // Show color options for most products
    if (!title.toLowerCase().includes('telephone') && !title.toLowerCase().includes('bulb')) {
        colorGroup.style.display = 'block';
    } else {
        colorGroup.style.display = 'none';
    }

    // Show storage options for phones and electronics
    if (title.toLowerCase().includes('phone') || title.toLowerCase().includes('iphone') ||
        title.toLowerCase().includes('samsung') || title.toLowerCase().includes('oneplus') ||
        title.toLowerCase().includes('oppo') || title.toLowerCase().includes('realme') ||
        title.toLowerCase().includes('infinix') || title.toLowerCase().includes('huawe') ||
        title.toLowerCase().includes('laptop')) {
        storageGroup.style.display = 'block';
    } else {
        storageGroup.style.display = 'none';
    }
}

document.addEventListener('DOMContentLoaded', function () {
    const modalAddCartBtn = document.getElementById('modal-add-cart');
    if (modalAddCartBtn) {
        modalAddCartBtn.addEventListener('click', async function () {
            if (!isLoggedIn()) {
                showNotification('Please login first to add items to cart', 'error');
                closeProductModal();
                setTimeout(() => {
                    window.location.href = 'signin.html';
                }, 2000);
                return;
            }

            const title = document.getElementById('modal-title').textContent;
            const quantity = parseInt(document.getElementById('modal-quantity').value) || 1;

            try {
                const response = await apiCall(`/products?search=${encodeURIComponent(title)}`);
                const data = await response.json();

                if (data.success && data.products.length > 0) {
                    const product = data.products[0];
                    const token = getToken();

                    const cartResponse = await apiCall(`/cart/add`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            productId: product._id,
                            quantity: quantity
                        })
                    });

                    const cartData = await cartResponse.json();
                    if (cartData.success) {
                        showNotification('Product added to cart!');
                        closeProductModal();
                    } else {
                        showNotification('Error adding to cart', 'error');
                    }
                } else {
                    showNotification('Product not found', 'error');
                }
            } catch (error) {
                console.error('Error:', error);
                showNotification('Error adding to cart', 'error');
            }
        });
    }

    // Handle "More Items" buttons on home page
    const loadMoreFeaturedBtn = document.getElementById('load-more-featured');
    const loadMoreArrivalsBtn = document.getElementById('load-more-arrivals');

    if (loadMoreFeaturedBtn) {
        loadMoreFeaturedBtn.addEventListener('click', function () {
            loadMoreProducts('featured');
        });
    }

    if (loadMoreArrivalsBtn) {
        loadMoreArrivalsBtn.addEventListener('click', function () {
            loadMoreProducts('arrivals');
        });
    }
});

function loadMoreProducts(section) {
    const additionalProducts = getAdditionalProducts(section);
    const targetSection = section === 'featured' ?
        document.querySelector('#product1 .pro-container') :
        document.querySelector('#product1.section-p1 .pro-container');

    if (targetSection) {
        additionalProducts.forEach(product => {
            const productDiv = document.createElement('div');
            productDiv.className = 'pro';
            productDiv.innerHTML = `
                <img src="${product.image}" alt="">
                <div class="des">
                    <span>${product.brand}</span>
                    <h5>${product.name}</h5>
                    <div class="star">
                        ${'★'.repeat(product.rating)}${'☆'.repeat(5 - product.rating)}
                    </div>
                    <h4>${product.price}</h4>
                </div>
                <a href="#"><i class="fa-solid fa-cart-shopping cart"></i></a>
            `;
            targetSection.appendChild(productDiv);
        });

        // Re-attach modal event listeners to new products
        attachModalListeners();
    }
}

function getAdditionalProducts(section) {
    if (section === 'featured') {
        return [
            {
                image: 'img/product/n1.jpg',
                brand: 'adidas',
                name: 'Sky-blue Shirt',
                rating: 5,
                price: 'Rs. 500'
            },
            {
                image: 'img/product/n2.jpg',
                brand: 'adidas',
                name: 'Men Shirts',
                rating: 5,
                price: 'Rs. 400'
            },
            {
                image: 'img/product/n3.jpg',
                brand: 'adidas',
                name: 'Plain White Shirts',
                rating: 5,
                price: 'Rs. 500'
            },
            {
                image: 'img/product/n4.jpg',
                brand: 'adidas',
                name: 'Half printed Shirts',
                rating: 5,
                price: 'Rs. 400'
            }
        ];
    } else if (section === 'arrivals') {
        return [
            {
                image: 'img/elect/earphone-e9.jpg',
                brand: 'adidas',
                name: 'Earphone (White color)',
                rating: 5,
                price: 'Rs. 100'
            },
            {
                image: 'img/elect/clock-e10.jpg',
                brand: 'Sonata',
                name: 'Men Watch',
                rating: 5,
                price: 'Rs. 600'
            },
            {
                image: 'img/elect/e11.jpg',
                brand: 'adidas',
                name: 'Smeg Electric Kettle',
                rating: 5,
                price: 'Rs. 400'
            },
            {
                image: 'img/elect/laptop-e12.jpg',
                brand: 'adidas',
                name: 'Dell Refurbished Laptop',
                rating: 5,
                price: 'Rs. 40,000'
            }
        ];
    }
    return [];
}

function attachModalListeners() {
    const productContainers = document.querySelectorAll('.pro');
    productContainers.forEach(container => {
        // Remove existing listeners to avoid duplicates
        container.removeEventListener('click', handleProductClick);
        // Add new listener
        container.addEventListener('click', handleProductClick);
    });
}

function handleProductClick(e) {
    // Prevent modal opening if clicking on cart button
    if (e.target.closest('a[id^="cbtn"], a[id^="ecbtn"], a[id^="ec2btn"], a[id^="ec3btn"]')) {
        return;
    }
    openProductModal(this);
}

// Authentication Functions
document.addEventListener('DOMContentLoaded', function () {
    // Handle Sign Up Form
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', function (e) {
            e.preventDefault();
            handleSignup();
        });
    }

    // Handle Sign In Form
    const signinForm = document.getElementById('signin-form');
    if (signinForm) {
        signinForm.addEventListener('submit', function (e) {
            e.preventDefault();
            handleSignin();
        });
    }

    // Check if user is logged in and update UI
    updateAuthUI();
});

async function handleSignup() {
    const name = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    clearErrors();

    let hasError = false;

    if (name.length < 3) {
        showError('username-error', 'Name must be at least 3 characters long');
        hasError = true;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showError('email-error', 'Please enter a valid email address');
        hasError = true;
    }

    if (password.length < 6) {
        showError('password-error', 'Password must be at least 6 characters long');
        hasError = true;
    }

    if (password !== confirmPassword) {
        showError('confirm-password-error', 'Passwords do not match');
        hasError = true;
    }

    if (hasError) return;

    try {
        const response = await apiCall(`/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();

        if (!data.success) {
            showError('email-error', data.message || 'Registration failed');
            return;
        }

        localStorage.setItem('token', data.token);
        showNotification('Account created successfully!');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
    } catch (error) {
        console.error('Error:', error);
        showError('email-error', 'An error occurred during registration');
    }
}

async function handleSignin() {
    const email = document.getElementById('signin-username').value.trim();
    const password = document.getElementById('signin-password').value;

    clearErrors();

    let hasError = false;

    if (!email) {
        showError('signin-username-error', 'Please enter your email');
        hasError = true;
    }

    if (!password) {
        showError('signin-password-error', 'Please enter your password');
        hasError = true;
    }

    if (hasError) return;

    try {
        const response = await apiCall(`/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!data.success) {
            showError('signin-username-error', data.message || 'Invalid credentials');
            showError('signin-password-error', data.message || 'Invalid credentials');
            return;
        }

        localStorage.setItem('token', data.token);
        showNotification('Signed in successfully!');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
    } catch (error) {
        console.error('Error:', error);
        showError('signin-username-error', 'An error occurred during login');
    }
}

function updateAuthUI() {
    const token = getToken();
    const signinBtn = document.getElementById('signin-btn');
    const profileBtn = document.getElementById('profile-btn');

    if (token) {
        if (signinBtn) signinBtn.style.display = 'none';
        if (profileBtn) {
            profileBtn.style.display = 'block';
            profileBtn.addEventListener('click', function (e) {
                e.preventDefault();
                window.location.href = 'dashboard.html';
            });
        }
    } else {
        if (signinBtn) signinBtn.style.display = 'block';
        if (profileBtn) profileBtn.style.display = 'none';
    }
}

function showNotification(message = 'Product added to cart!', type = 'success') {
    const notification = document.getElementById('notification');
    if (!notification) return;

    notification.querySelector('span').textContent = message;

    if (type === 'error') {
        notification.style.backgroundColor = '#ff6b6b';
    } else {
        notification.style.backgroundColor = '#088178';
    }

    notification.classList.add('show');
    notification.classList.remove('hide');

    // Hide notification after 3 seconds
    setTimeout(() => {
        notification.classList.add('hide');
        notification.classList.remove('show');
    }, 3000);
}

// Checkout Functions
async function loadCheckoutItems() {
    if (!isLoggedIn()) {
        window.location.href = 'signin.html';
        return;
    }

    const token = getToken();
    try {
        const response = await apiCall(`/cart`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();

        if (!data.success) {
            showNotification('Error loading cart', 'error');
            return;
        }

        const itemsContainer = document.getElementById('checkout-items');
        const subtotalEl = document.getElementById('checkout-subtotal');
        const totalEl = document.getElementById('checkout-total');

        if (!itemsContainer) return;

        const cartData = data.cart;
        const items = cartData.items || [];

        if (items.length === 0) {
            itemsContainer.innerHTML = '<p style="text-align: center;">Your cart is empty.</p>';
            if (subtotalEl) subtotalEl.textContent = 'Rs. 0';
            if (totalEl) totalEl.textContent = 'Rs. 0';
            return;
        }

        itemsContainer.innerHTML = items.map(item => `
            <div class="order-item">
                <div style="display: flex; align-items: center;">
                    <img src="${item.product.image}" alt="${item.product.name}">
                    <div class="item-details">
                        <h5>${item.product.name}</h5>
                        <p>Qty: ${item.quantity}</p>
                    </div>
                </div>
                <span>Rs. ${item.product.price * item.quantity}</span>
            </div>
        `).join('');

        if (subtotalEl) subtotalEl.textContent = `Rs. ${cartData.totalPrice}`;
        if (totalEl) totalEl.textContent = `Rs. ${cartData.totalPrice}`;

    } catch (error) {
        console.error('Error:', error);
        showNotification('Error loading checkout items', 'error');
    }
}

async function placeOrder() {
    if (!isLoggedIn()) {
        window.location.href = 'signin.html';
        return;
    }

    // Validate form
    const form = document.getElementById('checkout-form');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const token = getToken();
    try {
        // 1. Get current cart items to remove them one by one (since we don't have a clear cart API)
        const cartResponse = await apiCall(`/cart`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const cartData = await cartResponse.json();

        if (!cartData.success || !cartData.cart.items || cartData.cart.items.length === 0) {
            showNotification('Your cart is empty', 'error');
            return;
        }

        const items = cartData.cart.items;

        // 2. Simulate order placement (In a real app, we would send order details to backend)
        // For now, we just clear the cart

        let successCount = 0;
        for (const item of items) {
            const deleteResponse = await apiCall(`/cart/remove/${item.product._id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const deleteData = await deleteResponse.json();
            if (deleteData.success) {
                successCount++;
            }
        }

        if (successCount === items.length) {
            showNotification('Order placed successfully!');
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 2000);
        } else {
            showNotification('Order placed with some issues. Please check your dashboard.', 'warning');
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 2000);
        }

    } catch (error) {
        console.error('Error placing order:', error);
        showNotification('Error placing order', 'error');
    }
}



function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    const inputElement = errorElement.previousElementSibling;

    if (errorElement && inputElement) {
        errorElement.textContent = message;
        errorElement.classList.add('show');
        inputElement.classList.add('error');
        inputElement.classList.remove('success');
    }
}

function clearErrors() {
    // Clear all error messages
    const errorMessages = document.querySelectorAll('.error-message');
    errorMessages.forEach(error => {
        error.textContent = '';
        error.classList.remove('show');
    });

    // Clear all input error states
    const inputs = document.querySelectorAll('.form-control');
    inputs.forEach(input => {
        input.classList.remove('error', 'success');
    });
}

// Add real-time validation
document.addEventListener('DOMContentLoaded', function () {
    // Real-time validation for signup form
    const signupInputs = document.querySelectorAll('#signup-form .form-control');
    signupInputs.forEach(input => {
        input.addEventListener('blur', function () {
            validateField(this);
        });
        input.addEventListener('input', function () {
            if (this.classList.contains('error')) {
                validateField(this);
            }
        });
    });

    // Real-time validation for signin form
    const signinInputs = document.querySelectorAll('#signin-form .form-control');
    signinInputs.forEach(input => {
        input.addEventListener('blur', function () {
            validateField(this);
        });
        input.addEventListener('input', function () {
            if (this.classList.contains('error')) {
                validateField(this);
            }
        });
    });
});

function validateField(input) {
    const value = input.value.trim();
    const fieldName = input.id;
    let isValid = false;
    let errorMessage = '';

    switch (fieldName) {
        case 'username':
            if (value.length < 3) {
                errorMessage = 'Username must be at least 3 characters';
            } else {
                isValid = true;
            }
            break;
        case 'email':
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                errorMessage = 'Please enter a valid email';
            } else {
                isValid = true;
            }
            break;
        case 'password':
            if (value.length < 6) {
                errorMessage = 'Password must be at least 6 characters';
            } else {
                isValid = true;
            }
            break;
        case 'confirm-password':
            const password = document.getElementById('password').value;
            if (value !== password) {
                errorMessage = 'Passwords do not match';
            } else {
                isValid = true;
            }
            break;
        case 'signin-username':
        case 'signin-password':
            isValid = value.length > 0;
            if (!isValid) {
                errorMessage = 'This field is required';
            }
            break;
    }

    const errorElement = document.getElementById(fieldName + '-error');

    if (isValid) {
        input.classList.remove('error');
        input.classList.add('success');
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.classList.remove('show');
        }
    } else {
        input.classList.remove('success');
        input.classList.add('error');
        if (errorElement) {
            errorElement.textContent = errorMessage;
            errorElement.classList.add('show');
        }
    }
}

// Sign Out Function
function signOut() {
    const confirmLogout = confirm('Are you sure you want to sign out?');
    if (confirmLogout) {
        localStorage.removeItem('token');
        updateAuthUI();
        window.location.href = 'index.html';
    }
}

// Contact Form Handling
