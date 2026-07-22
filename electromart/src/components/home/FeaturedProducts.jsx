import "./FeaturedProducts.css";
import SectionHeader from "../common/SectionHeader";
import ProductCard from "../common/Card/ProductCard";
import useProducts from "../../hooks/useProducts";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";

const FeaturedProducts = () => {
    const { products, loading, error } = useProducts();

    const displayProducts = products.slice(0, 10);

    if (loading) {
        return (
            <section className="featured-products">
                <div className="container">
                    <p>Loading...</p>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="featured-products">
                <div className="container">
                    <p>Failed to load products.</p>
                </div>
            </section>
        );
    }

    return (
        <section className="featured-products">

            <div className="container">

                <SectionHeader
                    badge="FEATURED"
                    title="Featured Collection"
                    subtitle="Handpicked premium devices for work, creativity and entertainment."
                />

                <Swiper
                    modules={[Autoplay, Navigation]}
                    spaceBetween={24}
                    navigation
                    loop={true}
                    autoplay={{
                        delay: 2500,
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

            </div>

        </section>
    );
};

export default FeaturedProducts;