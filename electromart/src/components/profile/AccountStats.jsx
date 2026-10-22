import { useEffect, useState } from "react";
import {
  FiPackage,
  FiHeart,
  FiShoppingCart,
  FiMapPin,
} from "react-icons/fi";

import OrderService from "../../services/order.service";
import WishlistService from "../../services/wishlist.service";
import CartService from "../../services/cart.service";

import "./AccountStats.css";

const AccountStats = () => {
  const [stats, setStats] = useState({
    orders: 0,
    wishlist: 0,
    cart: 0,
    address: 1,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) return;

      const user = JSON.parse(userStr);
      const userId = user.id || user._id;
      if (!userId) return;

      const [ordersRes, wishlistRes, cartRes] = await Promise.all([
        OrderService.getOrders(userId).catch(() => null),
        WishlistService.getWishlist(userId).catch(() => null),
        CartService.getCart(userId).catch(() => null),
      ]);

      const ordersList = ordersRes?.data?.orders || ordersRes?.orders || [];
      const wishlistList = wishlistRes?.data?.wishlist || wishlistRes?.wishlist || [];
      const cartList = cartRes?.data?.cart || cartRes?.cart || [];

      setStats({
        orders: ordersList.length,
        wishlist: wishlistList.length,
        cart: cartList.length,
        address: 1,
      });
    } catch (err) {
      console.error("fetchStats error:", err);
    }
  };

  const cards = [
    {
      icon: <FiPackage />,
      title: "Orders",
      value: stats.orders,
      className: "orders",
    },
    {
      icon: <FiHeart />,
      title: "Wishlist",
      value: stats.wishlist,
      className: "wishlist",
    },
    {
      icon: <FiShoppingCart />,
      title: "Cart",
      value: stats.cart,
      className: "cart",
    },
    {
      icon: <FiMapPin />,
      title: "Addresses",
      value: stats.address,
      className: "address",
    },
  ];

  return (
    <div className="stats-grid">
      {cards.map((item) => (
        <div key={item.title} className={`stat-card ${item.className}`}>
          <div className="stat-icon">{item.icon}</div>

          <h3>{item.title}</h3>

          <p>{item.value}</p>
        </div>
      ))}
    </div>
  );
};

export default AccountStats;
