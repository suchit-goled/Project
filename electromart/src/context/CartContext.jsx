import { createContext, useContext, useEffect, useState } from "react";
import CartService from "../services/cart.service";
import { useAuth } from "./AuthContext";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const { user } = useAuth();

    // Support both _id and id
    const userId = user?._id || user?.id;

    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(false);
    const [cartCount, setCartCount] = useState(0);

    // ============================
    // Fetch Cart
    // ============================
    const fetchCart = async () => {

        if (!userId) {
            setCart([]);
            setCartCount(0);
            return;
        }

        try {

            setLoading(true);

            const response = await CartService.getCart(userId);

            const items = response.cart || [];

            setCart(items);

            const count = items.reduce(
                (total, item) => total + item.quantity,
                0
            );

            setCartCount(count);

        } catch (error) {

            console.error("Fetch Cart Error:", error);

        } finally {

            setLoading(false);

        }
        console.log("Fetching cart for user:", userId);

    };

    useEffect(() => {

        fetchCart();

    }, [userId]);

    // ============================
    // Add To Cart
    // ============================
    const addToCart = async (productId, quantity = 1) => {

        if (!userId) {
            alert("Please login first");
            return;
        }

        try {

            await CartService.addToCart(
                userId,
                productId,
                quantity
            );

            await fetchCart();

        } catch (error) {

            console.error("Add To Cart Error:", error);

        }
        console.log("Saving cart for user:", userId);

    };

    // ============================
    // Update Quantity
    // ============================
    const updateQuantity = async (productId, quantity) => {

        if (!userId) return;

        try {

            if (quantity <= 0) {

                await removeItem(productId);
                return;

            }

            await CartService.updateQuantity(
                userId,
                productId,
                quantity
            );

            await fetchCart();

        } catch (error) {

            console.error("Update Quantity Error:", error);

        }

    };

    // ============================
    // Remove Item
    // ============================
    const removeItem = async (productId) => {

        if (!userId) return;

        try {

            await CartService.removeItem(
                userId,
                productId
            );

            await fetchCart();

        } catch (error) {

            console.error("Remove Item Error:", error);

        }

    };

    // ============================
    // Clear Cart
    // ============================
    const clearCart = async () => {

        if (!userId) return;

        try {

            await CartService.clearCart(userId);

            setCart([]);
            setCartCount(0);

        } catch (error) {

            console.error("Clear Cart Error:", error);

        }

    };

    return (
        <CartContext.Provider
            value={{
                cart,
                cartCount,
                loading,
                addToCart,
                updateQuantity,
                removeItem,
                clearCart,
                fetchCart
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);