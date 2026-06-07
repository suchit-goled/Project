import React from "react";
import { useNavigate } from "react-router-dom";

function Hero() {

    const navigate = useNavigate();
    return (
        <div className="hero">

            <p className="tag">⚡ Next-Gen Electronics</p>

            <h1>
                Tech that <span>powers</span> your life.
            </h1>

            <p className="subtitle">
                Discover the latest gadgets, smart devices, and accessories
                designed for everyday brilliance.
            </p>

            <div className="hero-buttons">
                <button
                    className="btn-primary"
                    onClick={() => {
                        navigate("/products");
                        window.scrollTo(0, 0);
                    }}
                >
                    Shop Now →
                </button>
                <button
                    className="btn-secondary"
                    onClick={() => window.location.href = "#categories"}
                >
                    Browse Categories
                </button>
            </div>

            <div className="hero-features">
                <div>🚚 Free shipping</div>
                <div>🛡 2-year warranty</div>
                <div>⚡ Latest tech</div>
            </div>

        </div>
    );
}

export default Hero;