import "./BrandStrip.css";

const brands = [
    "Apple",
    "Samsung",
    "Sony",
    "Dell",
    "ASUS",
    "Lenovo",
];

const BrandStrip = () => {
    return (
        <section className="brand-strip">

            <p className="brand-title">
                Trusted by leading technology brands
            </p>

            <div className="brand-list">

                {brands.map((brand) => (
                    <span key={brand}>
                        {brand}
                    </span>
                ))}

            </div>

        </section>
    );
};

export default BrandStrip;