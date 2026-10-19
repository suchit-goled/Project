import { Link } from "react-router-dom";
import "./EmptyWishlist.css";
import { FaHeartBroken } from "react-icons/fa";

const EmptyWishlist = () => {
    return (
        <div className="empty-wishlist">
            <FaHeartBroken size={64} color="#ff6b35" />
            <h2>Your Wishlist is Empty</h2>
            <p>Save products you love and buy them later.</p>
            <Link to="/products">
                Explore Products
            </Link>
        </div>
    );
};

export default EmptyWishlist;