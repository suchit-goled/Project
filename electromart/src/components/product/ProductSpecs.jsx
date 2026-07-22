import "./ProductSpecs.css";
const ProductSpecs = ({ product }) => {
    return (
        <section className="specs">

            <h2>Specifications</h2>

            <div className="spec-row">
                <span>Category</span>
                <strong>{product.product_category}</strong>
            </div>

            <div className="spec-row">
                <span>Rating</span>
                <strong>{product.product_rating}</strong>
            </div>

            <div className="spec-row">
                <span>Total Reviews</span>
                <strong>{product.total_reviews.toLocaleString()}</strong>
            </div>

            <div className="spec-row">
                <span>Discount</span>
                <strong>{product.discount_percentage}%</strong>
            </div>

            <div className="spec-row">
                <span>Price</span>
                <strong>
                    ₹{product.discounted_price.toLocaleString()}
                </strong>
            </div>

            <div className="spec-row">
                <span>Original Price</span>
                <strong>
                    ₹{product.original_price.toLocaleString()}
                </strong>
            </div>

        </section>
    );
};

export default ProductSpecs;