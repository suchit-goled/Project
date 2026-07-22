import "./ProductCard.css";

import { useNavigate } from "react-router-dom";
import { FiHeart } from "react-icons/fi";
import { FaHeart } from "react-icons/fa";

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
            >

                {
                    isWishlisted(product._id)
                        ? <FaHeart color="#ff3b5c" />
                        : <FiHeart />
                }

            </button>

            <div className="product-card__image">

                <img
                    src={product.product_image_url}
                    alt={product.product_title}
                />

            </div>

            <div className="product-card__content">

                <span className="brand">

                    {product.product_category}

                </span>

                <h3>

                    {product.product_title}

                </h3>

                <div className="rating">

                    ⭐ {product.product_rating ?? 0}

                    <span>

                        ({(product.total_reviews ?? 0).toLocaleString()} Reviews)

                    </span>

                </div>

                <div className="price-section">

                    <span className="discount-price">

                        ₹{(product.discounted_price ?? 0).toLocaleString()}

                    </span>

                    <span className="original-price">

                        ₹{(product.original_price ?? 0).toLocaleString()}

                    </span>

                </div>

                <div
                    onClick={(e) => e.stopPropagation()}
                >

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