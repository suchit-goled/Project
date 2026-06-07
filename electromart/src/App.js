import React from "react";
import "./App.css";
import Navbar from "./Navbar";
import Home from "./Home";
import ProductDetails from "./ProductDetails";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Products from "./Products";
import Cart from "./Cart";
import Login from "./Login";
import Signup from "./Signup";
import Profile from "./Profile";
import Admin from "./Admin";
import Checkout from "./Checkout";
import Orders from "./Orders";
import AdminOrders from "./AdminOrders";


function App() {
  return (
    <BrowserRouter>

      {/* Navbar should be inside Router */}
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/products/category/:category" element={<Products />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/products/search/:key" element={<Products />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/admin-orders" element={<AdminOrders />}/>
      </Routes>

    </BrowserRouter>
  );
}

export default App;