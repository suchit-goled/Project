import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";


function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);

  useEffect(() => {
    axios.get(`https://project-vlbr.onrender.com/products/${id}`)
      .then(res => {
        setProduct(res.data);

        // fetch related products
        return axios.get(
          `https://project-vlbr.onrender.com/products/category/${res.data.product_category}`
        );
      })
      .then(res => setRelated(res.data.slice(0, 4)))
      .catch(err => console.log(err));
  }, [id]);

  // ✅ ADD TO CART (NO CONTEXT)
  const handleAddToCart = async () => {
    const userId = localStorage.getItem("userId");

    if (!userId) {
      alert("Please login first");
      return;
    }

    try {
      await axios.post("https://project-vlbr.onrender.com/add-to-cart", {
        userId,
        product
      });

      alert("Added to cart");
    } catch (err) {
      console.log(err);
    }
  };

  if (!product) return <h2>Loading...</h2>;

  return (
    <div className="product-page">

      <button className="back-btn" onClick={() => navigate(-1)}>
        ← Back
      </button>

      {/* MAIN */}
      <div className="product-container">

        <div className="product-image">
          <img src={product.product_image_url} alt="" />
        </div>

        <div className="product-info">
          <h2>{product.product_title}</h2>

          <p className="category">{product.product_category}</p>

          <p className="rating">⭐ {product.product_rating}</p>

          <h3 className="price">₹{product.discounted_price}</h3>

          <p className="reviews">{product.total_reviews} reviews</p>

          <p className="desc">
            High-quality product with great performance and reliability.
          </p>

          <button className="cart-btn" onClick={handleAddToCart}>
            Add to Cart
          </button>

          <button className="buy-btn">Buy Now</button>
        </div>
      </div>

      {/* RELATED PRODUCTS */}
      <h3 className="related-title">Related Products</h3>

      <div className="related-grid">
        {related.map((item) => (
          <div
            key={item._id}
            className="related-card"
            onClick={() => navigate(`/product/${item._id}`)}
          >
            <img src={item.product_image_url} alt="" />
            <p>{item.product_title}</p>
            <span>₹{item.discounted_price}</span>
          </div>
        ))}
      </div>

    </div>
  );
}

export default ProductDetails;