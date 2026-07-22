import { useCart } from "../../context/CartContext";
import "./CartSummary.css";
import { useNavigate } from "react-router-dom";

const CartSummary = () => {

    const { cart } = useCart();
     const navigate = useNavigate();

    const subtotal = cart.reduce((sum, item) => {

        if (!item.productId) return sum;

        return sum + (item.productId.discounted_price * item.quantity);

    }, 0);

    const shipping = subtotal >= 1000 ? 0 : 99;

    const total = subtotal + shipping;

    return (
        <div className="cart-summary">

            <h2>Order Summary</h2>

            <div className="summary-row">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
            </div>

            <div className="summary-row">
                <span>Shipping</span>
                <span>{shipping === 0 ? "Free" : `₹${shipping}`}</span>
            </div>

            <hr />

            <div className="summary-total">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
            </div>

            <button
        className="checkout-btn"
        onClick={() => navigate("/checkout")}
    >
        Proceed To Checkout
    </button>

        </div>
    );
};

export default CartSummary;