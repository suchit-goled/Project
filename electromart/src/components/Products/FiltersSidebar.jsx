import React, { useState } from "react";
import { FiFilter, FiRotateCcw, FiCheck, FiSearch } from "react-icons/fi";
import { FaStar } from "react-icons/fa";
import "./FiltersSidebar.css";

const FiltersSidebar = ({
    categories = [],
    category = "",
    setCategory,
    brands = [],
    brand = "",
    setBrand,
    rating = 0,
    setRating,
    maxPrice = 200000,
    setMaxPrice,
    inStock = false,
    setInStock,
    minDiscount = 0,
    setMinDiscount,
    onReset,
}) => {
    const [brandSearch, setBrandSearch] = useState("");

    const filteredBrands = brands.filter((b) => {
        const name = typeof b === "string" ? b : b.name || "";
        return name.toLowerCase().includes(brandSearch.toLowerCase());
    });

    const isFiltered = category || brand || rating > 0 || maxPrice < 200000 || inStock || minDiscount > 0;

    return (
        <aside className="filters-sidebar">
            <div className="filters-header">
                <div className="filters-title">
                    <FiFilter />
                    <h3>Filter Catalogue</h3>
                </div>
                {isFiltered && (
                    <button className="reset-filters-link" onClick={onReset} title="Reset all filters">
                        <FiRotateCcw /> Reset All
                    </button>
                )}
            </div>

            {/* In-Stock Toggle */}
            <div className="filter-group in-stock-group">
                <label className="toggle-switch-label">
                    <input
                        type="checkbox"
                        checked={inStock}
                        onChange={(e) => setInStock(e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                    <span className="toggle-text">In-Stock Items Only</span>
                </label>
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
                    {categories.map((cat) => {
                        const catName = typeof cat === "string" ? cat : cat.name;
                        const isSelected = category.toLowerCase() === catName.toLowerCase();
                        return (
                            <button
                                key={catName}
                                className={`filter-category-btn ${isSelected ? "active" : ""}`}
                                onClick={() => setCategory(isSelected ? "" : catName)}
                            >
                                <span>{catName}</span>
                                {isSelected && <FiCheck className="filter-check" />}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Brands Filter */}
            {brands.length > 0 && (
                <div className="filter-group">
                    <h4>Brand</h4>
                    {brands.length > 8 && (
                        <div className="brand-search-box">
                            <FiSearch />
                            <input
                                type="text"
                                placeholder="Search brand..."
                                value={brandSearch}
                                onChange={(e) => setBrandSearch(e.target.value)}
                            />
                        </div>
                    )}
                    <div className="filter-options-list brand-list">
                        <button
                            className={`filter-category-btn ${!brand ? "active" : ""}`}
                            onClick={() => setBrand("")}
                        >
                            <span>All Brands</span>
                            {!brand && <FiCheck className="filter-check" />}
                        </button>
                        {filteredBrands.map((b) => {
                            const bName = typeof b === "string" ? b : b.name;
                            const isSelected = brand.toLowerCase() === bName.toLowerCase();
                            return (
                                <button
                                    key={bName}
                                    className={`filter-category-btn ${isSelected ? "active" : ""}`}
                                    onClick={() => setBrand(isSelected ? "" : bName)}
                                >
                                    <span>{bName}</span>
                                    {isSelected && <FiCheck className="filter-check" />}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Price Filter */}
            <div className="filter-group">
                <div className="filter-group-header">
                    <h4>Price Range</h4>
                    <span className="price-tag">Up to ₹{Number(maxPrice).toLocaleString()}</span>
                </div>
                <input
                    type="range"
                    min="500"
                    max="200000"
                    step="1000"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="price-range-slider"
                />
                <div className="price-range-labels">
                    <span>₹500</span>
                    <span>₹2,00,000</span>
                </div>
            </div>

            {/* Minimum Discount */}
            <div className="filter-group">
                <h4>Discount</h4>
                <div className="discount-pills">
                    {[
                        { label: "All", val: 0 },
                        { label: "10%+", val: 10 },
                        { label: "20%+", val: 20 },
                        { label: "30%+", val: 30 },
                        { label: "50%+", val: 50 },
                    ].map((d) => (
                        <button
                            key={d.val}
                            className={`discount-pill-btn ${minDiscount === d.val ? "active" : ""}`}
                            onClick={() => setMinDiscount(d.val)}
                        >
                            {d.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Rating Filter */}
            <div className="filter-group">
                <h4>Customer Rating</h4>
                <div className="rating-options">
                    {[
                        { label: "All Ratings", val: 0 },
                        { label: "4.5 & Above", val: 4.5 },
                        { label: "4.0 & Above", val: 4.0 },
                        { label: "3.5 & Above", val: 3.5 },
                    ].map((opt) => (
                        <label key={opt.val} className={`rating-radio-label ${rating === opt.val ? "selected" : ""}`}>
                            <input
                                type="radio"
                                name="rating-filter"
                                checked={rating === opt.val}
                                onChange={() => setRating(opt.val)}
                            />
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                                {opt.val > 0 && <FaStar color="#f59e0b" size={12} />}
                                {opt.label}
                            </span>
                        </label>
                    ))}
                </div>
            </div>
        </aside>
    );
};

export default FiltersSidebar;
