import { useEffect, useState } from "react";
import productService from "../services/product.service";

const useProducts = () => {

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {

        const fetchProducts = async () => {

            try {

                const response = await productService.getProducts();

                setProducts(response.data.products);

            } catch (err) {

                console.error(err);
                setError(err.message);

            } finally {

                setLoading(false);

            }

        };

        fetchProducts();

    }, []);

    return {
        products,
        loading,
        error,
    };

};

export default useProducts;