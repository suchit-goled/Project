import "./FiltersSidebar.css";

const categories = [
    "Smartphones",
    "Laptops",
    "Headphones",
    "Watches",
];

const FiltersSidebar = ({
    categories,

    category,
    setCategory,

    rating,
    setRating,

    maxPrice,
    setMaxPrice,
}) => {
    return (
        <aside className="filters-sidebar">

            <h2>Filters</h2>

            <div className="filter-section">

                <h3>Categories</h3>

                {categories.map((item) => (

    <label key={item}>

        <input

            type="radio"

            checked={category === item}

            onChange={() => setCategory(item)}

        />

        {item}

    </label>

))}
            </div>

            <div className="filter-section">

                <h3>Maximum Price</h3>

                <input
                    type="range"
                    min="0"
                    max="200000"
                    value={maxPrice}
                    onChange={(e) =>
                        setMaxPrice(Number(e.target.value))
                    }
                />

                <p>₹ {maxPrice.toLocaleString()}</p>

            </div>

            <div className="filter-section">

                <h3>Minimum Rating</h3>

                <select
                    value={rating}
                    onChange={(e) =>
                        setRating(Number(e.target.value))
                    }
                >
                    <option value="0">All</option>
                    <option value="4">4★ & Above</option>
                    <option value="3">3★ & Above</option>
                    <option value="2">2★ & Above</option>
                </select>

            </div>

            <button
                className="clear-btn"
                onClick={() => {
                    setCategory("");
                    setRating(0);
                    setMaxPrice(200000);
                }}
            >
                Clear Filters
            </button>

        </aside>
    );
};

export default FiltersSidebar;