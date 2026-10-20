import React from "react";
import { FiFilter, FiRotateCcw, FiCheck } from "react-icons/fi";
import "./FiltersSidebar.css";

const FiltersSidebar = ({
    categories = [],
    category = "",
    setCategory,
    rating = 0,
    setRating,
    maxPrice = 200000,
    setMaxPrice,
    onReset,
}) => {
    return (
        <aside className="filters-sidebar">
            <div className="filters-header">
                <div className="filters-title">
                    <FiFilter />
                    <h3>Filter Catalogue</h3>
                </div>
                {(category || rating > 0 || maxPrice < 200000) && (
                    <button className="reset-filters-link" onClick={onReset} title="Reset all filters">
                        <FiRotateCcw /> Reset
                    </button>
                )}
            </div>

            {/* Categories */}
            <div className="filter-group">
                <h4>Category</h4>
                <div className="filter-options-list">
                    <button
                        className={`filter-category-btn ${!category ? "active" : ""}`}
                        onClick={() => setCategory("")}
                    >
                        <span>All Categories</span>
                        {!category && <FiCheck className="filter-check" />}
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            className={`filter-category-btn ${category.toLowerCase() === cat.toLowerCase() ? "active" : ""}`}
                            onClick={() => setCategory(category.toLowerCase() === cat.toLowerCase() ? "" : cat)}
                        >
                            <span>{cat}</span>
                            {category.toLowerCase() === cat.toLowerCase() && <FiCheck className="filter-check" />}
                        </button>
                    ))}
                </div>
            </div>

            {/* Price Filter */}
            <div className="filter-group">
                <div className="filter-group-header">
                    <h4>Max Price</h4>
                    <span className="price-tag">₹{maxPrice.toLocaleString()}</span>
                </div>
                <input
                    type="range"
                    min="500"
                    max="200000"
                    step="2500"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="price-range-slider"
                />
                <div className="price-range-labels">
                    <span>₹500</span>
                    <span>₹2,00,000</span>
                </div>
            </div>

            {/* Rating Filter */}
            <div className="filter-group">
                <h4>Customer Rating</h4>
                <div className="rating-options">
                    {[
                        { label: "All Ratings", val: 0 },
                        { label: "4.5★ & Above", val: 4.5 },
                        { label: "4.0★ & Above", val: 4.0 },
                        { label: "3.5★ & Above", val: 3.5 },
                    ].map((opt) => (
                        <label key={opt.val} className={`rating-radio-label ${rating === opt.val ? "selected" : ""}`}>
                            <input
                                type="radio"
                                name="rating-filter"
                                checked={rating === opt.val}
                                onChange={() => setRating(opt.val)}
                            />
                            <span>{opt.label}</span>
                        </label>
                    ))}
                </div>
            </div>
        </aside>
    );
};

export default FiltersSidebar;
