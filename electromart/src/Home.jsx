import React from "react";
import Categories from "./Categories";
import Hero from "./Hero";
import Footer from "./Footer";
import FeaturedProducts from "./FeaturedProducts";

function Home() {
  return (
    <div>
      <Hero/>
      <FeaturedProducts />
     <Categories/>
     <Footer /> 
    </div>
  );
}

export default Home;