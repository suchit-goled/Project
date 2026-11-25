import { FiHeart, FiShoppingCart } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import { useCart } from "../../../context/CartContext";
import { useWishlist } from "../../../context/WishlistContext";

import UserMenu from "./UserMenu";

const ActionButtons = () => {
    const navigate = useNavigate();

    const { cartCount } = useCart();
    const { wishlistCount } = useWishlist();

    return (
        <div className="actions">
            <button
                className="wishlist-button"
                onClick={() => navigate("/wishlist")}
                aria-label="View wishlist"
                title="Wishlist"
            >
                <FiHeart size={18} />
                {wishlistCount > 0 && (
                    <span className="badge tabular-nums">
                        {wishlistCount}
                    </span>
                )}
            </button>

            <button
                className="cart-button"
                onClick={() => navigate("/cart")}
                aria-label="View shopping cart"
                title="Cart"
            >
                <FiShoppingCart size={18} />
                {cartCount > 0 && (
                    <span className="badge tabular-nums">
                        {cartCount}
                    </span>
                )}
            </button>

            <UserMenu />
        </div>
    );
};

export default ActionButtons;
