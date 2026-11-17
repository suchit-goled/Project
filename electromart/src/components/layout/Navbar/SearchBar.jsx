import React, { useState, useEffect, useRef } from "react";
import { FiSearch, FiArrowRight, FiTag, FiGrid } from "react-icons/fi";
import { useNavigate, useLocation } from "react-router-dom";
import { useSearch } from "../../../context/SearchContext";
import ProductService from "../../../services/product.service";
import "./SearchBar.css";

const SearchBar = () => {
    const { search, setSearch } = useSearch();
    const [inputValue, setInputValue] = useState(search || "");
    const [suggestions, setSuggestions] = useState({ products: [], categories: [], brands: [] });
    const [isOpen, setIsOpen] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();
    const containerRef = useRef(null);

    // Sync input value with context search
    useEffect(() => {
        setInputValue(search || "");
    }, [search]);

    // Debounced suggestion fetch
    useEffect(() => {
        if (!inputValue || inputValue.trim().length < 2) {
            setSuggestions({ products: [], categories: [], brands: [] });
            setIsOpen(false);
            return;
        }

        const timer = setTimeout(async () => {
            try {
                const data = await ProductService.getSuggestions(inputValue.trim());
                if (data && (data.products?.length || data.categories?.length || data.brands?.length)) {
                    setSuggestions(data);
                    setIsOpen(true);
                } else {
                    setIsOpen(false);
                }
            } catch {
                setIsOpen(false);
            }
        }, 220);

        return () => clearTimeout(timer);
    }, [inputValue]);

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Close on route navigation
    useEffect(() => {
        setIsOpen(false);
    }, [location.pathname]);

    const handleChange = (e) => {
        setInputValue(e.target.value);
    };

    const handleSearchSubmit = (e) => {
        if (e) e.preventDefault();
        setIsOpen(false);
        const query = inputValue.trim();
        setSearch(query);
        navigate(`/products?search=${encodeURIComponent(query)}`);
    };

    const handleSelectProduct = (productId) => {
        setIsOpen(false);
        navigate(`/products/${productId}`);
    };

    const handleSelectCategory = (catName) => {
        setIsOpen(false);
        setSearch("");
        setInputValue("");
        navigate(`/products?category=${encodeURIComponent(catName)}`);
    };

    const handleSelectBrand = (brandName) => {
        setIsOpen(false);
        setSearch("");
        setInputValue("");
        navigate(`/products?brand=${encodeURIComponent(brandName)}`);
    };

    const hasResults =
        suggestions.products.length > 0 ||
        suggestions.categories.length > 0 ||
        suggestions.brands.length > 0;

    return (
        <div className="search-bar-container" ref={containerRef}>
            <form className="search-bar" onSubmit={handleSearchSubmit}>
                <FiSearch className="search-icon" />
                <input
                    type="text"
                    placeholder="Search 250+ electronics, brands, specs..."
                    value={inputValue}
                    onChange={handleChange}
                    onFocus={() => {
                        if (hasResults && inputValue.length >= 2) setIsOpen(true);
                    }}
                    onKeyDown={(e) => {
                        if (e.key === "Escape") setIsOpen(false);
                    }}
                    aria-label="Search electronics products"
                />
                {inputValue && (
                    <button
                        type="button"
                        className="clear-search-btn"
                        onClick={() => {
                            setInputValue("");
                            setSearch("");
                            setIsOpen(false);
                        }}
                    >
                        ✕
                    </button>
                )}
                <button type="submit" className="search-submit-btn" aria-label="Submit search">
                    Search
                </button>
            </form>

            {/* Live Autocomplete Dropdown */}
            {isOpen && hasResults && (
                <div className="search-suggestions-dropdown">
                    {/* Products */}
                    {suggestions.products.length > 0 && (
                        <div className="suggestion-section">
                            <div className="suggestion-heading">Products</div>
                            {suggestions.products.map((p) => (
                                <div
                                    key={p._id}
                                    className="suggestion-item product-suggestion"
                                    onClick={() => handleSelectProduct(p._id)}
                                >
                                    <img
                                        src={p.product_image_url}
                                        alt={p.product_title}
                                        className="suggestion-thumb"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=80";
                                        }}
                                    />
                                    <div className="suggestion-info">
                                        <div className="suggestion-title">{p.product_title}</div>
                                        <div className="suggestion-meta">
                                            <span className="suggestion-price">
                                                ₹{(p.discounted_price || 0).toLocaleString("en-IN")}
                                            </span>
                                            {p.discount_percentage > 0 && (
                                                <span className="suggestion-badge">{p.discount_percentage}% OFF</span>
                                            )}
                                            {p.brand && <span className="suggestion-brand">by {p.brand}</span>}
                                        </div>
                                    </div>
                                    <FiArrowRight className="suggestion-arrow" />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Categories & Brands */}
                    {(suggestions.categories.length > 0 || suggestions.brands.length > 0) && (
                        <div className="suggestion-tags-row">
                            {suggestions.categories.length > 0 && (
                                <div className="suggestion-tags-group">
                                    <div className="suggestion-heading">Categories</div>
                                    <div className="tags-list">
                                        {suggestions.categories.map((c) => (
                                            <button
                                                key={c.slug}
                                                type="button"
                                                className="suggestion-tag"
                                                onClick={() => handleSelectCategory(c.name)}
                                            >
                                                <FiGrid className="tag-icon" />
                                                <span>{c.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {suggestions.brands.length > 0 && (
                                <div className="suggestion-tags-group">
                                    <div className="suggestion-heading">Brands</div>
                                    <div className="tags-list">
                                        {suggestions.brands.map((b) => (
                                            <button
                                                key={b.slug}
                                                type="button"
                                                className="suggestion-tag brand-tag"
                                                onClick={() => handleSelectBrand(b.name)}
                                            >
                                                <FiTag className="tag-icon" />
                                                <span>{b.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="suggestion-footer">
                        <button
                            type="button"
                            className="see-all-results-btn"
                            onClick={handleSearchSubmit}
                        >
                            View all results for "{inputValue}" <FiArrowRight />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchBar;
