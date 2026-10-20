import "./Hero.css";
import { useNavigate } from "react-router-dom";
import { FiArrowRight, FiTag, FiShield, FiTruck, FiAward } from "react-icons/fi";

import macbook from "../../../assets/products/macbook.png";
import iphone from "../../../assets/products/iphone.png";
import watch from "../../../assets/products/watch.png";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="hero">
      <div className="hero-bg-circle hero-bg-circle-1"></div>
      <div className="hero-bg-circle hero-bg-circle-2"></div>

      <div className="container hero__container">
        {/* LEFT */}
        <div className="hero__left">
          <span className="hero__badge">
            ⚡ Engineered for Performance
          </span>

          <h1 className="hero__title">
            Upgrade Your <br />
            <span className="hero__title-gradient">Tech Experience</span>
          </h1>

          <p className="hero__description">
            Discover curated smartphones, high-performance laptops, noise-cancelling audio, and smart devices from the world's leading brands. 100% genuine products with official manufacturer warranty.
          </p>

          <div className="hero__buttons">
            <button
              className="hero__btn-primary"
              onClick={() => navigate("/products")}
            >
              <span>Explore Catalogue</span>
              <FiArrowRight />
            </button>

            <button
              className="hero__btn-secondary"
              onClick={() => navigate("/deals")}
            >
              <FiTag />
              <span>Limited Flash Deals</span>
            </button>
          </div>

          <div className="hero__stats">
            <div className="stat-card">
              <div className="stat-icon"><FiAward /></div>
              <div>
                <h3>8,800+</h3>
                <span>Curated Products</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon"><FiShield /></div>
              <div>
                <h3>100%</h3>
                <span>Genuine Warranty</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon"><FiTruck /></div>
              <div>
                <h3>2–4 Days</h3>
                <span>Express Delivery</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="hero__right">
          <div className="showcase">
            <img
              src={macbook}
              alt="MacBook Pro"
              className="hero-image macbook"
            />
            <img
              src={iphone}
              alt="iPhone Flagship"
              className="hero-image iphone"
            />
            <img
              src={watch}
              alt="Smart Watch"
              className="hero-image watch"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
