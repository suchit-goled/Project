import "./ProductCard.css";
import { useNavigate } from "react-router-dom";
import { FiHeart, FiTruck } from "react-icons/fi";
import { FaHeart, FaStar } from "react-icons/fa";
import { useCart } from "../../../context/CartContext";
import { useWishlist } from "../../../context/WishlistContext";

const ProductCard = ({ product }) => {
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const {
        addToWishlist,
        removeFromWishlist,
        isWishlisted
    } = useWishlist();

    const goToProduct = () => {
        navigate(`/products/${product._id}`);
    };

    const handleWishlist = async (e) => {
        e.stopPropagation();
        try {
            if (isWishlisted(product._id)) {
                await removeFromWishlist(product._id);
            } else {
                await addToWishlist(product._id);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const storeName = product.storeId?.name || product.store?.name || (product.sellerId ? "Verified Seller" : "ElectroNova Direct");
    const stockCount = product.stock ?? product.countInStock ?? 25;

    return (
        <article
            className="product-card"
            onClick={goToProduct}
        >
            {product.discount_percentage > 0 && (
                <div className="product-card__badge">
                    {product.discount_percentage}% OFF
                </div>
            )}

            <button
                className="wishlist-btn"
                onClick={handleWishlist}
                aria-label={isWishlisted(product._id) ? "Remove from wishlist" : "Add to wishlist"}
            >
                {isWishlisted(product._id)
                    ? <FaHeart color="#ff3b5c" />
                    : <FiHeart />}
            </button>

            <div className="product-card__image">
                <img
                    src={product.product_image_url || product.image}
                    alt={product.product_title || product.title}
                    loading="lazy"
                    decoding="async"
                    width="145"
                    height="145"
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&q=80";
                    }}
                />
            </div>

            <div className="product-card__content">
                <div className="category-and-brand">
                    <span className="brand">
                        {product.product_category || product.category}
                    </span>
                    {product.brand && product.brand !== product.product_category && (
                        <span className="brand-pill">{product.brand}</span>
                    )}
                </div>

                <h3>
                    {product.product_title || product.title}
                </h3>

                <div className="seller-attribution">
                    <span className="seller-label">Seller:</span>
                    <span className="seller-name">{storeName}</span>
                </div>

                <div className="rating">
                    <FaStar color="#f59e0b" size={13} style={{ flexShrink: 0, marginBottom: "1px" }} />
                    <span className="rating-value">{product.product_rating ?? product.rating ?? 0}</span>
                    <span>
                        ({(product.total_reviews ?? product.numReviews ?? 0).toLocaleString()} Reviews)
                    </span>
                </div>

                <div className="price-section">
                    <span className="discount-price">
                        ₹{(product.discounted_price ?? product.discountPrice ?? 0).toLocaleString()}
                    </span>

                    <span className="original-price">
                        ₹{(product.original_price ?? product.price ?? 0).toLocaleString()}
                    </span>
                </div>

                <div className="card-marketplace-footer">
                    <div className="delivery-badge-tag">
                        <FiTruck className="truck-icon" />
                        <span>Free Delivery</span>
                    </div>

                    {stockCount > 0 && stockCount <= 8 && (
                        <span className="low-stock-alert">Only {stockCount} left!</span>
                    )}
                </div>

                <div onClick={(e) => e.stopPropagation()}>
                    <button
                        className="add-to-cart-btn"
                        onClick={(e) => {
                            e.stopPropagation();
                            addToCart(product._id);
                        }}
                    >
                        Add To Cart
                    </button>
                </div>
            </div>
        </article>
    );
};

export default ProductCard;
