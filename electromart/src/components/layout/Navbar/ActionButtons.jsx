import { FiHeart, FiShoppingCart, FiSun, FiMoon } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import { useCart } from "../../../context/CartContext";
import { useWishlist } from "../../../context/WishlistContext";
import { useTheme } from "../../../context/ThemeContext";

import UserMenu from "./UserMenu";

const ActionButtons = () => {
    const navigate = useNavigate();

    const { cartCount } = useCart();
    const { wishlistCount } = useWishlist();
    const { toggleTheme, isDark } = useTheme();

    return (
        <div className="actions">
            <button
                className="theme-toggle-btn"
                onClick={toggleTheme}
                title={`Switch to ${isDark ? "Light" : "Dark"} Mode`}
                aria-label="Toggle visual theme"
            >
                {isDark ? (
                    <FiSun size={17} style={{ color: "#F59E0B" }} />
                ) : (
                    <FiMoon size={17} style={{ color: "#3B82F6" }} />
                )}
            </button>

            <button
                className="wishlist-button"
                onClick={() => navigate("/wishlist")}
                aria-label="View wishlist"
            >
                <FiHeart />

                {wishlistCount > 0 && (
                    <span className="badge">
                        {wishlistCount}
                    </span>
                )}
            </button>

            <button
                className="cart-button"
                onClick={() => navigate("/cart")}
                aria-label="View shopping cart"
            >
                <FiShoppingCart />

                {cartCount > 0 && (
                    <span className="badge">
                        {cartCount}
                    </span>
                )}
            </button>

            <UserMenu />
        </div>
    );
};

export default ActionButtons;
