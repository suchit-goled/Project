import React from "react";
import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import "./PromotionalBanners.css";

const PromotionalBanners = () => {
  return (
    <section className="editorial-spreads" aria-label="Featured equipment departments">
      <div className="catalog-container editorial-spreads__grid">
        {/* Feature 1: Optical & Rangefinder Cameras */}
        <article className="editorial-feature">
          <div className="editorial-feature__media">
            <img
              src="/media/design/editorial-camera.webp"
              alt="Silver and matte black mirrorless rangefinder camera on warm alabaster surface"
              loading="lazy"
            />
          </div>
          <div className="editorial-feature__copy">
            <span className="editorial-feature__kicker">Optics &amp; Imaging</span>
            <h2 className="editorial-feature__title font-serif">
              Rangefinder &amp; Mirrorless Systems
            </h2>
            <p className="editorial-feature__desc">
              Full-frame bodies, prime lenses, and field monitors stocked by authorised imaging dealers.
            </p>
            <Link to="/products/category/cameras" className="editorial-feature__link">
              Browse Cameras <FiArrowRight size={15} />
            </Link>
          </div>
        </article>

        {/* Feature 2: Mechanical Input & Workstations */}
        <article className="editorial-feature">
          <div className="editorial-feature__media">
            <img
              src="/media/design/editorial-keyboard.webp"
              alt="Anodized aluminum 65% mechanical keyboard with warm off-white and charcoal keycaps"
              loading="lazy"
            />
          </div>
          <div className="editorial-feature__copy">
            <span className="editorial-feature__kicker">Input &amp; Desk Gear</span>
            <h2 className="editorial-feature__title font-serif">
              Machined Keyboards &amp; Peripherals
            </h2>
            <p className="editorial-feature__desc">
              Tactile switches, hot-swappable aluminum frames, and calibrated desk accessories built for daily work.
            </p>
            <Link to="/products/search/keyboard" className="editorial-feature__link">
              Browse Keyboards <FiArrowRight size={15} />
            </Link>
          </div>
        </article>
      </div>
    </section>
  );
};

export default PromotionalBanners;
