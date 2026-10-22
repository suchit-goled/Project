import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import "./App.css";

// Layout
import Navbar from "./components/layout/Navbar/Navbar";
import Footer from "./components/layout/Footer";
import ScrollToTop from "./components/common/ScrollToTop";

// Core Store Pages
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Deals from "./pages/Deals";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import MyOrders from "./pages/MyOrders";
import OrderDetails from "./pages/OrderDetails";
import Wishlist from "./pages/Wishlist";

// Auth & Customer Account
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";

// Admin Management
import Admin from "./pages/Admin";
import AdminOrders from "./pages/AdminOrders";

// Informational & Support Pages
import Contact from "./pages/Contact";
import ShippingPolicy from "./pages/ShippingPolicy";
import ReturnsPolicy from "./pages/ReturnsPolicy";
import WarrantyGuide from "./pages/WarrantyGuide";
import About from "./pages/About";
import NotFound from "./pages/NotFound";

function App() {
    return (
        <BrowserRouter>
            <ScrollToTop />
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 3200,
                    style: {
                        background: "#0f172a",
                        color: "#f8fafc",
                        border: "1px solid rgba(255, 255, 255, 0.12)",
                        borderRadius: "12px",
                        fontSize: "0.9rem",
                        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.4)",
                    },
                    success: {
                        iconTheme: {
                            primary: "#ff6e26",
                            secondary: "#ffffff",
                        },
                    },
                    error: {
                        iconTheme: {
                            primary: "#ef4444",
                            secondary: "#ffffff",
                        },
                    },
                }}
            />

            <Navbar />

            <div className="app-main-content">
                <Routes>
                    {/* Storefront */}
                    <Route path="/" element={<Home />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/products/:id" element={<ProductDetails />} />
                    <Route path="/products/category/:category" element={<Products />} />
                    <Route path="/products/search/:key" element={<Products />} />
                    <Route path="/deals" element={<Deals />} />

                    {/* Cart & Checkout */}
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/order-success" element={<OrderSuccess />} />

                    {/* Customer Account & Orders */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Signup />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password/:token" element={<ResetPassword />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/profile/edit" element={<EditProfile />} />
                    <Route path="/settings" element={<EditProfile />} />
                    <Route path="/orders" element={<MyOrders />} />
                    <Route path="/orders/:orderId" element={<OrderDetails />} />
                    <Route path="/orders/details/:orderId" element={<OrderDetails />} />
                    <Route path="/wishlist" element={<Wishlist />} />

                    {/* Admin Dashboard */}
                    <Route path="/admin" element={<Admin />} />
                    <Route path="/admin-orders" element={<AdminOrders />} />

                    {/* Support & Policies */}
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/shipping" element={<ShippingPolicy />} />
                    <Route path="/returns" element={<ReturnsPolicy />} />
                    <Route path="/warranty" element={<WarrantyGuide />} />
                    <Route path="/about" element={<About />} />

                    {/* 404 Fallback */}
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </div>

            <Footer />
        </BrowserRouter>
    );
}

export default App;
