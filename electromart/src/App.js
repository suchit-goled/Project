import React from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import "./App.css";

// Layout
import Navbar from "./components/layout/Navbar/Navbar";
import Footer from "./components/layout/Footer";
import ScrollToTop from "./components/common/ScrollToTop";
import WhatsAppButton from "./components/common/WhatsAppButton";

// Auth & Access Route Guards
import ProtectedRoute from "./components/common/ProtectedRoute";
import AdminRoute from "./components/common/AdminRoute";
import PublicOnlyRoute from "./components/common/PublicOnlyRoute";

// Core Store Pages
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import StorePage from "./pages/StorePage";
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

// Seller Portal & Multi-Vendor Hub
import SellerRoute from "./components/common/SellerRoute";
import SellerRegister from "./pages/seller/SellerRegister";
import SellerLayout from "./pages/seller/SellerLayout";
import SellerDashboard from "./pages/seller/SellerDashboard";
import SellerOrders from "./pages/seller/SellerOrders";
import SellerProducts from "./pages/seller/SellerProducts";
import SellerAddProduct from "./pages/seller/SellerAddProduct";
import SellerEarnings from "./pages/seller/SellerEarnings";
import SellerStoreProfile from "./pages/seller/SellerStoreProfile";

// Informational & Support Pages
import Contact from "./pages/Contact";
import ShippingPolicy from "./pages/ShippingPolicy";
import ReturnsPolicy from "./pages/ReturnsPolicy";
import WarrantyGuide from "./pages/WarrantyGuide";
import About from "./pages/About";
import NotFound from "./pages/NotFound";

const PageTransitionShell = ({ children }) => {
    const location = useLocation();
    return (
        <div key={location.pathname} className="app-main-content page-transition-wrapper">
            {children}
        </div>
    );
};

function App() {
    return (
        <BrowserRouter>
            <ScrollToTop />
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 3200,
                    style: {
                        background: "#FFFFFF",
                        color: "#161614",
                        border: "1px solid #DFDBD2",
                        borderRadius: "4px",
                        fontSize: "0.875rem",
                        boxShadow: "0 4px 16px rgba(22, 22, 20, 0.08)",
                    },
                    success: {
                        iconTheme: {
                            primary: "#1F6B45",
                            secondary: "#FFFFFF",
                        },
                    },
                    error: {
                        iconTheme: {
                            primary: "#B3261E",
                            secondary: "#FFFFFF",
                        },
                    },
                }}
            />

            <Navbar />

            <PageTransitionShell>
                <Routes>
                    {/* Public Storefront */}
                    <Route path="/" element={<Home />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/products/:id" element={<ProductDetails />} />
                    <Route path="/products/category/:category" element={<Products />} />
                    <Route path="/products/search/:key" element={<Products />} />
                    <Route path="/stores/:slug" element={<StorePage />} />
                    <Route path="/deals" element={<Deals />} />

                    {/* Cart & Guest / Authenticated flows */}
                    <Route path="/cart" element={<Cart />} />
                    <Route
                        path="/checkout"
                        element={
                            <ProtectedRoute>
                                <Checkout />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="/order-success" element={<OrderSuccess />} />

                    {/* Guest-only Auth (redirects authenticated users) */}
                    <Route
                        path="/login"
                        element={
                            <PublicOnlyRoute>
                                <Login />
                            </PublicOnlyRoute>
                        }
                    />
                    <Route
                        path="/register"
                        element={
                            <PublicOnlyRoute>
                                <Signup />
                            </PublicOnlyRoute>
                        }
                    />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password/:token" element={<ResetPassword />} />

                    {/* Customer Account (Protected by Authentication Guard) */}
                    <Route
                        path="/profile"
                        element={
                            <ProtectedRoute>
                                <Profile />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/profile/edit"
                        element={
                            <ProtectedRoute>
                                <EditProfile />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/settings"
                        element={
                            <ProtectedRoute>
                                <EditProfile />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/orders"
                        element={
                            <ProtectedRoute>
                                <MyOrders />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/orders/:orderId"
                        element={
                            <ProtectedRoute>
                                <OrderDetails />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/orders/details/:orderId"
                        element={
                            <ProtectedRoute>
                                <OrderDetails />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="/wishlist" element={<Wishlist />} />

                    {/* Administrator Control Center (Protected by Admin Role Guard) */}
                    <Route
                        path="/admin"
                        element={
                            <AdminRoute>
                                <Admin />
                            </AdminRoute>
                        }
                    />
                    <Route
                        path="/admin-orders"
                        element={
                            <AdminRoute>
                                <AdminOrders />
                            </AdminRoute>
                        }
                    />

                    {/* Seller Portal & Multi-Vendor Hub */}
                    <Route
                        path="/seller/register"
                        element={
                            <ProtectedRoute>
                                <SellerRegister />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/seller"
                        element={
                            <SellerRoute>
                                <SellerLayout />
                            </SellerRoute>
                        }
                    >
                        <Route index element={<SellerDashboard />} />
                        <Route path="dashboard" element={<SellerDashboard />} />
                        <Route path="orders" element={<SellerOrders />} />
                        <Route path="products" element={<SellerProducts />} />
                        <Route path="products/new" element={<SellerAddProduct />} />
                        <Route path="earnings" element={<SellerEarnings />} />
                        <Route path="store" element={<SellerStoreProfile />} />
                    </Route>

                    {/* Support, Policies & Company */}
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/shipping" element={<ShippingPolicy />} />
                    <Route path="/returns" element={<ReturnsPolicy />} />
                    <Route path="/warranty" element={<WarrantyGuide />} />
                    <Route path="/about" element={<About />} />

                    {/* 404 Recovery Fallback */}
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </PageTransitionShell>

            <WhatsAppButton />
            <Footer />
        </BrowserRouter>
    );
}

export default App;
