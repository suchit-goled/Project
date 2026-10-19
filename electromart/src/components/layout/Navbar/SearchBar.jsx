import { FiSearch } from "react-icons/fi";
import { useNavigate, useLocation } from "react-router-dom";
import { useSearch } from "../../../context/SearchContext";
import "./SearchBar.css";

const SearchBar = () => {

    const { search, setSearch } = useSearch();

    const navigate = useNavigate();
    const location = useLocation();

    const handleChange = (e) => {

        setSearch(e.target.value);

        if (location.pathname !== "/products") {
            navigate("/products");
        }
    };

    return (
        <div className="search-bar">

            <FiSearch className="search-icon" />

            <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={handleChange}
            />

        </div>
    );
};

export default SearchBar;