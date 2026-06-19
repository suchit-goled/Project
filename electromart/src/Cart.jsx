import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Cart() {

  const [items, setItems] = useState([]);

  const navigate = useNavigate();

  const userId = localStorage.getItem("userId");

  // FETCH CART
  useEffect(() => {

    axios
      .get(`https://project-vlbr.onrender.com/cart/${userId}`)
      .then((res) => setItems(res.data))
      .catch((err) => console.log(err));

  }, [userId]);

  // REMOVE ITEM
  const removeItem = async (productId) => {

    try {

      await axios.delete(
        "https://project-vlbr.onrender.com/cart/remove",
        {
          data: {
            userId,
            productId
          }
        }
      );

      setItems(
        items.filter(
          (item) =>
            item.productId !== productId
        )
      );

    } catch (err) {

      console.log(err);

    }

  };

  return (

    <div className="cart-page">

      {/* LEFT SECTION */}

      <div className="cart-left">

        <h2>
          🛒 Shopping Cart
        </h2>

        {
          items.length === 0 ? (

            <h3>
              Cart is Empty
            </h3>

          ) : (

            items.map((item) => (

              <div
                className="cart-card"
                key={item._id}
              >

                {/* IMAGE */}

                <img
                  src={item.image}
                  alt=""
                  className="cart-image"
                />

                {/* DETAILS */}

                <div className="cart-info">

                  <h3>
                    {item.title}
                  </h3>

                  <p className="cart-price">
                    ₹{item.price}
                  </p>

                  <p className="delivery-text">
                    Eligible for FREE Delivery
                  </p>

                  {/* QUANTITY */}

                  <div className="qty-controls">

                    <button
                      onClick={() => {

                        axios.put(
                          "https://project-vlbr.onrender.com/cart/decrease",
                          {
                            userId,
                            productId:
                              item.productId
                          }
                        )
                          .then(() =>
                            window.location.reload()
                          );

                      }}
                    >
                      -
                    </button>

                    <span>
                      {item.quantity}
                    </span>

                    <button
                      onClick={() => {

                        axios.put(
                          "https://project-vlbr.onrender.com/cart/increase",
                          {
                            userId,
                            productId:
                              item.productId
                          }
                        )
                          .then(() =>
                            window.location.reload()
                          );

                      }}
                    >
                      +
                    </button>

                  </div>

                  {/* REMOVE */}

                  <button
                    className="remove-btn"
                    onClick={() =>
                      removeItem(item.productId)
                    }
                  >
                    Remove
                  </button>

                </div>

              </div>

            ))

          )
        }

      </div>


      {/* RIGHT SECTION */}

      <div className="cart-right">

        <div className="price-box">

          <h2>
            Price Details
          </h2>

          <div className="price-row">

            <span>
              Price (
              {items.length} items )
            </span>

            <span>
              ₹
              {
                items.reduce(
                  (sum, item) =>
                    sum +
                    item.price *
                    item.quantity,
                  0
                )
              }
            </span>

          </div>

          <div className="price-row">

            <span>
              Delivery Charges
            </span>

            <span className="green-text">
              FREE
            </span>

          </div>

          <hr />

          <div className="total-row">

            <span>
              Total Amount
            </span>

            <span>
              ₹
              {
                items.reduce(
                  (sum, item) =>
                    sum +
                    item.price *
                    item.quantity,
                  0
                )
              }
            </span>

          </div>

          {/* CHECKOUT */}

          <button
            className="checkout-btn"
            onClick={() =>
              navigate("/checkout")
            }
          >
            Proceed To Checkout
          </button>

        </div>

      </div>

    </div>

  );

}

export default Cart;