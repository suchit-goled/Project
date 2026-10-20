import React from "react";
import { useNavigate } from "react-router-dom";
import "./BrandStrip.css";

const brands = [
    { name: "Apple", query: "Apple" },
    { name: "Samsung", query: "Samsung" },
    { name: "Sony", query: "Sony" },
    { name: "Dell", query: "Dell" },
    { name: "ASUS", query: "Asus" },
    { name: "Lenovo", query: "Lenovo" },
    { name: "OnePlus", query: "OnePlus" },
    { name: "Bose", query: "Bose" },
];

const BrandStrip = () => {
    const navigate = useNavigate();

    return (
        <section className="brand-strip">
            <div className="container">
                <p className="brand-title">
                    Authorised Retail Partner for World-Class Technology
                </p>
                <div className="brand-list">
                    {brands.map((brand) => (
                        <button
                            key={brand.name}
                            className="brand-item"
                            onClick={() => navigate(`/products?search=${encodeURIComponent(brand.query)}`)}
                            title={`Browse ${brand.name} Products`}
                        >
                            {brand.name}
                        </button>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default BrandStrip;
