const ProductInfo = ({ product }) => {

    return (

        <>

            <span className="category">

                {product.product_category}

            </span>

            <h1>

                {product.product_title}

            </h1>

            <div className="rating">

                ⭐ {product.product_rating}

                ({product.total_reviews.toLocaleString()} Reviews)

            </div>

            <div className="price">

                <span className="new-price">

                    ₹{product.discounted_price.toLocaleString()}

                </span>

                <span className="old-price">

                    ₹{product.original_price.toLocaleString()}

                </span>

            </div>

        </>

    );

};

export default ProductInfo;