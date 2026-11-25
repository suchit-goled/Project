import React from "react";
import { Link } from "react-router-dom";

const Logo = ({ size = "md", showSubtitle = false, className = "" }) => {
    return (
        <Link to="/" className={`logo logo--${size} ${className}`} aria-label="ElectroNova Home">
            <div className="logo__mark" aria-hidden="true">
                <svg
                    width="28"
                    height="28"
                    viewBox="0 0 28 28"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="logo__svg"
                >
                    <rect width="28" height="28" rx="3" fill="#161614" />
                    <path
                        d="M7 9.5H21M7 14H15.5M7 18.5H21"
                        stroke="#F7F4EE"
                        strokeWidth="1.75"
                        strokeLinecap="square"
                    />
                    <circle cx="19.5" cy="14" r="2.25" fill="#C84B1E" />
                </svg>
            </div>

            <div className="logo__text-group">
                <span className="logo__text">
                    Electro<span className="logo__accent">Nova</span>
                </span>
                {showSubtitle && <span className="logo__sub">EQUIPMENT CATALOG</span>}
            </div>
        </Link>
    );
};

export default Logo;
