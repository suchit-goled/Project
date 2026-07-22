import "./Wishlist.css";

import { useWishlist } from "../context/WishlistContext";
import WishlistCard from "../components/wishlist/WishlistCard";
import EmptyWishlist from "../components/wishlist/EmptyWishlist";

const Wishlist = () => {

    const { wishlist, loading } = useWishlist();

    if (loading) {
        return (
            <div className="wishlist-loading">
                Loading...
            </div>
        );
    }

    if (wishlist.length === 0) {
        return <EmptyWishlist />;
    }

    return (

        <section className="wishlist-page container">

            <h1 className="wishlist-title">
                My Wishlist
            </h1>

            <div className="wishlist-grid">

                {wishlist.map(item => (

                    <WishlistCard
                        key={item._id}
                        product={item.productId}
                    />

                ))}

            </div>

        </section>

    );

};

export default Wishlist;