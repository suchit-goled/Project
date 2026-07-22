import "./ProductsHeader.css";
import SortDropdown from "./SortDropdown";

const ProductsHeader = ({
    sort,
    setSort,
}) => {

    return (

        <div className="products-header">

            <div>
                <h2>All Products</h2>
            </div>

            <SortDropdown
                sort={sort}
                setSort={setSort}
            />

        </div>

    );

};

export default ProductsHeader;