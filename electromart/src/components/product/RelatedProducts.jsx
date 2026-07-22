import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";

import "./RelatedProducts.css";

import ProductCard from "../common/Card/ProductCard";
import ProductService from "../../services/product.service";

const RelatedProducts = ({ category, currentProductId }) => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await ProductService.getProducts();

        const filtered = data.products.filter(
          (item) =>
            item.product_category === category &&
            item._id !== currentProductId
        );

        setProducts(filtered);
      } catch (err) {
        console.error(err);
      }
    };

    loadProducts();
  }, [category, currentProductId]);

  if (products.length === 0) return null;

  return (
    <section className="related-products">

      <h2>Related Products</h2>

      <Swiper
        modules={[Navigation, Autoplay]}
        navigation
        spaceBetween={25}
        slidesPerView={4}
        autoplay={{
          delay: 3000,
        }}
        breakpoints={{
          320: {
            slidesPerView: 1,
          },
          576: {
            slidesPerView: 2,
          },
          992: {
            slidesPerView: 3,
          },
          1200: {
            slidesPerView: 4,
          },
        }}
      >
        {products.map((product) => (
          <SwiperSlide key={product._id}>
            <ProductCard product={product} />
          </SwiperSlide>
        ))}
      </Swiper>

    </section>
  );
};

export default RelatedProducts;