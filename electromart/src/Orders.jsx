import React, { useEffect, useState } from "react";
import axios from "axios";

function Orders() {

  const [orders, setOrders] = useState([]);

  const userId = localStorage.getItem("userId");

  // FETCH ORDERS
  useEffect(() => {

    axios
      .get(`http://localhost:8000/orders/${userId}`)
      .then((res) => {

        setOrders(res.data);

      })
      .catch((err) => console.log(err));

  }, [userId]);

  // CANCEL ORDER
  const cancelOrder = async (id) => {

    try {

      await axios.delete(
        `http://localhost:8000/orders/${id}`
      );

      setOrders(
        orders.filter(
          (order) => order._id !== id
        )
      );

    } catch (err) {

      console.log(err);

    }

  };

  return (

    <div className="orders-page">

      <h1>
        📦 My Orders
      </h1>

      {
        orders.length === 0 ? (

          <h2>
            No Orders Found
          </h2>

        ) : (

          orders.map((order) => (

            <div
              className="order-card"
              key={order._id}
            >

              {/* PRODUCTS */}

              <div className="order-products">

                {
                  order.items.map((item) => (

                    <div
                      className="ordered-item"
                      key={item._id}
                    >

                      <img
                        src={item.image}
                        alt=""
                      />

                      <div>

                        <h3>
                          {item.title}
                        </h3>

                        <p>
                          ₹{item.price}
                        </p>

                        <p>
                          Qty: {item.quantity}
                        </p>

                      </div>

                    </div>

                  ))
                }

              </div>

              {/* STATUS */}

              <div className="order-status-box">

                <h3>
                  Order Status
                </h3>

                <p className="status-text">
                  {order.status}
                </p>

                <div className="tracking-line">

                  <div
                    className={
                      order.status ===
                        "Order Confirmed" ||
                      order.status ===
                        "Packed" ||
                      order.status ===
                        "Shipped" ||
                      order.status ===
                        "Delivered"
                        ? "track active-track"
                        : "track"
                    }
                  >
                    ✔
                  </div>

                  <div
                    className={
                      order.status ===
                        "Packed" ||
                      order.status ===
                        "Shipped" ||
                      order.status ===
                        "Delivered"
                        ? "track active-track"
                        : "track"
                    }
                  >
                    📦
                  </div>

                  <div
                    className={
                      order.status ===
                        "Shipped" ||
                      order.status ===
                        "Delivered"
                        ? "track active-track"
                        : "track"
                    }
                  >
                    🚚
                  </div>

                  <div
                    className={
                      order.status ===
                        "Delivered"
                        ? "track active-track"
                        : "track"
                    }
                  >
                    🎉
                  </div>

                </div>

                {/* CANCEL */}

                {
                  order.status !==
                    "Delivered" && (

                    <button
                      className="cancel-btn"
                      onClick={() =>
                        cancelOrder(order._id)
                      }
                    >
                      Cancel Order
                    </button>

                  )
                }

              </div>

            </div>

          ))

        )
      }

    </div>

  );

}

export default Orders;