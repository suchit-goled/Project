import "./SortDropdown.css";
import { FiChevronDown } from "react-icons/fi";

const SortDropdown = ({ value, onChange, sort, setSort }) => {
    const currentValue = value || sort || "newest";
    const handleChange = (e) => {
        if (onChange) onChange(e);
        if (setSort) setSort(e.target.value);
    };

    return (
        <div className="sort-dropdown-wrapper">
            <span className="sort-label">Sort By:</span>
            <div className="sort-select-box">
                <select
                    className="sort-dropdown"
                    value={currentValue}
                    onChange={handleChange}
                    aria-label="Sort products"
                >
                    <option value="newest">Featured / Newest</option>
                    <option value="priceLow">Price: Low to High</option>
                    <option value="priceHigh">Price: High to Low</option>
                    <option value="rating">Highest Rated</option>
                    <option value="discount">Biggest Discount</option>
                </select>
                <FiChevronDown className="sort-select-arrow" />
            </div>
        </div>
    );
};

export default SortDropdown;
