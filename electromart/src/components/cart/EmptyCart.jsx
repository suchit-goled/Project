import { Link } from "react-router-dom";
import { FiShoppingCart } from "react-icons/fi";
import "./EmptyCart.css";

const EmptyCart = () => {
    return (
        <section className="empty-cart-page">
            <div className="empty-cart-card">

                <div className="empty-cart-icon">
                    <FiShoppingCart />
                </div>

                <h2>Your Cart is Empty</h2>

                <p>
                    Looks like you haven't added anything yet.
                    <br />
                    Explore our latest gadgets and exclusive deals.
                </p>

                <Link
                    to="/products"
                    className="continue-btn"
                >
                    Continue Shopping
                </Link>

            </div>
        </section>
    );
};

export default EmptyCart;