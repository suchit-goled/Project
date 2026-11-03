import React from "react";
import { Link } from "react-router-dom";

const Logo = ({ size = "md", showSubtitle = false, className = "" }) => {
    return (
        <Link to="/" className={`logo logo--${size} ${className}`} aria-label="ElectroNova Home">
            <div className="logo__mark">
                <svg
                    width="32"
                    height="32"
                    viewBox="0 0 32 32"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="logo__svg"
                >
                    <rect width="32" height="32" rx="8" fill="url(#logo-grad)" />
                    <path
                        d="M18.5 7L10 17.5H16L13.5 25L22 14.5H16L18.5 7Z"
                        fill="#ffffff"
                        stroke="#ffffff"
                        strokeWidth="0.5"
                        strokeLinejoin="round"
                    />
                    <defs>
                        <linearGradient id="logo-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#0284c7" />
                            <stop offset="1" stopColor="#0ea5e9" />
                        </linearGradient>
                    </defs>
                </svg>
            </div>

            <div className="logo__text-group">
                <span className="logo__text">
                    Electro<span className="logo__accent">Nova</span>
                </span>
                {showSubtitle && <span className="logo__sub">TECH STORE</span>}
            </div>
        </Link>
    );
};

export default Logo;
