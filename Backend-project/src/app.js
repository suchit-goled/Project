import express from "express";
import cors from "cors";

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
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health Check
app.get("/", (req, res) => {
    res.send("🚀 ElectroNova Backend Running");
});

// Routes
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
export default app;