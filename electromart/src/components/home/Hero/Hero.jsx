import "./Hero.css";
import { useNavigate } from "react-router-dom";

import macbook from "../../../assets/products/macbook.png";
import iphone from "../../../assets/products/iphone.png";
import watch from "../../../assets/products/watch.png";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="hero">

      <div className="hero-bg-circle hero-bg-circle-1"></div>
      <div className="hero-bg-circle hero-bg-circle-2"></div>

      <div className="hero__container">

        {/* LEFT */}

        <div className="hero__left">

          <span className="hero__badge">
            ⚡ Premium Electronics Store
          </span>

          <h1>
            Upgrade Your
            <br />
            Tech Experience
          </h1>

          <h2>
            Built for
            <br />
            Everyday Excellence
          </h2>

          <p>
            Discover premium laptops, smartphones, smartwatches and
            accessories from the world's leading brands with lightning
            fast delivery and secure shopping.
          </p>

          <div className="hero__buttons">

            <button
              className="primary"
              onClick={() => navigate("/products")}
            >
              Shop Now
            </button>

            <button
              className="secondary"
              onClick={() => navigate("/products")}
            >
              Explore
            </button>

          </div>

          <div className="hero__stats">

            <div className="stat-card">
              <h3>50K+</h3>
              <span>Happy Customers</span>
            </div>

            <div className="stat-card">
              <h3>2K+</h3>
              <span>Premium Products</span>
            </div>

            <div className="stat-card">
              <h3>24/7</h3>
              <span>Support</span>
            </div>

          </div>

        </div>

        {/* RIGHT */}

        <div className="hero__right">

          <div className="showcase">

            <img
              src={macbook}
              alt="MacBook"
              className="hero-image macbook"
            />

            <img
              src={iphone}
              alt="iPhone"
              className="hero-image iphone"
            />

            <img
              src={watch}
              alt="Apple Watch"
              className="hero-image watch"
            />

          </div>

        </div>

      </div>

    </section>
  );
};

export default Hero;