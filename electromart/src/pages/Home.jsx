import React from "react";
import Hero from "../components/home/Hero/Hero";
import PromotionalBanners from "../components/home/PromotionalBanners";
import TodaysDeals from "../components/home/TodaysDeals";
import BrandStrip from "../components/home/BandStrip/BrandStrip";
import Categories from "../components/home/Categories";
import FeaturedProducts from "../components/home/FeaturedProducts";
import TopSellersSection from "../components/home/TopSellersSection";
import RecentlyViewed from "../components/home/RecentlyViewed";
import TrustSection from "../components/home/TrustSection";

const Home = () => {
  return (
    <main className="home-main">
      <Hero />
      <PromotionalBanners />
      <TodaysDeals />
      <BrandStrip />
      <Categories />
      <FeaturedProducts />
      <TopSellersSection />
      <RecentlyViewed />
      <TrustSection />
    </main>
  );
};

export default Home;
