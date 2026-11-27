import { useState } from "react";
import "./ProductCard.css";
import { Link } from "react-router-dom";
import { FiHeart, FiCheck } from "react-icons/fi";
import { FaHeart, FaStar } from "react-icons/fa";
import { useCart } from "../../../context/CartContext";
import { useWishlist } from "../../../context/WishlistContext";
import CatalogImage from "../CatalogImage";
import { formatINR } from "../../../utils/formatCurrency";

const ProductCard = ({ product }) => {
    const { addToCart } = useCart();
    const [addedEffect, setAddedEffect] = useState(false);
    const {
        addToWishlist,
        removeFromWishlist,
        isWishlisted
    } = useWishlist();

    const productPath = "/products/" + product._id;

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

    const handleAddToCart = (e) => {
        e.stopPropagation();
        addToCart(product._id);
        setAddedEffect(true);
        setTimeout(() => setAddedEffect(false), 1200);
    };

    const storeName = product.storeId?.name || product.store?.name || (product.sellerId ? "Verified Seller" : "ElectroNova Direct");
    const stockCount = product.stock ?? product.countInStock ?? 25;
    const discountedPrice = product.discounted_price ?? product.discountPrice ?? 0;
    const originalPrice = product.original_price ?? product.price ?? 0;
    const reviewsCount = product.total_reviews ?? product.numReviews ?? 0;

    return (
        <article
            className="product-card"
        >
            <div className="product-card__media">
                {product.discount_percentage > 0 && (
                    <span className="product-card__badge tabular-nums">
                        {product.discount_percentage}% OFF
                    </span>
                )}

                <button
                    type="button"
                    className="wishlist-btn"
                    onClick={handleWishlist}
                    aria-label={isWishlisted(product._id) ? "Remove from wishlist" : "Add to wishlist"}
                >
                    {isWishlisted(product._id)
                        ? <FaHeart color="#C84B1E" size={15} />
                        : <FiHeart size={15} />}
                </button>

                <Link to={productPath} className="product-card__image" tabIndex={-1} aria-hidden="true">
                    <CatalogImage
                        src={product.product_image_url || product.image}
                        alt={product.product_title || product.title}
                        className="product-card__img"
                    />
                </Link>
            </div>

            <div className="product-card__content">
                <div className="category-and-brand">
                    <span className="brand">
                        {product.product_category || product.category}
                    </span>
                    {product.brand && product.brand !== product.product_category && (
                        <span className="brand-sep">· {product.brand}</span>
                    )}
                </div>

                <h3 className="product-card__title">
                    <Link to={productPath}>{product.product_title || product.title}</Link>
                </h3>

                <div className="seller-attribution">
                    <span className="seller-name">{storeName}</span>
                </div>

                <div className="rating tabular-nums">
                    <FaStar color="#C84B1E" size={12} style={{ flexShrink: 0 }} />
                    <span className="rating-value">{product.product_rating ?? product.rating ?? 0}</span>
                    <span className="rating-count">
                        ({reviewsCount.toLocaleString("en-IN")} Reviews)
                    </span>
                </div>

                <div className="price-section tabular-nums">
                    <span className="discount-price">
                        {formatINR(discountedPrice)}
                    </span>

                    {originalPrice > discountedPrice && (
                        <span className="original-price">
                            {formatINR(originalPrice)}
                        </span>
                    )}
                </div>

                <div className="card-marketplace-footer">
                    <span className="delivery-badge-tag">Free delivery</span>
                    {stockCount > 0 && stockCount <= 8 && (
                        <span className="low-stock-alert tabular-nums">
                            {stockCount} in stock
                        </span>
                    )}
                </div>

                <div className="product-card__cta" onClick={(e) => e.stopPropagation()}>
                    <button
                        type="button"
                        className={`add-to-cart-btn ${addedEffect ? "added-active" : ""}`}
                        onClick={handleAddToCart}
                        aria-label="Add To Cart"
                    >
                        {addedEffect ? (
                            <>
                                <FiCheck size={14} />
                                <span>Added</span>
                            </>
                        ) : (
                            <span>Add to cart</span>
                        )}
                    </button>
                </div>
            </div>
        </article>
    );
};

export default ProductCard;
