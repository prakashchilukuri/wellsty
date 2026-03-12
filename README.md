# Wellsty — Premium E-Commerce Platform

Wellsty is a full-stack, visually rich e-commerce web application inspired by top-tier fashion platforms like Myntra and Ajio. 

It features a robust Node.js and MongoDB backend to drive dynamic content to a meticulously designed, mobile-first frontend featuring glassmorphism elements, micro-animations, and a complete purchase flow.

![Wellsty Header Preview](https://via.placeholder.com/1200x400/111118/f8fafc?text=WELLSTY+E-Commerce)

## 🌟 Key Features

### Frontend (UI/UX)
* **Premium Dashboard & Aesthetics**: Dark-mode primary design, modern typography (`Playfair Display` & `Inter`), and frosted glass effects across the UI.
* **Component-Driven Layout**: Reusable structural elements (Header Mega Menu, Footer, Custom Modals, Sidebars).
* **Dynamic Shop Page**: Fully functional client-side filtering (by category, brand, price, rating) and pagination.
* **Product Detail Page**: Multi-image galleries, variation selectors (size/color), and a built-in rating & review system.
* **Seamless Cart & Checkout**: Slide-out cart drawer, dynamic price calculation with taxes/shipping, and a mock multi-step checkout with various payment methods.
* **User Accounts**: Authentication modal, profile management, saved addresses, and order tracking history.
* **Admin Dashboard**: Dedicated protected route for store administrators to view overall revenue statistics, manage inventory, and update order statuses.

### Backend (API)
* **RESTful Architecture**: Built on Node.js and Express.js.
* **Database**: MongoDB with Mongoose ODM modeling complex data structures (Users, Products, Orders, Carts).
* **Authentication**: Secure JWT (JSON Web Tokens) based authentication with bcrypt password hashing.
* **Seed Script**: An automated `seed.js` script to immediately populate the database with over 40+ realistic products, categories, and test user accounts.

## 🛠 Tech Stack

* **Frontend**: HTML5, CSS3 (Custom Variables, Flexbox/Grid), Vanilla JavaScript (ES6+ Modules)
* **Backend**: Node.js, Express.js
* **Database**: MongoDB (via Mongoose)
* **Security & Utilities**: JWT, Bcryptjs, Cors, Helmet

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites
* [Node.js](https://nodejs.org/) installed
* [MongoDB](https://www.mongodb.com/try/download/community) installed and running locally on port `27017` (or provide an Atlas Cloud URI).

### Installation

1. **Clone the repository**
   ```sh
   git clone https://github.com/prakashchilukuri/wellsty.git
   cd wellsty
   ```

2. **Install NPM Packages**
   ```sh
   # Install backend dependencies
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env` file in the root directory:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/wellsty
   JWT_SECRET=your_super_secret_jwt_key
   JWT_EXPIRE=30d
   ```

4. **Seed the Database**
   Populate your local MongoDB with dummy data (products, admin user):
   ```sh
   npm run seed
   ```

5. **Start the Application**
   You will need to run the API server and serve the frontend files.

   Terminal 1 (Backend API):
   ```sh
   npm run dev
   ```

   Terminal 2 (Frontend):
   ```sh
   npx serve . -p 3000
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000` to view the storefront!

## 🔐 Demo Accounts (After Seeding)

* **Admin User**: `admin@wellsty.com` / `123456`
* **Test User**: `user@wellsty.com` / `123456`

## 📁 Repository Structure

```
wellsty/
├── backend/                   
│   ├── models/                # Database schemas (User, Product, Order, Cart)
│   ├── routes/                # API endpoint definitions
│   ├── controllers/           # Core API business logic
│   ├── middleware/            # JWT validation & Role guarding
│   └── data/                  # seed.js and initial product data
├── css/
│   └── main.css               # Core design system and global styles
├── js/
│   ├── api.js                 # Frontend API client library
│   ├── auth.js                # State management for authentication
│   ├── cart.js                # Cart UI and state logic
│   └── ui.js                  # Shared UI interactions (modals, dropdowns)
├── index.html                 # Storefront Home Page
├── shop.html                  # Product Catalog / Filtering Page
├── product.html               # Product Detail View
├── checkout.html              # Payment and Address Collection
├── profile.html               # User Dashboard
├── orders.html                # User Order History
├── admin.html                 # Admin Control Panel
├── server.js                  # Main Express Application Entry Point
└── package.json               # Project Dependencies & Scripts
```

## 📝 License

Distributed under the ISC License. See `LICENSE` for more information.
