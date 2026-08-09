import { Link } from "react-router-dom";
import "../wishlist/EmptyWishlist.css";

const EmptyWishlist = () => {

    return (

        <div className="empty-wishlist">

            <h2>
                ❤️ Your Wishlist is Empty
            </h2>

            <p>
                Save products you love and buy them later.
            </p>

            <Link to="/products">

                Explore Products

            </Link>

        </div>

    );

};

export default EmptyWishlist;