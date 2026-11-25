import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
    FiHeart,
    FiShoppingCart,
    FiZap,
    FiTruck,
    FiShield,
    FiRotateCcw,
    FiCheck,
    FiCheckCircle,
    FiClock,
    FiChevronRight,
    FiShare2,
    FiMessageSquare,
    FiMapPin,
    FiExternalLink
} from "react-icons/fi";
import { FaHeart, FaStar } from "react-icons/fa";
import toast from "react-hot-toast";

import ProductService from "../services/product.service";
import ReviewService from "../services/review.service";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useAuth } from "../context/AuthContext";
import { useDelivery } from "../context/DeliveryContext";
import CatalogImage from "../components/common/CatalogImage";
import ProductCard from "../components/common/Card/ProductCard";
import ProductSkeleton from "../components/common/Skeleton/ProductSkeleton";
import OtherSellersComparison from "../components/Products/OtherSellersComparison";

import "./ProductDetails.css";

const RECENTLY_VIEWED_KEY = "electronova_recently_viewed";

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const { user } = useAuth();
    const { addToCart } = useCart();
    const { addToWishlist, removeFromWishlist, isWishlisted } = useWishlist();
    const { pincode, deliveryInfo, openPincodeModal } = useDelivery();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState("");
    const [activeTab, setActiveTab] = useState("description");

    const [relatedProducts, setRelatedProducts] = useState([]);
    const [sellerOffers, setSellerOffers] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [reviewsLoading, setReviewsLoading] = useState(false);

    // Review form state
    const [userRating, setUserRating] = useState(5);
    const [userComment, setUserComment] = useState("");
    const [submittingReview, setSubmittingReview] = useState(false);

    const isCurrentProductWishlisted = product ? isWishlisted(product._id) : false;

    // Fetch product details, other offers, related products, and reviews
    const fetchProductData = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const data = await ProductService.getProductById(id);
            setProduct(data);
            setSelectedImage(data.product_image_url || data.image);

            // Record to recently viewed in localStorage
            try {
                const stored = localStorage.getItem(RECENTLY_VIEWED_KEY);
                let list = stored ? JSON.parse(stored) : [];
                list = list.filter((item) => (item._id || item.id) !== data._id);
                list.unshift(data);
                if (list.length > 10) list = list.slice(0, 10);
                localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(list));
            } catch (storageErr) {
                console.warn("Could not save to recently viewed:", storageErr);
            }

            // Fetch alternative seller offers
            try {
                const offers = await ProductService.getOtherSellerOffers(id);
                setSellerOffers(offers);
            } catch (offerErr) {
                console.warn("Could not load other seller offers:", offerErr);
            }

            // Fetch related products
            const related = await ProductService.getRelatedProducts(id);
            setRelatedProducts(related);

            // Fetch reviews
            setReviewsLoading(true);
            const reviewList = await ReviewService.getProductReviews(id);
            setReviews(reviewList);
        } catch (err) {
            console.error(err);
            setError("Unable to find or load the requested product.");
        } finally {
            setLoading(false);
            setReviewsLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchProductData();
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, [fetchProductData]);

    const handleWishlistToggle = async () => {
        if (!user) {
            toast.error("Please sign in to save items to your wishlist");
            navigate("/login");
            return;
        }

        try {
            if (isCurrentProductWishlisted) {
                await removeFromWishlist(product._id);
                toast.success("Removed from wishlist");
            } else {
                await addToWishlist(product._id);
                toast.success("Added to wishlist");
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to update wishlist");
        }
    };

    const handleAddToCart = async () => {
        try {
            await addToCart(product._id, quantity);
            toast.success(`Added ${quantity} × ${product.product_title} to cart`);
        } catch (err) {
            console.error(err);
            toast.error("Failed to add to cart");
        }
    };

    const handleBuyNow = async () => {
        try {
            await addToCart(product._id, quantity);
            navigate("/checkout");
        } catch (err) {
            console.error(err);
            toast.error("Failed to proceed to checkout");
        }
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: product.product_title,
                url: window.location.href
            }).catch(() => {});
        } else {
            navigator.clipboard.writeText(window.location.href);
            toast.success("Product link copied to clipboard!");
        }
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            toast.error("Please login to write a review");
            navigate("/login");
            return;
        }

        if (!userComment.trim()) {
            toast.error("Please enter a short review comment");
            return;
        }

        try {
            setSubmittingReview(true);
            await ReviewService.addReview({
                productId: product._id,
                rating: Number(userRating),
                comment: userComment.trim(),
            });

            toast.success("Review submitted successfully! Thank you for your feedback.");
            setUserComment("");
            setUserRating(5);

            // Refresh reviews & product stats
            const updatedReviews = await ReviewService.getProductReviews(product._id);
            setReviews(updatedReviews);
            const refreshedProduct = await ProductService.getProductById(product._id);
            setProduct(refreshedProduct);
        } catch (err) {
            console.error("Submit review error:", err);
            const msg = err.response?.data?.message || "Failed to submit review";
            toast.error(msg);
        } finally {
            setSubmittingReview(false);
        }
    };

    if (loading) {
        return (
            <div className="product-details-page container">
                <div style={{ padding: "40px 0" }}>
                    <ProductSkeleton />
                </div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="product-details-page container">
                <div className="product-error-box">
                    <h2>Product Not Found</h2>
                    <p>{error || "We couldn't locate the item you were looking for."}</p>
                    <Link to="/products" className="back-catalogue-btn">
                        Browse All Products
                    </Link>
                </div>
            </div>
        );
    }

    const savings = Math.max(0, (product.original_price || 0) - (product.discounted_price || 0));
    const inStock = (product.countInStock ?? 25) > 0;
    const store = product.store || {};
    const storeName = store.name || "ElectroNova Official Store";
    const storeSlug = store.slug || "";
    const imagesList = Array.isArray(product.images) && product.images.length > 0
        ? product.images
        : [selectedImage || product.product_image_url || product.image];

    return (
        <div className="product-details-page container">
            {/* Breadcrumb Navigation */}
            <nav className="product-breadcrumb" aria-label="Breadcrumb">
                <Link to="/">Home</Link>
                <FiChevronRight />
                <Link to="/products">Products</Link>
                <FiChevronRight />
                <Link to={`/products/category/${encodeURIComponent(product.product_category || "all")}`}>
                    {product.product_category}
                </Link>
                <FiChevronRight />
                <span className="current-crumb">{product.product_title}</span>
            </nav>

            {/* Product Overview Layout */}
            <div className="product-main">
                {/* LEFT: Image Showcase */}
                <div className="product-gallery">
                    <div className="main-image-wrapper">
                        {product.discount_percentage > 0 && (
                            <span className="discount-pill">
                                {product.discount_percentage}% OFF
                            </span>
                        )}

                        <div className="gallery-action-buttons">
                            <button
                                className={`wishlist-pill-btn ${isCurrentProductWishlisted ? "active" : ""}`}
                                onClick={handleWishlistToggle}
                                title={isCurrentProductWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                                aria-label="Toggle wishlist"
                            >
                                {isCurrentProductWishlisted ? <FaHeart color="#ff3b5c" /> : <FiHeart />}
                            </button>
                            <button
                                className="share-pill-btn"
                                onClick={handleShare}
                                title="Share product"
                                aria-label="Share product"
                            >
                                <FiShare2 />
                            </button>
                        </div>

                        <CatalogImage
                            src={selectedImage || product.product_image_url || product.image}
                            alt={product.product_title}
                            className="primary-product-image"
                            loading="eager"
                        />
                    </div>

                    {/* Image Thumbnail Selector */}
                    {imagesList.length > 1 && (
                        <div className="thumbnails-row">
                            {imagesList.map((imgUrl, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    className={`thumbnail-btn ${selectedImage === imgUrl ? "active" : ""}`}
                                    onClick={() => setSelectedImage(imgUrl)}
                                >
                                    <img src={imgUrl} alt={`${product.product_title} view ${idx + 1}`} />
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="stock-delivery-indicator">
                        <div className="indicator-item">
                            <span className={`status-dot ${inStock ? "in-stock" : "out-of-stock"}`} />
                            <strong>{inStock ? "In Stock — Ready to Ship" : "Currently Out of Stock"}</strong>
                        </div>
                        <div className="indicator-item">
                            <FiClock />
                            <span>Dispatches within 24 Hours</span>
                        </div>
                    </div>
                </div>

                {/* RIGHT: Product Information & Purchase CTAs */}
                <div className="product-info-panel">
                    <div className="product-category-brand">
                        <span className="category-tag">{product.product_category}</span>
                        {product.brand && <span className="brand-tag">Brand: <strong>{product.brand}</strong></span>}
                    </div>

                    <h1 className="product-title">{product.product_title}</h1>

                    {/* Rating row */}
                    <div className="product-rating-row">
                        <div className="rating-badge">
                            <FaStar />
                            <span>{product.product_rating ?? 4.5}</span>
                        </div>
                        <span className="reviews-count-text">
                            Based on {(product.total_reviews ?? 0).toLocaleString()} customer reviews
                        </span>
                        <button
                            className="jump-reviews-btn"
                            onClick={() => {
                                setActiveTab("reviews");
                                const el = document.getElementById("product-tabs-section");
                                if (el) el.scrollIntoView({ behavior: "smooth" });
                            }}
                        >
                            <FiMessageSquare /> View Reviews ({reviews.length})
                        </button>
                    </div>

                    {/* Price section */}
                    <div className="product-pricing-card">
                        <div className="price-main-row">
                            <span className="price-discounted">
                                ₹{(product.discounted_price ?? 0).toLocaleString()}
                            </span>
                            {product.original_price > product.discounted_price && (
                                <span className="price-original">
                                    ₹{(product.original_price ?? 0).toLocaleString()}
                                </span>
                            )}
                            {savings > 0 && (
                                <span className="savings-badge">
                                    Save ₹{savings.toLocaleString()}
                                </span>
                            )}
                        </div>
                        <span className="tax-inclusive-label">
                            Inclusive of all applicable GST taxes. Free express shipping applied.
                        </span>
                    </div>

                    {/* SELLER / STORE CARD */}
                    <div className="product-seller-card">
                        <div className="seller-card-top">
                            <div className="seller-card-info">
                                <span className="seller-subheading">Sold & Fulfilled By:</span>
                                <div className="seller-heading-row">
                                    {storeSlug ? (
                                        <Link to={`/stores/${storeSlug}`} className="seller-store-title">
                                            {storeName} <FiExternalLink />
                                        </Link>
                                    ) : (
                                        <span className="seller-store-title">{storeName}</span>
                                    )}
                                    {store.isVerified && (
                                        <span className="seller-verified-tag">
                                            <FiCheckCircle /> Verified Partner
                                        </span>
                                    )}
                                </div>
                                <div className="seller-details-row">
                                    <span className="seller-store-rating">
                                        <FaStar className="star-icon" /> {store.rating?.toFixed(1) || "4.8"} / 5.0
                                    </span>
                                    {store.pickupAddress?.city && (
                                        <span className="seller-city-tag">
                                            <FiMapPin /> Ships from {store.pickupAddress.city}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="seller-delivery-badge">
                            {product.deliveryOptions?.supportsPlatformDelivery ? (
                                <span className="fulfillment-tag platform">
                                    <FiTruck /> ElectroNova Express Fulfilled
                                </span>
                            ) : (
                                <span className="fulfillment-tag direct">
                                    <FiTruck /> Direct Store Dispatch
                                </span>
                            )}
                        </div>
                    </div>

                    {/* LOCAL PIN CODE DELIVERY CHECKER WIDGET */}
                    <div className="pincode-checker-widget">
                        <div className="pincode-widget-header">
                            <span className="pincode-title">
                                <FiMapPin className="pin-icon" />
                                {pincode ? (
                                    <span>Deliver to: <strong>{deliveryInfo?.city || "PIN"} - {pincode}</strong></span>
                                ) : (
                                    <span>Check Delivery & Cash on Delivery Availability</span>
                                )}
                            </span>
                            <button
                                type="button"
                                className="change-pin-btn"
                                onClick={openPincodeModal}
                            >
                                {pincode ? "Change PIN" : "Select PIN"}
                            </button>
                        </div>
                        <div className="pincode-estimate-text">
                            {pincode ? (
                                <span>⚡ Express Delivery available: <strong>Arrives in 2–3 Days</strong></span>
                            ) : (
                                <span>Enter your 6-digit delivery PIN code to see exact delivery date & seller options.</span>
                            )}
                        </div>
                    </div>

                    {/* Quantity & Actions */}
                    <div className="product-purchase-controls">
                        <div className="quantity-controller">
                            <label htmlFor="quantity-selector">Quantity:</label>
                            <div className="quantity-stepper">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    disabled={quantity <= 1}
                                    aria-label="Decrease quantity"
                                >
                                    -
                                </button>
                                <span id="quantity-selector">{quantity}</span>
                                <button
                                    onClick={() => setQuantity(Math.min(10, quantity + 1))}
                                    disabled={quantity >= 10}
                                    aria-label="Increase quantity"
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        <div className="action-buttons-group">
                            <button
                                className="add-to-cart-primary"
                                onClick={handleAddToCart}
                                disabled={!inStock}
                            >
                                <FiShoppingCart />
                                <span>{inStock ? "Add to Cart" : "Out of Stock"}</span>
                            </button>

                            <button
                                className="buy-now-accent"
                                onClick={handleBuyNow}
                                disabled={!inStock}
                            >
                                <FiZap />
                                <span>Buy Now</span>
                            </button>
                        </div>
                    </div>

                    {/* Guarantees Matrix */}
                    <div className="product-guarantees-matrix">
                        <div className="guarantee-box">
                            <FiTruck />
                            <div>
                                <strong>Free Express Delivery</strong>
                                <p>Arrives in 2–4 business days</p>
                            </div>
                        </div>
                        <div className="guarantee-box">
                            <FiShield />
                            <div>
                                <strong>1-Year Official Warranty</strong>
                                <p>Manufacturer backed guarantee</p>
                            </div>
                        </div>
                        <div className="guarantee-box">
                            <FiRotateCcw />
                            <div>
                                <strong>7-Day Replacement</strong>
                                <p>Covers dead-on-arrival units</p>
                            </div>
                        </div>
                        <div className="guarantee-box">
                            <FiCheck />
                            <div>
                                <strong>100% Genuine Device</strong>
                                <p>Authorised brand sourcing</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* MULTI-SELLER OFFER COMPARISON TABLE */}
            {sellerOffers.length > 1 && (
                <OtherSellersComparison
                    offers={sellerOffers}
                    currentProductId={product._id}
                />
            )}

            {/* Product Tabs Section */}
            <div className="product-tabs-section" id="product-tabs-section">
                <div className="tabs-header">
                    <button
                        className={`tab-btn ${activeTab === "description" ? "active" : ""}`}
                        onClick={() => setActiveTab("description")}
                    >
                        Overview & Features
                    </button>
                    <button
                        className={`tab-btn ${activeTab === "specifications" ? "active" : ""}`}
                        onClick={() => setActiveTab("specifications")}
                    >
                        Technical Specifications
                    </button>
                    <button
                        className={`tab-btn ${activeTab === "reviews" ? "active" : ""}`}
                        onClick={() => setActiveTab("reviews")}
                    >
                        Verified Reviews ({reviews.length})
                    </button>
                    <button
                        className={`tab-btn ${activeTab === "warranty" ? "active" : ""}`}
                        onClick={() => setActiveTab("warranty")}
                    >
                        Shipping & Warranty
                    </button>
                </div>

                <div className="tab-body">
                    {/* Tab 1: Description */}
                    {activeTab === "description" && (
                        <div className="tab-content description-tab">
                            <h3>Product Overview</h3>
                            <p>
                                The <strong>{product.product_title}</strong> delivers benchmark-grade performance,
                                premium industrial design, and seamless usability. Sourced directly from brand-authorised
                                distributors, it undergoes rigorous inspection to meet the highest reliability standards.
                            </p>
                            <p>
                                Built for demanding everyday workloads, creative multitasking, and entertainment,
                                it blends power efficiency with contemporary craftsmanship. Includes original accessories,
                                user manual, and tax invoice for full manufacturer warranty service.
                            </p>
                            <div className="key-highlights-list">
                                <h4>Key Highlights:</h4>
                                <ul>
                                    <li><FiCheckCircle className="highlight-check" /> Official Brand New Sealed Packaging with verified serial numbers.</li>
                                    <li><FiCheckCircle className="highlight-check" /> Nationwide warranty service at all brand-authorised repair hubs.</li>
                                    <li><FiCheckCircle className="highlight-check" /> Prioritized dispatch from climate-controlled warehouse centers.</li>
                                </ul>
                            </div>
                        </div>
                    )}

                    {/* Tab 2: Specifications */}
                    {activeTab === "specifications" && (
                        <div className="tab-content specs-tab">
                            <h3>Technical Specifications</h3>
                            <table className="specs-table">
                                <tbody>
                                    <tr>
                                        <th>Product Name</th>
                                        <td>{product.product_title}</td>
                                    </tr>
                                    <tr>
                                        <th>Category</th>
                                        <td>{product.product_category}</td>
                                    </tr>
                                    {product.brand && (
                                        <tr>
                                            <th>Brand</th>
                                            <td>{product.brand}</td>
                                        </tr>
                                    )}
                                    {product.sku && (
                                        <tr>
                                            <th>SKU Code</th>
                                            <td>{product.sku}</td>
                                        </tr>
                                    )}
                                    <tr>
                                        <th>Original Price</th>
                                        <td>₹{(product.original_price ?? 0).toLocaleString()}</td>
                                    </tr>
                                    <tr>
                                        <th>Offer Price</th>
                                        <td>₹{(product.discounted_price ?? 0).toLocaleString()}</td>
                                    </tr>
                                    <tr>
                                        <th>Discount</th>
                                        <td>{product.discount_percentage}% OFF</td>
                                    </tr>
                                    <tr>
                                        <th>Seller</th>
                                        <td>{storeName}</td>
                                    </tr>
                                    <tr>
                                        <th>Warranty Period</th>
                                        <td>1 Year Manufacturer Warranty</td>
                                    </tr>
                                    <tr>
                                        <th>Stock Status</th>
                                        <td>{inStock ? `Available (${product.stock ?? 25} in stock)` : "Out of stock"}</td>
                                    </tr>
                                    {/* Render custom specifications */}
                                    {Array.isArray(product.specifications) && product.specifications.map((spec, sIdx) => (
                                        <tr key={sIdx}>
                                            <th>{spec.name || spec.key}</th>
                                            <td>{spec.value}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Tab 3: Reviews */}
                    {activeTab === "reviews" && (
                        <div className="tab-content reviews-tab">
                            <div className="reviews-summary-row">
                                <div className="rating-overview-card">
                                    <span className="big-rating-number">{product.product_rating ?? 4.5}</span>
                                    <div className="stars-row">
                                        {[1, 2, 3, 4, 5].map((s) => (
                                            <FaStar key={s} className="star-gold" />
                                        ))}
                                    </div>
                                    <span className="total-ratings-text">
                                        {(product.total_reviews ?? reviews.length).toLocaleString()} Verified Ratings
                                    </span>
                                </div>

                                {/* Add Review Form */}
                                <div className="add-review-form-card">
                                    <h4>Write a Verified Review</h4>
                                    {user ? (
                                        <form onSubmit={handleReviewSubmit}>
                                            <div className="review-rating-select">
                                                <span>Your Rating:</span>
                                                <div className="star-picker">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <button
                                                            type="button"
                                                            key={star}
                                                            className={`star-pick-btn ${userRating >= star ? "active" : ""}`}
                                                            onClick={() => setUserRating(star)}
                                                            aria-label={`Rate ${star} star`}
                                                        >
                                                            <FaStar />
                                                        </button>
                                                    ))}
                                                    <span className="selected-star-num">({userRating} / 5)</span>
                                                </div>
                                            </div>
                                            <textarea
                                                rows={3}
                                                placeholder="Share your authentic experience with this product..."
                                                value={userComment}
                                                onChange={(e) => setUserComment(e.target.value)}
                                                required
                                            />
                                            <button
                                                type="submit"
                                                className="submit-review-btn"
                                                disabled={submittingReview}
                                            >
                                                {submittingReview ? "Submitting..." : "Post Review"}
                                            </button>
                                        </form>
                                    ) : (
                                        <div className="login-to-review-notice">
                                            <p>Please sign in to your ElectroNova account to share your verified review.</p>
                                            <button
                                                onClick={() => navigate("/login")}
                                                className="review-login-btn"
                                            >
                                                Sign In to Review
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Review Cards List */}
                            <div className="reviews-list">
                                {reviewsLoading ? (
                                    <p>Loading customer reviews...</p>
                                ) : reviews.length === 0 ? (
                                    <div className="empty-reviews-state">
                                        <p>No customer reviews yet. Be the first to share your thoughts!</p>
                                    </div>
                                ) : (
                                    reviews.map((rev) => (
                                        <div key={rev._id} className="review-item-card">
                                            <div className="review-header">
                                                <div className="reviewer-info">
                                                    <div className="reviewer-avatar">
                                                        {rev.userId?.name ? rev.userId.name[0].toUpperCase() : "U"}
                                                    </div>
                                                    <div>
                                                        <strong>{rev.userId?.name || "Verified Customer"}</strong>
                                                        <span className="verified-buyer-tag"><FiCheckCircle size={12} /> Verified Purchase</span>
                                                    </div>
                                                </div>
                                                <div className="review-stars">
                                                    {Array.from({ length: rev.rating || 5 }).map((_, i) => (
                                                        <FaStar key={i} className="star-gold" />
                                                    ))}
                                                </div>
                                            </div>
                                            <p className="review-comment-text">{rev.comment}</p>
                                            <span className="review-date-text">
                                                {new Date(rev.createdAt || Date.now()).toLocaleDateString("en-IN", {
                                                    day: "numeric",
                                                    month: "short",
                                                    year: "numeric"
                                                })}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {/* Tab 4: Warranty */}
                    {activeTab === "warranty" && (
                        <div className="tab-content warranty-tab">
                            <h3>Shipping & Manufacturer Warranty Policy</h3>
                            <p>
                                All items ordered on ElectroNova come with an official manufacturer warranty (1 Year standard).
                                The GST invoice provided upon order fulfillment acts as your proof of purchase.
                            </p>
                            <h4>Authorized Service Network</h4>
                            <p>
                                You can visit any authorized brand service center nationwide for warranty repairs, battery service, or diagnostic evaluations.
                            </p>
                            <h4>Replacement Policy</h4>
                            <p>
                                If your device experiences hardware issues within 7 days of delivery, our reverse logistics partner will collect the product for immediate replacement.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Related Products Section */}
            {relatedProducts.length > 0 && (
                <section className="related-products-section">
                    <div className="related-header">
                        <h2>Similar in {product.product_category}</h2>
                        <Link to={`/products/category/${encodeURIComponent(product.product_category || "all")}`}>
                            View More <FiChevronRight />
                        </Link>
                    </div>

                    <div className="related-grid">
                        {relatedProducts.map((relProduct) => (
                            <ProductCard key={relProduct._id} product={relProduct} />
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
};

export default ProductDetails;
