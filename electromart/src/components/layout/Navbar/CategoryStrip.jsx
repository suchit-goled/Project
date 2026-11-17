import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { FiGrid, FiZap } from "react-icons/fi";
import ProductService from "../../../services/product.service";
import "./CategoryStrip.css";

const DEFAULT_CATEGORIES = [
    "Smartphones",
    "Laptops",
    "Tablets",
    "Smartwatches",
    "Headphones",
    "Speakers",
    "Cameras",
    "Gaming Accessories",
    "Computer Accessories",
    "Home Electronics",
    "Mobile Accessories",
    "Televisions",
];

const CategoryStrip = () => {
    const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
    const location = useLocation();

    useEffect(() => {
        let isMounted = true;
        const loadCategories = async () => {
            try {
                const cats = await ProductService.getCategories();
                if (isMounted && cats && cats.length > 0) {
                    setCategories(cats);
                }
            } catch (e) {
                // Keep default
            }
        };
        loadCategories();
        return () => { isMounted = false; };
    }, []);

    const searchParams = new URLSearchParams(location.search);
    const activeCategory = searchParams.get("category");

    return (
        <nav className="category-strip" aria-label="Marketplace category navigation">
            <div className="container category-strip__container">
                <Link
                    to="/products"
                    className={`category-strip__link all-link ${location.pathname === "/products" && !activeCategory ? "active" : ""}`}
                >
                    <FiGrid className="strip-icon" />
                    <span>All Products</span>
                </Link>

                <div className="category-strip__scrollable">
                    {categories.slice(0, 10).map((cat) => (
                        <Link
                            key={cat}
                            to={`/products?category=${encodeURIComponent(cat)}`}
                            className={`category-strip__link ${activeCategory === cat ? "active" : ""}`}
                        >
                            {cat}
                        </Link>
                    ))}
                </div>

                <div className="category-strip__right-deals">
                    <Link to="/deals" className="deals-pill-link">
                        <FiZap className="zap-icon" />
                        <span>Today's Deals</span>
                    </Link>
                </div>
            </div>
        </nav>
    );
};

export default CategoryStrip;
