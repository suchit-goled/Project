import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
    FiCheckCircle,
    FiStar,
    FiMapPin,
    FiTruck,
    FiShield,
    FiPackage,
    FiSearch,
    FiChevronRight,
    FiArrowLeft
} from "react-icons/fi";
import ProductCard from "../components/common/Card/ProductCard";
import ProductSkeleton from "../components/common/Skeleton/ProductSkeleton";
import ProductService from "../services/product.service";
import "./StorePage.css";

const StorePage = () => {
    const { slug } = useParams();

    const [store, setStore] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");

    useEffect(() => {
        let isMounted = true;
        const fetchStoreData = async () => {
            try {
                setLoading(true);
                setError("");
                const data = await ProductService.getStoreBySlug(slug);
                if (!data) {
                    if (isMounted) setError("Store not found or currently inactive.");
                    return;
                }
                if (isMounted) {
                    setStore(data);
                    setProducts(data.products || []);
                }
            } catch (err) {
                console.error("Failed to fetch store:", err);
                if (isMounted) setError("Unable to load store information.");
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchStoreData();
        window.scrollTo({ top: 0, behavior: "smooth" });
        return () => { isMounted = false; };
    }, [slug]);

    if (loading) {
        return (
            <div className="store-page container">
                <div className="store-loading-skeleton">
                    <div className="store-header-skeleton" />
                    <div className="store-products-grid">
                        {Array.from({ length: 6 }).map((_, idx) => (
                            <ProductSkeleton key={idx} />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error || !store) {
        return (
            <div className="store-page container">
                <div className="store-error-card">
                    <h2>Store Not Found</h2>
                    <p>{error || "The seller store you are looking for does not exist or has been paused."}</p>
                    <Link to="/products" className="store-back-btn">
                        <FiArrowLeft /> Browse Marketplace Products
                    </Link>
                </div>
            </div>
        );
    }

    // Filter store's products by search query and category
    const categoriesInStore = ["all", ...new Set(products.map((p) => p.product_category).filter(Boolean))];

    const filteredProducts = products.filter((p) => {
        const matchesSearch = !searchQuery ||
            p.product_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.brand?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === "all" ||
            p.product_category?.toLowerCase() === selectedCategory.toLowerCase();
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="store-page container">
            {/* Breadcrumb */}
            <nav className="store-breadcrumb" aria-label="Breadcrumb">
                <Link to="/">Home</Link>
                <FiChevronRight />
                <Link to="/products">Marketplace</Link>
                <FiChevronRight />
                <span className="current">{store.name}</span>
            </nav>

            {/* Store Hero Banner & Profile */}
            <div className="store-profile-card">
                <div className="store-banner-wrapper">
                    <img
                        src={store.banner || "/media/design/editorial-keyboard.webp"}
                        alt={`${store.name} Banner`}
                        className="store-banner-img"
                    />
                    <div className="store-banner-overlay" />
                </div>

                <div className="store-profile-body">
                    <div className="store-identity-row">
                        <div className="store-avatar-box">
                            {store.logo ? (
                                <img src={store.logo} alt={store.name} />
                            ) : (
                                <span className="store-fallback-letter">{store.name.charAt(0)}</span>
                            )}
                        </div>

                        <div className="store-primary-info">
                            <div className="store-title-badge-row">
                                <h1 className="store-page-name">{store.name}</h1>
                                {store.isVerified && (
                                    <span className="store-verified-pill">
                                        <FiCheckCircle /> Verified Electronics Partner
                                    </span>
                                )}
                            </div>

                            <div className="store-metrics-row">
                                <span className="store-rating-badge">
                                    <FiStar /> {store.rating?.toFixed(1) || "4.8"}
                                    <span className="review-sub">({store.reviewCount || 100}+ reviews)</span>
                                </span>

                                {store.pickupAddress?.city && (
                                    <span className="store-location-badge">
                                        <FiMapPin /> {store.pickupAddress.city}, {store.pickupAddress.state || "India"}
                                    </span>
                                )}

                                <span className="store-catalog-badge">
                                    <FiPackage /> {products.length} Products
                                </span>
                            </div>
                        </div>
                    </div>

                    <p className="store-page-description">
                        {store.description || "Official seller partner on ElectroNova. Specializing in high-performance electronics, genuine devices, and authorized warranty coverage."}
                    </p>

                    <div className="store-trust-badges">
                        <div className="trust-badge">
                            <FiShield /> 100% Genuine Brand Sourcing
                        </div>
                        {store.supportsPlatformDelivery && (
                            <div className="trust-badge highlight">
                                <FiTruck /> ElectroNova Express Fulfilled
                            </div>
                        )}
                        {store.supportsSellerDelivery && (
                            <div className="trust-badge">
                                <FiTruck /> Direct Store Dispatch Available
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Store Catalog Section */}
            <div className="store-catalog-section">
                <div className="store-catalog-header">
                    <div className="catalog-search-box">
                        <FiSearch />
                        <input
                            type="text"
                            placeholder={`Search inside ${store.name}...`}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {categoriesInStore.length > 2 && (
                        <div className="store-category-pills">
                            {categoriesInStore.map((cat) => (
                                <button
                                    key={cat}
                                    className={`store-cat-pill ${selectedCategory === cat ? "active" : ""}`}
                                    onClick={() => setSelectedCategory(cat)}
                                >
                                    {cat === "all" ? "All Products" : cat}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {filteredProducts.length === 0 ? (
                    <div className="store-empty-catalog">
                        <FiPackage size={42} />
                        <h3>No products match your search</h3>
                        <p>Try searching for a different keyword or selecting another category.</p>
                        <button
                            className="clear-search-btn"
                            onClick={() => { setSearchQuery(""); setSelectedCategory("all"); }}
                        >
                            Reset Filter
                        </button>
                    </div>
                ) : (
                    <div className="store-products-grid">
                        {filteredProducts.map((p) => (
                            <ProductCard key={p._id} product={p} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StorePage;
