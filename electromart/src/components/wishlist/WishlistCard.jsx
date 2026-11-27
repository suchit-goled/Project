import "./WishlistCard.css";
import { formatINR } from "../../utils/formatCurrency";
import CatalogImage from "../common/CatalogImage";

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
                aria-label="Remove from wishlist"
                onClick={(e) => {
                    e.stopPropagation();
                    removeFromWishlist(product._id);
                }}
            >
                <FaHeart />
            </button>

            <div className="wishlist-image">
                <CatalogImage
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
                    {product.product_rating ?? 0}
                    <span>
                        ({(product.total_reviews ?? 0).toLocaleString()} Reviews)
                    </span>
                </div>

                <div className="price">
                    <span className="current">
                        {formatINR(product.discounted_price)}
                    </span>

                    <span className="old">
                        {formatINR(product.original_price)}
                    </span>
                </div>

                {product.discount_percentage > 0 && (
                    <span className="discount">
                        {product.discount_percentage}% OFF
                    </span>
                )}

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
