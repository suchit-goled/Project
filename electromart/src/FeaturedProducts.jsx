

import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function FeaturedProducts() {
    const [products, setProducts] = useState([]);
    const sliderRef = useRef(null);
    const navigate = useNavigate();

    // 🔥 Fetch featured products
    useEffect(() => {
        console.log("NEW FEATURED PRODUCTS CODE RUNNING");

        axios
            .get("https://project-vlbr.onrender.com/featured-products")
            .then((res) => {
                console.log(res.data);
                setProducts(res.data);
            })
            .catch(console.error);
    }, []);

    // 🔄 Auto slide
    useEffect(() => {
        const interval = setInterval(() => {
            if (sliderRef.current) {
                sliderRef.current.scrollLeft += 250;

                // loop back
                if (
                    sliderRef.current.scrollLeft + sliderRef.current.clientWidth >=
                    sliderRef.current.scrollWidth
                ) {
                    sliderRef.current.scrollLeft = 0;
                }
            }
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    // ⭐ Rating stars
    const renderStars = (rating = 0) => {
        return "⭐".repeat(Math.floor(rating));
    };

    // ⏳ Loading state
    if (products.length === 0) {
        return <h3 style={{ padding: "20px" }}>Loading featured products...</h3>;
    }

    return (
        <div className="featured-wrapper">
            <h2>🔥 Trending Electronics</h2>

            <div className="creative-slider" ref={sliderRef}>
                {products.map((p) => (
                    <div
                        className="creative-card"
                        key={p._id}
                        onClick={() => navigate(`/product/${p._id}`)}
                    >
                        {/* 🏷 Discount badge */}
                        <span className="badge">
                            {p.discount_percentage || 20}% OFF
                        </span>

                        {/* 🖼 Image */}
                        <img
                            src={p.product_image_url || "https://via.placeholder.com/150"}
                            alt="product"
                        />

                        {/* 📝 Title */}
                        <h4>{p.product_title}</h4>

                        {/* ⭐ Rating */}
                        <div className="rating">
                            {renderStars(p.product_rating)} ({p.product_rating || 0})
                        </div>

                        {/* 💰 Price */}
                        <p className="price">₹{p.discounted_price}</p>

                        {/* 🛒 Button */}
                        <button
                            onClick={() => {
                                const userId = localStorage.getItem("userId");

                                if (!userId) {
                                    alert("Please login first");
                                    return;
                                }

                                axios.post("https://project-vlbr.onrender.com/add-to-cart", {
                                    userId,
                                    product: p
                                })
                                    .then(res => alert(res.data))
                                    .catch(err => console.log(err));
                            }}
                        >
                            Add to Cart
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default FeaturedProducts;