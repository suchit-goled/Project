import "./ProductAction.css";
import { useState } from "react";
import {
  FaShoppingCart,
  FaBolt,
  FaTruck,
  FaUndo,
  FaShieldAlt,
  FaLock,
} from "react-icons/fa";

const ProductActions = () => {
  const [qty, setQty] = useState(1);

  return (
    <div className="product-actions">

      <div className="delivery-grid">

        <div className="delivery-card">
          <FaTruck className="delivery-icon" />
          <div>
            <h4>Free Delivery</h4>
            <p>Delivered in 2-5 days</p>
          </div>
        </div>

        <div className="delivery-card">
          <FaUndo className="delivery-icon" />
          <div>
            <h4>7 Day Return</h4>
            <p>Easy replacement</p>
          </div>
        </div>

        <div className="delivery-card">
          <FaShieldAlt className="delivery-icon" />
          <div>
            <h4>1 Year Warranty</h4>
            <p>Official manufacturer warranty</p>
          </div>
        </div>

        <div className="delivery-card">
          <FaLock className="delivery-icon" />
          <div>
            <h4>Secure Payment</h4>
            <p>100% protected checkout</p>
          </div>
        </div>

      </div>

      <div className="quantity">

        <button onClick={() => setQty(Math.max(1, qty - 1))}>
          −
        </button>

        <span>{qty}</span>

        <button onClick={() => setQty(qty + 1)}>
          +
        </button>

      </div>

      <button className="cart-btn">
        <FaShoppingCart />
        Add to Cart
      </button>

      <button className="buy-btn">
        <FaBolt />
        Buy Now
      </button>

    </div>
  );
};

export default ProductActions;