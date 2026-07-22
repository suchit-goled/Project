import {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
} from "react";
import WishlistService from "../services/wishlist.service";
import { useAuth } from "./AuthContext";

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
    const { user } = useAuth();

    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchWishlist = useCallback(async () => {
        if (!user) {
            setWishlist([]);
            return;
        }

        try {
            setLoading(true);

            const response = await WishlistService.getWishlist();

            setWishlist(response.wishlist || []);
        } catch (error) {
            console.error("Fetch Wishlist Error:", error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchWishlist();
    }, [fetchWishlist]);

    const addToWishlist = async (productId) => {
        try {
            await WishlistService.addToWishlist(productId);
            await fetchWishlist();
        } catch (error) {
            console.error("Add Wishlist Error:", error);
        }
    };

    const removeFromWishlist = async (productId) => {
        try {
            await WishlistService.removeFromWishlist(productId);
            await fetchWishlist();
        } catch (error) {
            console.error("Remove Wishlist Error:", error);
        }
    };

    const isWishlisted = (productId) => {
        return wishlist.some(
            (item) => item.productId?._id === productId
        );
    };

    return (
        <WishlistContext.Provider
            value={{
                wishlist,
                loading,
                wishlistCount: wishlist.length,
                fetchWishlist,
                addToWishlist,
                removeFromWishlist,
                isWishlisted,
            }}
        >
            {children}
        </WishlistContext.Provider>
    );
};

export const useWishlist = () => useContext(WishlistContext);