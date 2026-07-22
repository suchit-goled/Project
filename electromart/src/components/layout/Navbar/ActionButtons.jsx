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