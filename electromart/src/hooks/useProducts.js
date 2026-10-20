import { useEffect, useState } from "react";
import productService from "../services/product.service";

const useProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;

        const fetchProducts = async () => {
            try {
                const response = await productService.getProducts();
                if (isMounted) {
                    const prodList = response?.data?.products || response?.products || [];
                    setProducts(prodList);
                }
            } catch (err) {
                if (isMounted) {
                    console.error(err);
                    setError(err.message);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchProducts();

        return () => {
            isMounted = false;
        };
    }, []);

    return {
        products,
        loading,
        error,
    };
};

export default useProducts;
