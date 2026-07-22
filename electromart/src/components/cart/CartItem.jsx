import { FiTrash2 } from "react-icons/fi";
import { useCart } from "../../context/CartContext";
import "./CartItem.css";

const CartItem = ({ item }) => {
    const { updateQuantity, removeItem } = useCart();

    const product = item.productId;

    if (!product) {
        return null;
    }

    return (
        <div className="cart-item">
            <div className="cart-image">
                <img
                    src={product.product_image_url}
                    alt={product.product_title}
                />
            </div>

            <div className="cart-details">
                <h3>{product.product_title}</h3>

                <div className="rating">
                    ⭐ {product.product_rating}
                    <span> ({product.total_reviews} Reviews)</span>
                </div>

                <div className="price-box">
                    <span className="current-price">
                        ₹{product.discounted_price}
                    </span>

                    <span className="original-price">
                        ₹{product.original_price}
                    </span>

                    <span className="discount">
                        {product.discount_percentage}% OFF
                    </span>
                </div>

                <p className="delivery">
                    🚚 Delivery by Tomorrow
                </p>

                <div className="cart-actions">
                    <div className="quantity-box">

                        <button
                            onClick={() =>
                                updateQuantity(
                                    product._id,
                                    item.quantity - 1
                                )
                            }
                            disabled={item.quantity <= 1}
                        >
                            −
                        </button>

                        <span>{item.quantity}</span>

                        <button
                            onClick={() =>
                                updateQuantity(
                                    product._id,
                                    item.quantity + 1
                                )
                            }
                        >
                            +
                        </button>

                    </div>

                    <button
                        className="remove-btn"
                        onClick={() => removeItem(product._id)}
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