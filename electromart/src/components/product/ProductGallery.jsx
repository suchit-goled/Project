import "./ProductGallery.css";

const ProductGallery = ({ product }) => {
    return (
        <div className="product-gallery">

            <div className="gallery-main">

                <img
                    src={product.product_image_url}
                    alt={product.product_title}
                />

            </div>

        </div>
    );
};

export default ProductGallery;