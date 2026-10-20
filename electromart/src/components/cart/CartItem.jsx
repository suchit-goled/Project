import React from "react";
import { FiTrash2, FiClock } from "react-icons/fi";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import "./CartItem.css";

const CartItem = ({ item }) => {
    const { updateQuantity, removeItem } = useCart();

    const product = item.productId || {};
    const productId = product._id || item.productId;
    const title = product.product_title || item.title || "Electronics Item";
    const image = product.product_image_url || item.image || "";
    const price = product.discounted_price ?? item.price ?? 0;
    const originalPrice = product.original_price;
    const discount = product.discount_percentage;

    if (!productId) {
        return null;
    }

    return (
        <div className="cart-item">
            <Link to={`/products/${productId}`} className="cart-image">
                <img
                    src={image}
                    alt={title}
                />
            </Link>

            <div className="cart-details">
                <Link to={`/products/${productId}`} className="cart-item-title-link">
                    <h3>{title}</h3>
                </Link>

                {product.product_category && (
                    <span className="cart-item-category">{product.product_category}</span>
                )}

                <div className="price-box">
                    <span className="current-price">
                        ₹{Number(price).toLocaleString()}
                    </span>

                    {originalPrice && originalPrice > price && (
                        <span className="original-price">
                            ₹{Number(originalPrice).toLocaleString()}
                        </span>
                    )}

                    {discount > 0 && (
                        <span className="discount">
                            {discount}% OFF
                        </span>
                    )}
                </div>

                <div className="cart-delivery-status">
                    <FiClock /> <span>Dispatches in 24 hrs • Free Delivery eligible</span>
                </div>

                <div className="cart-actions">
                    <div className="quantity-box">
                        <button
                            onClick={() => updateQuantity(productId, (item.quantity || 1) - 1)}
                            disabled={(item.quantity || 1) <= 1}
                            aria-label="Decrease quantity"
                        >
                            −
                        </button>

                        <span>{item.quantity || 1}</span>

                        <button
                            onClick={() => updateQuantity(productId, (item.quantity || 1) + 1)}
                            disabled={(item.quantity || 1) >= 10}
                            aria-label="Increase quantity"
                        >
                            +
                        </button>
                    </div>

                    <button
                        className="remove-btn"
                        onClick={() => removeItem(productId)}
                        aria-label="Remove item"
                    >
                        <FiTrash2 />
                        <span>Remove</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CartItem;
