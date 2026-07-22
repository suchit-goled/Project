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
      const user = JSON.parse(localStorage.getItem("user"));

      if (!user) return;

      const userId = user.id;

      const [ordersRes, wishlistRes, cartRes] = await Promise.all([
        OrderService.getOrders(userId),
        WishlistService.getWishlist(userId),
        CartService.getCart(userId),
      ]);

      setStats({
        orders: ordersRes.success ? ordersRes.orders.length : 0,
        wishlist: wishlistRes.success
          ? wishlistRes.wishlist.length
          : 0,
        cart: cartRes.success ? cartRes.cart.length : 0,
        address: 1,
      });
    } catch (err) {
      console.error(err);
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