import React from "react";
import SortDropdown from "./SortDropdown";
import { FiFilter } from "react-icons/fi";
import "./ProductsHeader.css";

const ProductsHeader = ({
    total = 0,
    sort = "newest",
    setSort,
    onToggleMobileFilters,
    category = "",
    search = ""
}) => {
    return (
        <div className="products-header">
            <div className="products-header__left">
                <div className="products-header__title-row">
                    <h2>
                        {category ? `${category}` : search ? `Search: "${search}"` : "All Products"}
                    </h2>
                    <span className="products-count-badge">
                        {total.toLocaleString()} {total === 1 ? "Product" : "Products"}
                    </span>
                </div>
                <p className="products-header__subtitle">
                    Verified electronic devices with manufacturer warranty and fast express delivery.
                </p>
            </div>

            <div className="products-header__right">
                <button
                    className="mobile-filter-trigger"
                    onClick={onToggleMobileFilters}
                    aria-label="Open filter options"
                >
                    <FiFilter />
                    <span>Filters</span>
                </button>

                <SortDropdown
                    sort={sort}
                    setSort={setSort}
                />
            </div>
        </div>
    );
};

export default ProductsHeader;
