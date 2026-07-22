import "./SearchBar.css";
import { FaSearch } from "react-icons/fa";

const SearchBar = ({ value, onChange }) => {

    return (

        <div className="search-bar">

            <FaSearch className="search-icon"/>

            <input
                type="text"
                placeholder="Search products..."
                value={value}
                onChange={onChange}
            />

        </div>

    );

};

export default SearchBar;