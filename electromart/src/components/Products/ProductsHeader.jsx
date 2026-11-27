import React from "react";
import SortDropdown from "./SortDropdown";
import { FiFilter, FiGrid, FiList } from "react-icons/fi";
import "./ProductsHeader.css";

const ProductsHeader = ({
    total = 0,
    layout, onLayoutChange, filtersOpen,
    sort = "newest",
    setSort,
    onToggleMobileFilters,
    category = "",
    brand = "",
    search = ""
}) => {
    const titleText = brand
        ? `${brand} Electronics`
        : category
        ? `${category}`
        : search
        ? `Search: "${search}"`
        : "All Electronics";

    return (
        <div className="products-header">
            <div className="products-header__left">
                <div className="products-header__title-row">
                    <h1>{titleText}</h1>
                    <span className="products-count-badge">
                        {total.toLocaleString()} {total === 1 ? "Product" : "Products"}
                    </span>
                </div>
            </div>

            <div className="products-header__right">
                <button
                    className="mobile-filter-trigger"
                    onClick={onToggleMobileFilters}
                    aria-expanded={filtersOpen} aria-controls="catalog-filters"
                >
                    <FiFilter />
                    <span>Filters</span>
                </button>

                <div className="catalog-view" role="group" aria-label="Product layout">
                    {[["grid", FiGrid], ["list", FiList]].map(([mode, Icon]) => (
                        <button type="button" key={mode} aria-label={mode + " view"}
                            aria-pressed={layout === mode} onClick={() => onLayoutChange(mode)}>
                            <Icon aria-hidden="true" />
                        </button>
                    ))}
                </div>
                <SortDropdown
                    sort={sort}
                    setSort={setSort}
                />
            </div>
        </div>
    );
};

export default ProductsHeader;
