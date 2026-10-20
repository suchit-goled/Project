import "./FeaturedProducts.css";
import SectionHeader from "../common/SectionHeader";
import ProductCard from "../common/Card/ProductCard";
import ProductSkeleton from "../common/Skeleton/ProductSkeleton";
import useProducts from "../../hooks/useProducts";
import { useNavigate } from "react-router-dom";
import { FiArrowRight, FiRefreshCw } from "react-icons/fi";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";

const FeaturedProducts = () => {
    const { products, loading, error } = useProducts();
    const navigate = useNavigate();

    const displayProducts = products.slice(0, 10);

    return (
        <section className="featured-products">
            <div className="container">
                <div className="featured-products__header-row">
                    <SectionHeader
                        badge="CURATED PICKS"
                        title="Featured Flagships & Bestsellers"
                        subtitle="Handpicked high-performance devices for work, creative mastery, and everyday entertainment."
                    />
                    <button
                        className="featured-view-all-btn"
                        onClick={() => navigate("/products")}
                    >
                        <span>View All Products</span>
                        <FiArrowRight />
                    </button>
                </div>

                {loading ? (
                    <div className="featured-skeletons-grid">
                        {Array.from({ length: 4 }).map((_, index) => (
                            <ProductSkeleton key={index} />
                        ))}
                    </div>
                ) : error ? (
                    <div className="featured-error-state">
                        <p>Unable to load featured collection at this moment.</p>
                        <button
                            className="retry-btn"
                            onClick={() => window.location.reload()}
                        >
                            <FiRefreshCw /> Retry
                        </button>
                    </div>
                ) : displayProducts.length === 0 ? (
                    <div className="featured-empty-state">
                        <p>No featured products found.</p>
                    </div>
                ) : (
                    <Swiper
                        modules={[Autoplay, Navigation]}
                        spaceBetween={24}
                        navigation
                        loop={displayProducts.length > 4}
                        autoplay={{
                            delay: 3500,
                            disableOnInteraction: false,
                        }}
                        breakpoints={{
                            320: {
                                slidesPerView: 1,
                            },
                            640: {
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
                        {displayProducts.map((product) => (
                            <SwiperSlide key={product._id}>
                                <ProductCard product={product} />
                            </SwiperSlide>
                        ))}
                    </Swiper>
                )}
            </div>
        </section>
    );
};

export default FeaturedProducts;
