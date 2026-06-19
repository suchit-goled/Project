import React, { useEffect, useState } from "react";
import axios from "axios";

function Profile() {
  const [orders, setOrders] = useState([]);
  const username = localStorage.getItem("username");
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    axios.get(`https://project-vlbr.onrender.com/cart/${userId}`)
      .then(res => setOrders(res.data))
      .catch(err => console.log(err));
  }, [userId]);

  const logout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <div className="profile-page">

      <div className="profile-card">

        {/* HEADER */}
        <div className="profile-header">
          <div className="avatar">
            {username?.charAt(0).toUpperCase()}
          </div>
          <h2>{username}</h2>
          <p>User ID: {userId}</p>
        </div>

        {/* STATS */}
        <div className="profile-stats">
          <div>
            <h3>{orders.length}</h3>
            <p>Orders</p>
          </div>
          <div>
            <h3>⭐ 4.5</h3>
            <p>Rating</p>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="profile-actions">
          <button className="edit-btn">Edit Profile</button>
          <button className="logout-btn" onClick={logout}>Logout</button>
        </div>

      </div>

      {/* ORDERS SECTION */}
      <div className="orders-section">
        <h3>Your Orders</h3>

        {orders.length === 0 ? (
          <p>No orders yet</p>
        ) : (
          <div className="orders-grid">
            {orders.map((o) => (
              <div className="order-card" key={o._id}>
                <img src={o.image} alt="" />
                <p>{o.title}</p>
                <p>₹{o.price}</p>
                <span>Qty: {o.quantity}</span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

export default Profile;