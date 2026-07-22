import "./WishlistCard.css";

import { FaHeart, FaStar } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import { useWishlist } from "../../context/WishlistContext";
import { useCart } from "../../context/CartContext";

const WishlistCard = ({ product }) => {

    const navigate = useNavigate();

    const { removeFromWishlist } = useWishlist();
    const { addToCart } = useCart();

    const moveToCart = async () => {

        await addToCart(product._id);

        await removeFromWishlist(product._id);

    };

    return (

        <article
            className="wishlist-card"
            onClick={() => navigate(`/products/${product._id}`)}
        >

            <button
                className="wishlist-remove"
                onClick={(e) => {

                    e.stopPropagation();

                    removeFromWishlist(product._id);

                }}
            >

                <FaHeart />

            </button>

            <div className="wishlist-image">

                <img
                    src={product.product_image_url}
                    alt={product.product_title}
                />

            </div>

            <div className="wishlist-content">

                <h3>
                    {product.product_title}
                </h3>

                <div className="rating">

                    <FaStar />

                    {product.product_rating}

                    <span>
                        ({product.total_reviews.toLocaleString()} Reviews)
                    </span>

                </div>

                <div className="price">

                    <span className="current">
                        ₹{product.discounted_price.toLocaleString()}
                    </span>

                    <span className="old">
                        ₹{product.original_price.toLocaleString()}
                    </span>

                </div>

                <span className="discount">
    {product.discount_percentage}% OFF
</span>

                <button
                    className="move-cart-btn"
                    onClick={(e) => {

                        e.stopPropagation();

                        moveToCart();

                    }}
                >

                    Move To Cart

                </button>

            </div>

        </article>

    );

};

export default WishlistCard;