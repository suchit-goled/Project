import { useEffect, useState } from "react";
import "./Products.css";

import ProductService from "../services/product.service";

import FiltersSidebar from "../components/Products/FiltersSidebar";
import ProductsHeader from "../components/Products/ProductsHeader";
import ProductGrid from "../components/Products/ProductGrid";

import { useSearch } from "../SearchContext.jsx/SearchContext";

const Products = () => {

    const { search } = useSearch();

    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [sort, setSort] = useState("newest");
    const [category, setCategory] = useState("");
    const [rating, setRating] = useState(0);
    const [maxPrice, setMaxPrice] = useState(200000);

    useEffect(() => {

        fetchProducts();

    }, [page]);

    const fetchProducts = async () => {

        try {

            setLoading(true);
            setError("");

            const response = await ProductService.getProducts({
                page,
            });

            console.log(response);

            setProducts(response.data.products);
            setTotalPages(response.data.totalPages);

            const uniqueCategories = [

                ...new Set(

                    response.data.products.map(
                        (product) => product.product_category
                    )

                ),

            ];

            setCategories(uniqueCategories);

        } catch (err) {

            console.error(err);

            setError("Failed to load products.");

        } finally {

            setLoading(false);

        }

    };

    return (

        <section className="products-page">

            <div className="container">

                <ProductsHeader
                    search={search}
                    sort={sort}
                    setSort={setSort}
                />

                <div className="products-layout">

                    <FiltersSidebar
                        categories={categories}
                        category={category}
                        setCategory={setCategory}
                        rating={rating}
                        setRating={setRating}
                        maxPrice={maxPrice}
                        setMaxPrice={setMaxPrice}
                    />

                    <div className="products-content">

                        <ProductGrid
                            products={products}
                            loading={loading}
                            error={error}
                            search={search}
                            sort={sort}
                            category={category}
                            rating={rating}
                            maxPrice={maxPrice}
                            page={page}
                            totalPages={totalPages}
                            setPage={setPage}
                        />

                    </div>

                </div>

            </div>

        </section>

    );

};

export default Products;