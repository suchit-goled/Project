import "./ProductShowcase.css";

import macbook from "../../../assets/products/macbook.png";
import iphone from "../../../assets/products/iphone.png";
import watch from "../../../assets/products/watch.png";

const ProductShowcase = () => {
    return (
        <div className="showcase">

            <div className="ambient"></div>

            <img
                src={macbook}
                alt="MacBook"
                className="macbook"
            />

            <img
                src={iphone}
                alt="iPhone"
                className="iphone"
            />

            <img
                src={watch}
                alt="Apple Watch"
                className="watch"
            />

        </div>
    );
};

export default ProductShowcase;