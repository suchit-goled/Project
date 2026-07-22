import ProductCard from "../common/Card/ProductCard";
import ProductSkeleton from "../common/Skeleton/ProductSkeleton";
import "./ProductGrid.css";
import Pagination from "./Pagination";


const ProductGrid = ({
    products = [],
    loading,
    error,
    search = "",
    sort = "newest",
    category = "",
    rating = 0,
    maxPrice = Infinity,
    page,
totalPages,
setPage,
}) => {

    const filteredProducts = products.filter((product) => {

        const matchesSearch =
            product.product_title
                ?.toLowerCase()
                .includes(search.toLowerCase());

        const matchesCategory =
            !category ||
            product.product_category === category;

        const matchesRating =
            Number(product.product_rating) >= Number(rating);

        const matchesPrice =
            Number(product.discounted_price) <= Number(maxPrice);

        return (
            matchesSearch &&
            matchesCategory &&
            matchesRating &&
            matchesPrice
        );
    });

    const sortedProducts = [...filteredProducts];

    switch (sort) {

        case "low":
            sortedProducts.sort(
                (a, b) =>
                    Number(a.discounted_price) -
                    Number(b.discounted_price)
            );
            break;

        case "high":
            sortedProducts.sort(
                (a, b) =>
                    Number(b.discounted_price) -
                    Number(a.discounted_price)
            );
            break;

        case "rating":
            sortedProducts.sort(
                (a, b) =>
                    Number(b.product_rating) -
                    Number(a.product_rating)
            );
            break;

        default:
            break;
    }

    if (loading) {
        return (
            <div className="product-grid">
                {[...Array(8)].map((_, index) => (
                    <ProductSkeleton key={index} />
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-state">
                <h2>{error}</h2>
            </div>
        );
    }

    if (sortedProducts.length === 0) {
        return (
            <div className="empty-state">
                <h2>No Products Found</h2>
                <p>Try changing your filters.</p>
            </div>
        );
    }

    return (

<>

<div className="product-grid">

{sortedProducts.map((product)=>(

<ProductCard

key={product._id}

product={product}

/>

))}

</div>

<Pagination

page={page}

totalPages={totalPages}

setPage={setPage}

/>

</>

);
};

export default ProductGrid;