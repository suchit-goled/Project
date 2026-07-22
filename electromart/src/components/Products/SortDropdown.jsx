import "./SortDropdown.css";

const SortDropdown = ({ value, onChange }) => {

    return (

        <select
            className="sort-dropdown"
            value={value}
            onChange={onChange}
        >

            <option value="newest">
                Newest
            </option>

            <option value="low">
                Price: Low to High
            </option>

            <option value="high">
                Price: High to Low
            </option>

            <option value="rating">
                Top Rated
            </option>

        </select>

    );

};

export default SortDropdown;