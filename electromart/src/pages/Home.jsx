import Hero from "../components/home/Hero/Hero";
import BrandStrip from "../components/home/BandStrip/BrandStrip";
import FeaturedProducts from "../components/home/FeaturedProducts";
import Footer from "../components/layout/Footer";

const Home = () => {
  return (
    <main>
      <Hero />
      <BrandStrip />
      <FeaturedProducts />
      <Footer/>
      
    </main>
  );
};

export default Home;