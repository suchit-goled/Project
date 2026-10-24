# ElectroNova ⚡

ElectroNova is a full-stack, enterprise-grade e-commerce platform for electronic products built using the modern MERN stack. The platform allows users to browse products, view details, manage wishlists, manage shopping carts, place and cancel orders, conduct secure online payments via Razorpay or Cash on Delivery, and leave authenticated reviews.

---

## 🚀 Key Features

* **Product Catalog & Discovery**: Category filtering, price/rating filters, full-text search with ReDoS protection, and featured products carousel.
* **Shopping Cart & Checkout**: Real-time cart state management, quantity updates, order summary breakdown (subtotal, shipping, tax, total).
* **Payment Integration**: Razorpay payment gateway integration with signature verification and Cash on Delivery fallback.
* **Order Management & Tracking**: Multi-step checkout, real-time order tracking, cancellation workflows, and automated email confirmations.
* **User Accounts & Security**: JWT-based authentication, bcrypt password hashing, profile management, and secure password reset via tokenized emails.
* **Wishlist**: Real-time wishlist sync with instant add/remove and empty-state handling.
* **Customer Reviews**: Verified customer reviews with 1-5 star ratings and automated product rating recalculation.
* **Admin Dashboard**: Comprehensive store analytics (users, products, orders, revenue), inventory management, and order status tracking.

---

## 🔒 Security & Reliability Hardening

* **HTTP Security Headers**: Powered by `Helmet` for clickjacking protection, MIME sniffing prevention, and secure headers.
* **Rate Limiting**: Tiered rate limiting with `express-rate-limit` protecting authentication routes and global API endpoints against brute-force and DDoS attacks.
* **Broken Object Level Authorization (BOLA/IDOR) Protection**: Strict user-ownership validation on all cart, order, and profile mutation/view endpoints.
* **Credential Protection**: Sanitized database connection strings and zero secret leakage in application logs and responses.
* **Input Validation & Sanitization**: Strict input validation across registration, login, orders, cart updates, and review submissions.
* **Resilient Error Handling**: Centralized error middleware supporting Mongoose cast errors, validation errors, duplicate keys, and JWT expiry.

---

## 🛠️ Tech Stack

### Frontend (`electromart`)
* **React 19**
* **React Router 7**
* **Axios** (with Bearer interceptors & 401 token refresh handling)
* **Framer Motion** & **Swiper**
* **React Hot Toast** & **React Icons**

### Backend (`Backend-project`)
* **Node.js** (v20+) & **Express.js** (ES Modules)
* **MongoDB Atlas** & **Mongoose**
* **Helmet** & **Express Rate Limit**
* **JSON Web Tokens (JWT)** & **Bcryptjs**
* **Razorpay** & **Cloudinary** & **Nodemailer**
* **Supertest** & **Node Test Runner**

---

## 📁 Project Structure

```text
ElectroNova/
├── Backend-project/
│   ├── src/
│   │   ├── config/          # Environment, Database, Razorpay, Cloudinary
│   │   ├── controllers/     # Route request handlers
│   │   ├── middleware/      # Auth, Admin, Upload, Validate, Error handlers
│   │   ├── models/          # Mongoose Schemas (User, Product, Order, Cart, etc.)
│   │   ├── repositories/    # Data access layer
│   │   ├── routes/          # Express API route modules
│   │   ├── services/        # Business logic layer
│   │   ├── templates/       # HTML email templates
│   │   ├── utils/           # ApiResponse, AppError, Tokens, Emailer
│   │   ├── app.js           # Express application configuration
│   │   └── server.js        # Server listener
│   ├── tests/               # Automated unit & security test suite
│   ├── package.json
│   └── .env
│
├── electromart/
│   ├── public/              # Static assets & HTML template
│   ├── src/
│   │   ├── api/             # Axios instance & interceptors
│   │   ├── components/      # Modular UI components (Checkout, Cart, Navbar, UI)
│   │   ├── config/          # Client environment configuration
│   │   ├── constants/       # Navigation and route constants
│   │   ├── context/         # Auth, Cart, Wishlist, Search Contexts
│   │   ├── pages/           # Route views (Home, Products, Checkout, Admin, etc.)
│   │   ├── services/        # API client services
│   │   ├── styles/          # Global styles & animations
│   │   ├── App.js           # Router configuration
│   │   └── setupTests.js    # Jest test environment & polyfills
│   └── package.json
│
├── .github/
│   └── workflows/
│       └── ci.yml           # Automated CI/CD (lint, security audit, unit & component tests, production build)
├── package.json             # Root unified automation commands
├── .gitignore               # Multi-tier secret and dependency protection
└── README.md
```

---

## ⚙️ Installation & Setup

### 1. Clone Repository
```bash
git clone https://github.com/suchit-goled/Project.git
cd Project
```

### 2. Backend Setup
```bash
cd Backend-project
npm install
```

Configure `Backend-project/.env`:
```env
PORT=8000
NODE_ENV=development
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password
```

Run Backend:
```bash
npm run dev
# or
npm start
```

### 3. Frontend Setup
```bash
cd ../electromart
npm install
npm start
```

---

## ⚡ Automation & Monorepo Commands

From the root `Project/` directory, execute unified automation scripts:

```bash
# Run both Backend & Frontend automated test suites
npm run test

# Run backend unit, integration & security test suite (51/51 tests across 6 suites)
npm run test:backend

# Run frontend Jest component test suite (16/16 tests across 7 suites)
npm run test:frontend

# Run zero-vulnerability security audit
npm run security:audit

# Build optimized frontend production bundle
npm run build:frontend

# Install dependencies across all packages
npm run install:all
```

---

## 🤖 CI/CD Automation Pipeline

Automated with **GitHub Actions** (`.github/workflows/ci.yml`):
* **Backend Security & Testing**: Checks out code, provisions Node 22, executes `npm run security:audit` (fails on vulnerabilities), and runs all 51 automated unit & IDOR integration tests.
* **Frontend Verification & Production Build**: Runs component Jest test suites in headless CI mode (16 tests across 7 suites) and builds production bundles (`npm run build`) ensuring zero build-time warnings or bundle breakages.

---

## 🧪 Testing Coverage Summary

### Backend Automated Test Suite (`npm run test:backend`)
* 6 suites, 51 automated tests passing with 0 failures:
  - `health.test.js`: Service status, health uptime, Helmet HTTP headers, unmatched route 404 JSON fallback.
  - `security.test.js`: Tiered route protection, invalid/expired JWT rejection, auth rate-limiting headers.
  - `cart_and_orders.test.js`: Empty cart guards, order address validation, IDOR authorization access controls.
  - `contact_and_admin.test.js`: Contact payload sanitization, admin route guards, ReDoS regex search resilience.
  - `user_and_security_deep.test.js`: NoSQL injection key stripping, change-password authentication, address mass-assignment prevention, shipped order cancellation constraints, timing-safe Razorpay HMAC comparison, admin order status transitions.
  - `products_and_reviews.test.js`: Product pagination metadata, single product 200/404 handling, featured products query, related products, product reviews retrieval & rating bounds validation (1-5), home layout payload, and image upload MIME-type validation.

### Frontend Automated Component Tests (`npm run test:frontend`)
* 7 suites, 16 automated tests passing with 0 failures:
  - `App.test.js`: Global layout mounting, branding, navigation links.
  - `OrderCard.test.js`: Order card status badges, receipt summary, product thumbnails.
  - `CartSummary.test.js`: Subtotal, GST, free shipping thresholds, promo code discount calculation (ELECTRO10), checkout CTA.
  - `PasswordSection.test.js`: Password input rendering, password visibility toggle (Show/Hide), validation constraints.
  - `ProductCard.test.js`: Product cards rendering title, category, discount badge, formatted currency, rating review counts, Add to Cart click handlers, and wishlist toggling.
  - `EmptyCart.test.js`: Empty cart illustration, helpful prompt text, and Continue Shopping navigation link.
  - `WishlistCard.test.js`: Wishlist item details, ratings, discount calculation, Move To Cart transaction, and item removal.

---

## 🌐 API Endpoints Reference

### Authentication (`/api/auth`)
* `POST /api/auth/register` - Register a new user
* `POST /api/auth/login` - User login & token generation
* `GET /api/auth/profile` - Get authenticated profile (*Protected*)

### Products (`/api/products`)
* `GET /api/products` - Filtered & paginated product catalog
* `GET /api/products/featured` - Curated featured products
* `GET /api/products/:id` - Detailed product view

### Cart (`/api/cart`)
* `POST /api/cart/add` - Add item to cart (*Protected*)
* `GET /api/cart/:userId` - Retrieve user cart (*Protected, IDOR-guarded*)
* `PUT /api/cart/update` - Update item quantity (*Protected, IDOR-guarded*)
* `DELETE /api/cart/remove` - Remove item from cart (*Protected, IDOR-guarded*)
* `DELETE /api/cart/clear/:userId` - Clear user cart (*Protected, IDOR-guarded*)

### Orders (`/api/orders`)
* `POST /api/orders` - Place new order (*Protected*)
* `GET /api/orders/:userId` - List user orders (*Protected, IDOR-guarded*)
* `GET /api/orders/details/:orderId` - Get single order (*Protected, IDOR-guarded*)
* `PUT /api/orders/cancel/:orderId` - Cancel pending order (*Protected, IDOR-guarded*)

### Admin (`/api/admin`)
* `GET /api/admin/dashboard` - Dashboard KPI statistics (*Admin Only*)
* `GET /api/admin/products` - Manage inventory (*Admin Only*)
* `POST /api/admin/products` - Create new product (*Admin Only*)
* `PUT /api/admin/products/:id` - Update product (*Admin Only*)
* `DELETE /api/admin/products/:id` - Remove product (*Admin Only*)
* `GET /api/admin/orders` - View all customer orders (*Admin Only*)
* `PUT /api/admin/orders/:id/status` - Update order status (*Admin Only*)

---

## 👨‍💻 Author

**Suchit Goled**
Built with ❤️ using the MERN Stack.
