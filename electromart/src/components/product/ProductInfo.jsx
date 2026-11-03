import React from "react";
import { FaStar } from "react-icons/fa";

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
                <FaStar color="#f59e0b" size={13} />
                <span>{product.product_rating ?? 0}</span>
                <span>({(product.total_reviews ?? 0).toLocaleString()} Reviews)</span>
            </div>

            <div className="price">
                <span className="new-price">
                    ₹{(product.discounted_price ?? 0).toLocaleString()}
                </span>

                <span className="old-price">
                    ₹{(product.original_price ?? 0).toLocaleString()}
                </span>
            </div>
        </>
    );
};

export default ProductInfo;
