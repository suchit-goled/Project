import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import productRoutes from "./routes/product.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import authRoutes from "./routes/auth.routes.js";
import orderRoutes from "./routes/order.routes.js";
import addressRoutes from "./routes/address.routes.js";
import wishlistRoutes from "./routes/wishlist.routes.js";
import reviewRoutes from "./routes/review.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import passwordRoutes from "./routes/password.routes.js";
import userRoutes from "./routes/user.routes.js";
import homeRoutes from "./routes/home.routes.js";
import contactRoutes from "./routes/contact.routes.js";

import errorMiddleware from "./middleware/error.middleware.js";
import env from "./config/env.js";
import ApiResponse from "./utils/apiResponse.js";

const app = express();

// 1. Security Headers via Helmet
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// 2. CORS Security
const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://electronovashop.vercel.app",
    env.frontend_url
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(null, true); // Permissive in dev, or can restrict if needed
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

// 3. Body Parsing with safe size limit
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));

// 4. Rate Limiting
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Limit each IP to 1000 requests per window
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many requests from this IP, please try again after 15 minutes"
    }
});
app.use("/api", globalLimiter);

// Stricter rate limit for authentication & password reset endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // 50 attempts per 15 mins
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many authentication attempts, please try again after 15 minutes"
    }
});
app.use("/api/auth", authLimiter);
app.use("/api/password", authLimiter);

// 5. Health Check
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "🚀 ElectroNova Backend Running Securely",
        version: "2.0.0",
        timestamp: new Date().toISOString()
    });
});

app.get("/api/health", (req, res) => {
    res.status(200).json({
        status: "healthy",
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

// 6. Routes
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/address", addressRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/password", passwordRoutes);
app.use("/api/users", userRoutes);
app.use("/api/home", homeRoutes);
app.use("/api/contact", contactRoutes);

// 7. 404 Handler for Unmatched API Routes
app.use((req, res, next) => {
    return ApiResponse.error(
        res,
        `Cannot ${req.method} ${req.originalUrl} - Route Not Found`,
        404
    );
});

// 8. Centralized Error Handling Middleware
app.use(errorMiddleware);

export default app;