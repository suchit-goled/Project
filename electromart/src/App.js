import React from "react";
import "./App.css";

import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/layout/Navbar/Navbar";

import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";

import Cart from "./pages/Cart";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";

import Admin from "./pages/Admin";
import AdminOrders from "./pages/AdminOrders";
import Wishlist from "./pages/Wishlist";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess"; 
import MyOrders from "./pages/MyOrders";
import EditProfile from "./pages/EditProfile";
function App() {
    return (
        <BrowserRouter>

            <Navbar />

            <Routes>

                <Route path="/" element={<Home />} />

                <Route path="/products" element={<Products />} />

                <Route
                    path="/products/:id"
                    element={<ProductDetails />}
                />

                <Route
                    path="/products/category/:category"
                    element={<Products />}
                />

                <Route
                    path="/products/search/:key"
                    element={<Products />}
                />

                <Route path="/cart" element={<Cart />} />

                <Route path="/checkout" element={<Checkout />} />

                <Route path="/login" element={<Login />} />

                <Route path="/register" element={<Signup />} />

                <Route path="/profile" element={<Profile />} />

                

                <Route path="/admin" element={<Admin />} />

                <Route
                    path="/admin-orders"
                    element={<AdminOrders />}
                />
                <Route
    path="/wishlist"
    element={<Wishlist />}
/>
 <Route
    path="/checkout"
    element={<Checkout />}
/>

<Route path="/order-success" element={<OrderSuccess />} />
 <Route path="/orders" element={<MyOrders />} />
 <Route
    path="/profile/edit"
    element={<EditProfile />}
/>
            </Routes>
           
           

        </BrowserRouter>
    );
}

export default App;