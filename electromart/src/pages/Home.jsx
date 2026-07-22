import Hero from "../components/home/Hero/Hero";
import BrandStrip from "../components/home/BandStrip/BrandStrip";
import FeaturedProducts from "../components/home/FeaturedProducts";

const Home = () => {
  return (
    <main>
      <Hero />
      <BrandStrip />
      <FeaturedProducts />
    </main>
  );
};

export default Home;