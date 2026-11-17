import { useCallback, useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import "./Products.css";

import ProductService from "../services/product.service";
import FiltersSidebar from "../components/Products/FiltersSidebar";
import ProductsHeader from "../components/Products/ProductsHeader";
import ProductGrid from "../components/Products/ProductGrid";
import { useSearch } from "../context/SearchContext";

const Products = () => {
    const { category: paramCategory, key: paramKey } = useParams();
    const [searchParams] = useSearchParams();
    const { search, setSearch } = useSearch();

    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [totalProducts, setTotalProducts] = useState(0);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [sort, setSort] = useState("newest");
    const [category, setCategory] = useState(paramCategory || searchParams.get("category") || "");
    const [brand, setBrand] = useState(searchParams.get("brand") || "");
    const [rating, setRating] = useState(0);
    const [maxPrice, setMaxPrice] = useState(200000);
    const [inStock, setInStock] = useState(false);
    const [minDiscount, setMinDiscount] = useState(0);
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

    // Sync from URL params
    useEffect(() => {
        if (paramCategory) {
            setCategory(paramCategory);
            setPage(1);
        } else if (searchParams.get("category")) {
            setCategory(searchParams.get("category"));
            setPage(1);
        }

        if (searchParams.get("brand")) {
            setBrand(searchParams.get("brand"));
            setPage(1);
        }

        if (paramKey) {
            setSearch(paramKey);
            setPage(1);
        } else if (searchParams.get("search")) {
            setSearch(searchParams.get("search"));
            setPage(1);
        }
    }, [paramCategory, paramKey, searchParams, setSearch]);

    // Fetch categories and brands from backend
    useEffect(() => {
        const fetchMeta = async () => {
            try {
                const [cats, brandList] = await Promise.all([
                    ProductService.getCategories(),
                    ProductService.getBrands(),
                ]);
                if (cats && cats.length > 0) setCategories(cats);
                if (brandList && brandList.length > 0) {
                    setBrands(brandList);
                } else {
                    // Fallback to top electronics brands
                    setBrands(["Apple", "Samsung", "Sony", "Dell", "HP", "Lenovo", "boAt", "OnePlus", "Asus", "Bose", "Canon", "LG"]);
                }
            } catch (err) {
                console.error("Failed to load catalog metadata:", err);
            }
        };
        fetchMeta();
    }, []);

    // Fetch products from server with all query parameters
    const fetchProducts = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const params = {
                page,
                limit: 16,
                sort,
            };

            if (category && category.trim()) {
                params.category = category.trim();
            }

            if (brand && brand.trim()) {
                params.brand = brand.trim();
            }

            if (search && search.trim()) {
                params.search = search.trim();
            }

            if (rating > 0) {
                params.rating = rating;
            }

            if (maxPrice < 200000) {
                params.maxPrice = maxPrice;
            }

            if (inStock) {
                params.inStock = "true";
            }

            if (minDiscount > 0) {
                params.minDiscount = minDiscount;
            }

            const response = await ProductService.getProducts(params);

            setProducts(response.data.products || []);
            setTotalPages(response.data.totalPages || 1);
            setTotalProducts(response.data.total || 0);

        } catch (err) {
            console.error("Error fetching catalogue:", err);
            setError("Failed to load products. Please check your connection.");
        } finally {
            setLoading(false);
        }
    }, [page, category, brand, search, rating, maxPrice, inStock, minDiscount, sort]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const handleCategoryChange = (newCat) => {
        setCategory(newCat);
        setPage(1);
    };

    const handleBrandChange = (newBrand) => {
        setBrand(newBrand);
        setPage(1);
    };

    const handleRatingChange = (newRating) => {
        setRating(newRating);
        setPage(1);
    };

    const handleMaxPriceChange = (newPrice) => {
        setMaxPrice(newPrice);
        setPage(1);
    };

    const handleInStockChange = (val) => {
        setInStock(val);
        setPage(1);
    };

    const handleMinDiscountChange = (val) => {
        setMinDiscount(val);
        setPage(1);
    };

    const handleSortChange = (newSort) => {
        setSort(newSort);
        setPage(1);
    };

    const handleResetAll = () => {
        setCategory("");
        setBrand("");
        setRating(0);
        setMaxPrice(200000);
        setInStock(false);
        setMinDiscount(0);
        setSort("newest");
        setPage(1);
        if (setSearch) setSearch("");
    };

    return (
        <section className="products-page">
            <div className="container">
                <ProductsHeader
                    total={totalProducts}
                    sort={sort}
                    setSort={handleSortChange}
                    category={category}
                    brand={brand}
                    search={search}
                    onToggleMobileFilters={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                />

                <div className="products-layout">
                    <div className={`products-sidebar-col ${mobileFiltersOpen ? "open" : ""}`}>
                        <FiltersSidebar
                            categories={categories}
                            category={category}
                            setCategory={handleCategoryChange}
                            brands={brands}
                            brand={brand}
                            setBrand={handleBrandChange}
                            rating={rating}
                            setRating={handleRatingChange}
                            maxPrice={maxPrice}
                            setMaxPrice={handleMaxPriceChange}
                            inStock={inStock}
                            setInStock={handleInStockChange}
                            minDiscount={minDiscount}
                            setMinDiscount={handleMinDiscountChange}
                            onReset={handleResetAll}
                        />
                    </div>

                    <div className="products-content">
                        <ProductGrid
                            products={products}
                            loading={loading}
                            error={error}
                            page={page}
                            totalPages={totalPages}
                            setPage={setPage}
                            category={category}
                            setCategory={handleCategoryChange}
                            rating={rating}
                            setRating={handleRatingChange}
                            maxPrice={maxPrice}
                            setMaxPrice={handleMaxPriceChange}
                            search={search}
                            setSearch={setSearch}
                            onReset={handleResetAll}
                            onRetry={fetchProducts}
                        />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Products;
