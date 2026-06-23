# Project

# ElectroNova ⚡

ElectroNova is a full-stack e-commerce platform for electronic products built using the MERN stack. The application allows users to browse products, view product details, manage their cart, place orders, and track purchases.

## Features

* Product catalog with categories
* Featured and trending products
* Product search functionality
* Shopping cart management
* Order placement and tracking
* User authentication
* Responsive modern UI
* MongoDB Atlas database integration
* Render backend deployment
* Vercel frontend deployment

## Tech Stack

### Frontend

* React.js
* React Router
* Axios
* CSS

### Backend

* Node.js
* Express.js
* MongoDB Atlas
* Mongoose
* CORS
* Dotenv

## Project Structure

```text
ElectroNova/
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── Backend-project/
│   ├── index.js
│   ├── package.json
│   └── .env
│
└── README.md
```

## Installation

### Clone Repository

```bash
git clone https://github.com/suchit-goled/Project.git
cd Project
```

### Backend Setup

```bash
cd Backend-project
npm install
```

Create a `.env` file:

```env
MONGO_URI=your_mongodb_connection_string
PORT=8000
```

Run backend:

```bash
node index.js
```

### Frontend Setup

```bash
cd electromart
npm install
npm start
```

## API Endpoints

### Products

```http
GET /products
GET /featured-products
GET /products/:id
```

### Cart

```http
POST /add-to-cart
GET /cart/:userId
DELETE /cart/remove
PUT /cart/increase
PUT /cart/decrease
```

### Orders

```http
GET /orders/:userId
DELETE /orders/:id
```

## Database

MongoDB Atlas is used for storing:

* Products
* Cart Items
* Orders
* Users

Database Name:

```text
ElectroNova
```

## Deployment

### Frontend

Hosted on Vercel.

### Backend

Hosted on Render.

### Database

MongoDB Atlas.

## Author

**Suchit Goled**

Electronics and Communication Engineering Student

Skills:

* Java
* JavaScript
* React
* Node.js
* Express.js
* MongoDB
* Embedded Systems
* IoT

## Future Enhancements

* Payment Gateway Integration
* Wishlist Feature
* Product Reviews
* Admin Dashboard
* JWT Authentication
* AI-based Product Recommendations

---

Built with ❤️ using the MERN Stack.
