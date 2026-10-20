import React from "react";
import ProductCard from "../common/Card/ProductCard";
import ProductSkeleton from "../common/Skeleton/ProductSkeleton";
import Pagination from "./Pagination";
import { FiX, FiInbox, FiRefreshCw } from "react-icons/fi";
import "./ProductGrid.css";

const ProductGrid = ({
    products = [],
    loading = false,
    error = "",
    page = 1,
    totalPages = 1,
    setPage,
    category = "",
    setCategory,
    rating = 0,
    setRating,
    maxPrice = 200000,
    setMaxPrice,
    search = "",
    setSearch,
    onReset,
    onRetry,
}) => {
    const hasActiveFilters = Boolean(
        category || rating > 0 || maxPrice < 200000 || (search && search.trim())
    );

    return (
        <div className="product-grid-container">
            {/* Active filter chips */}
            {hasActiveFilters && (
                <div className="active-filters-bar">
                    <span className="active-filters-label">Active Filters:</span>
                    <div className="active-chips">
                        {category && (
                            <span className="filter-chip">
                                Category: {category}
                                <button onClick={() => setCategory("")} aria-label="Remove category filter">
                                    <FiX />
                                </button>
                            </span>
                        )}
                        {maxPrice < 200000 && (
                            <span className="filter-chip">
                                Under ₹{maxPrice.toLocaleString()}
                                <button onClick={() => setMaxPrice(200000)} aria-label="Remove price filter">
                                    <FiX />
                                </button>
                            </span>
                        )}
                        {rating > 0 && (
                            <span className="filter-chip">
                                {rating}★ & Above
                                <button onClick={() => setRating(0)} aria-label="Remove rating filter">
                                    <FiX />
                                </button>
                            </span>
                        )}
                        {search && search.trim() && (
                            <span className="filter-chip">
                                Query: "{search}"
                                <button onClick={() => setSearch && setSearch("")} aria-label="Clear search">
                                    <FiX />
                                </button>
                            </span>
                        )}
                        <button className="clear-all-chips-btn" onClick={onReset}>
                            Clear All
                        </button>
                    </div>
                </div>
            )}

            {/* Main content states */}
            {loading ? (
                <div className="product-cards-grid">
                    {Array.from({ length: 8 }).map((_, index) => (
                        <ProductSkeleton key={index} />
                    ))}
                </div>
            ) : error ? (
                <div className="product-grid-error">
                    <p>{error}</p>
                    <button className="retry-btn" onClick={onRetry}>
                        <FiRefreshCw /> Try Again
                    </button>
                </div>
            ) : products.length === 0 ? (
                <div className="product-grid-empty">
                    <FiInbox className="empty-catalogue-icon" />
                    <h3>No products found</h3>
                    <p>
                        We couldn't find any products matching your selected criteria. Try adjusting your filters or search keywords.
                    </p>
                    {hasActiveFilters && (
                        <button className="reset-empty-btn" onClick={onReset}>
                            Reset All Filters
                        </button>
                    )}
                </div>
            ) : (
                <>
                    <div className="product-cards-grid">
                        {products.map((product) => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>

                    <Pagination
                        page={page}
                        totalPages={totalPages}
                        setPage={setPage}
                    />
                </>
            )}
        </div>
    );
};

export default ProductGrid;
