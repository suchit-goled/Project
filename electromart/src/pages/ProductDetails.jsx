import "./ProductDetails.css";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ProductService from "../services/product.service";
import { useCart } from "../context/CartContext";

const ProductDetails = () => {

    const { id } = useParams();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const { addToCart } = useCart();

    const [quantity, setQuantity] = useState(1);

    const [selectedImage, setSelectedImage] = useState("");

    const [wishlist, setWishlist] = useState(false);

    const [activeTab, setActiveTab] = useState("description");

    useEffect(() => {

        const fetchProduct = async () => {

            try {

                setLoading(true);

                const data = await ProductService.getProductById(id);

                setProduct(data);

                setSelectedImage(data.product_image_url);

            } catch (err) {

                console.error(err);

                setError("Unable to load product.");

            } finally {

                setLoading(false);

            }

        };

        fetchProduct();

    }, [id]);

    if (loading) {

        return (

            <div className="container">

                <h2>Loading Product...</h2>

            </div>

        );

    }

    if (error) {

        return (

            <div className="container">

                <h2>{error}</h2>

            </div>

        );

    }

    if (!product) {

        return (

            <div className="container">

                <h2>Product Not Found</h2>

            </div>

        );

    }

    const images = [
        product.product_image_url,
        product.product_image_url,
        product.product_image_url,
        product.product_image_url
    ];

    return (

        <div className="product-details-page container">

            <div className="breadcrumb">

                Home

                <span>›</span>

                Products

                <span>›</span>

                {product.product_category}

                <span>›</span>

                {product.product_title}

            </div>

            <div className="product-main">

                {/* LEFT */}

                <div className="product-gallery">

                    <div className="thumbnail-list">

                        {images.map((image, index) => (

                            <div
                                key={index}
                                className={`thumbnail ${selectedImage === image ? "active" : ""}`}
                                onClick={() => setSelectedImage(image)}
                            >

                                <img
                                    src={image}
                                    alt="thumbnail"
                                />

                            </div>

                        ))}

                    </div>

                    <div className="main-image">

                        <div className="image-badge">

                            {product.discount_percentage}% OFF

                        </div>

                        <button
                            className="image-heart"
                            onClick={() => setWishlist(!wishlist)}
                        >

                            {wishlist ? "❤️" : "🤍"}

                        </button>

                        <img
                            src={selectedImage}
                            alt={product.product_title}
                        />

                    </div>

                </div>

                {/* RIGHT */}

                <div className="product-info">

                    <span className="category">

                        {product.product_category}

                    </span>

                    <h1>

                        {product.product_title}

                    </h1>

                    <div className="rating">

                        ⭐ {product.product_rating}

                        <span>

                            ({product.total_reviews} Reviews)

                        </span>

                    </div>

                    <div className="price">

                        <span className="discount-price">

                            ₹{product.discounted_price}

                        </span>

                        <span className="original-price">

                            ₹{product.original_price}

                        </span>

                        <span className="discount">

                            {product.discount_percentage}% OFF

                        </span>

                    </div>



                    <div className="quantity">

                        <button
                            onClick={() =>
                                setQuantity(quantity > 1 ? quantity - 1 : 1)
                            }
                        >

                            -

                        </button>

                        <span>

                            {quantity}

                        </span>

                        <button
                            onClick={() =>
                                setQuantity(quantity + 1)
                            }
                        >

                            +

                        </button>

                    </div>

                    <div className="buttons">

                        <button
                            className="add-cart-btn"
                            onClick={() => addToCart(product._id)}
                        >
                            Add To Cart
                        </button>

                        <button className="buy-btn">

                            ⚡ Buy Now

                        </button>

                    </div>

                    <div className="product-features">

                        <div className="feature-card">

                            <h4>🚚 Fast Delivery</h4>

                            <p>Delivered within 2–4 Days</p>

                        </div>

                        <div className="feature-card">

                            <h4>🛡 Warranty</h4>

                            <p>1 Year Manufacturer Warranty</p>

                        </div>

                        <div className="feature-card">

                            <h4>💳 Secure Payment</h4>

                            <p>100% Safe Checkout</p>

                        </div>

                        <div className="feature-card">

                            <h4>⭐ Top Rated</h4>

                            <p>Trusted by Thousands of Customers</p>

                        </div>

                    </div>

                </div>

            </div>


            {/* Product Tabs */}

            <div className="product-tabs">

                <button
                    className={activeTab === "description" ? "active" : ""}
                    onClick={() => setActiveTab("description")}
                >
                    Description
                </button>

                <button
                    className={activeTab === "specifications" ? "active" : ""}
                    onClick={() => setActiveTab("specifications")}
                >
                    Specifications
                </button>

                <button
                    className={activeTab === "reviews" ? "active" : ""}
                    onClick={() => setActiveTab("reviews")}
                >
                    Reviews
                </button>

            </div>

            <div className="tab-content">

                {activeTab === "description" && (

                    <div>

                        <h2>Product Description</h2>

                        <p>

                            The <strong>{product.product_title}</strong> is a premium-quality product
                            designed to provide exceptional performance, durability, and value.
                            Built with high-quality materials and modern technology, it offers
                            reliable everyday use while maintaining a sleek and stylish appearance.

                        </p>

                        <p>

                            Whether you're purchasing it for personal use or as a gift,
                            this product delivers an excellent experience with trusted
                            quality and long-lasting performance.

                        </p>

                    </div>

                )}

                {activeTab === "specifications" && (

                    <table className="spec-table">

                        <tbody>

                            <tr>
                                <td>Category</td>
                                <td>{product.product_category}</td>
                            </tr>

                            <tr>
                                <td>Rating</td>
                                <td>{product.product_rating} ⭐</td>
                            </tr>

                            <tr>
                                <td>Total Reviews</td>
                                <td>{product.total_reviews}</td>
                            </tr>

                            <tr>
                                <td>Original Price</td>
                                <td>₹{product.original_price}</td>
                            </tr>

                            <tr>
                                <td>Discount Price</td>
                                <td>₹{product.discounted_price}</td>
                            </tr>

                            <tr>
                                <td>Discount</td>
                                <td>{product.discount_percentage}%</td>
                            </tr>

                            <tr>
                                <td>Availability</td>
                                <td>In Stock</td>
                            </tr>

                        </tbody>

                    </table>

                )}

                {activeTab === "reviews" && (

                    <div className="reviews">

                        <div className="review-card">

                            <h4>⭐⭐⭐⭐⭐ Rahul Sharma</h4>

                            <p>

                                Amazing product! Excellent quality and
                                quick delivery. Highly recommended.

                            </p>

                        </div>

                        <div className="review-card">

                            <h4>⭐⭐⭐⭐⭐ Priya Patel</h4>

                            <p>

                                Worth every rupee. Packaging was excellent
                                and the product exceeded my expectations.

                            </p>

                        </div>

                        <div className="review-card">

                            <h4>⭐⭐⭐⭐ Arjun Kumar</h4>

                            <p>

                                Great build quality with good performance.
                                Definitely a value-for-money purchase.

                            </p>

                        </div>

                    </div>

                )}

            </div>

            {/* Related Products */}

            <section className="related-products">

                <h2>

                    You May Also Like

                </h2>

                <div className="related-grid">

                    {[1, 2, 3, 4].map((item) => (

                        <div
                            key={item}
                            className="related-card"
                        >

                            <div className="related-image">

                                <span className="related-discount">
                                    {product.discount_percentage}% OFF
                                </span>



                                <img
                                    src={product.product_image_url}
                                    alt={product.product_title}
                                />

                            </div>

                            <div className="related-rating">

                                ⭐ {product.product_rating}

                                <span>
                                    ({product.total_reviews})
                                </span>

                            </div>

                            <h4>

                                {product.product_title}

                            </h4>

                            <div className="related-price">

                                <h3>

                                    ₹{product.discounted_price}

                                </h3>

                                <span>

                                    ₹{product.original_price}

                                </span>

                            </div>

                            <button
    className="add-to-cart-btn"
    onClick={(e) => {
        e.stopPropagation();
        console.log("Button clicked");
        console.log(product._id);
        addToCart(product._id);
    }}
>
    Add To Cart
</button>

                        </div>

                    ))}

                </div>

            </section>

        </div>

    );

};

export default ProductDetails;