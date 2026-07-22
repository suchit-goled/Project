import { createContext, useContext, useEffect, useState } from "react";
import WishlistService from "../services/wishlist.service";
import { useAuth } from "./AuthContext";

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {

    const { user } = useAuth();

    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchWishlist = async () => {

        if (!user) {
            setWishlist([]);
            return;
        }

        try {

            setLoading(true);

            const response = await WishlistService.getWishlist();

            setWishlist(response.wishlist || []);

        } catch (error) {

            console.error(error);

        } finally {

            setLoading(false);

        }

    };

    useEffect(() => {

        fetchWishlist();

    }, [user]);



    const addToWishlist = async (productId) => {

        try {

            await WishlistService.addToWishlist(productId);

            await fetchWishlist();

        } catch (error) {

            console.error(error);

        }

    };



    const removeFromWishlist = async (productId) => {

        try {

            await WishlistService.removeFromWishlist(productId);

            await fetchWishlist();

        } catch (error) {

            console.error(error);

        }

    };



    const isWishlisted = (productId) => {

        return wishlist.some(
            item => item.productId?._id === productId
        );

    };



    return (

        <WishlistContext.Provider
            value={{
                wishlist,
                loading,
                addToWishlist,
                removeFromWishlist,
                fetchWishlist,
                isWishlisted,
                wishlistCount: wishlist.length
            }}
        >

            {children}

        </WishlistContext.Provider>

    );

};

export const useWishlist = () => useContext(WishlistContext);