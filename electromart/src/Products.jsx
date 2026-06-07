import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

function Products() {
  const { category, key } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    let url = "http://localhost:8000/products";

    if (category) {
      url = `http://localhost:8000/products/category/${category}`;
    }

    if (key) {
      url = `http://localhost:8000/products/search/${key}`;
    }

    axios.get(url)
      .then((res) => {
        setProducts(res.data.data || res.data);
      })
      .catch((err) => console.log(err));

  }, [category, key]);

  return (
    <div className="products-page">
      <h2>
        {category ? `${category} Products` : "All Products"}
      </h2>

      <div className="product-grid">
        {products.map((p) => (
          <div
            key={p._id}
            className="product-card"
            onClick={() => navigate(`/product/${p._id}`)} // ✅ navigate
          >
            <img src={p.product_image_url} alt="" />
            <p>{p.product_title}</p>
            <p>₹{p.discounted_price}</p>

            <button
              onClick={(e) => {
                e.stopPropagation(); // ✅ prevent card click

                const userId = localStorage.getItem("userId");

                if (!userId) {
                  alert("Please login first");
                  return;
                }

                axios.post("http://localhost:8000/add-to-cart", {
                  userId,
                  product: p
                })
                  .then(res => alert(res.data))
                  .catch(err => console.log(err));
              }}
            >
              Add to Cart
            </button>

          </div>
        ))}
      </div>
    </div>
  );
}

export default Products;