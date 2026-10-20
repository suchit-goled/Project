import React from "react";
import Hero from "../components/home/Hero/Hero";
import BrandStrip from "../components/home/BandStrip/BrandStrip";
import Categories from "../components/home/Categories";
import FeaturedProducts from "../components/home/FeaturedProducts";
import TrustSection from "../components/home/TrustSection";

const Home = () => {
  return (
    <main className="home-main">
      <Hero />
      <BrandStrip />
      <Categories />
      <FeaturedProducts />
      <TrustSection />
    </main>
  );
};

export default Home;
