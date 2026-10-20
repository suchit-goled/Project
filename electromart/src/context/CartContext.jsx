import {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
    useMemo,
} from "react";
import CartService from "../services/cart.service";
import ProductService from "../services/product.service";
import { useAuth } from "./AuthContext";
import toast from "react-hot-toast";

const CartContext = createContext();

const GUEST_CART_KEY = "electronova_guest_cart";

export const CartProvider = ({ children }) => {
    const { user } = useAuth();
    const userId = user?._id || user?.id;

    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(false);

    // ============================
    // Load Guest Cart
    // ============================
    const loadGuestCart = useCallback(() => {
        try {
            const raw = localStorage.getItem(GUEST_CART_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch {
            return [];
        }
    }, []);

    // Save Guest Cart
    const saveGuestCart = useCallback((items) => {
        try {
            localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
        } catch (e) {
            console.error("Failed to save guest cart:", e);
        }
    }, []);

    // ============================
    // Fetch Server Cart & Merge Guest Cart
    // ============================
    const fetchCart = useCallback(async () => {
        if (!userId) {
            const guestItems = loadGuestCart();
            setCart(guestItems);
            return;
        }

        try {
            setLoading(true);

            // Check if there are guest items to merge
            const guestItems = loadGuestCart();
            if (guestItems.length > 0) {
                for (const item of guestItems) {
                    const pid = item.productId?._id || item.productId;
                    if (pid) {
                        try {
                            await CartService.addToCart(userId, pid, item.quantity || 1);
                        } catch (err) {
                            console.error("Error merging guest item:", err);
                        }
                    }
                }
                localStorage.removeItem(GUEST_CART_KEY);
            }

            const response = await CartService.getCart(userId);
            const items = response.cart || [];
            setCart(items);
        } catch (error) {
            console.error("Fetch Cart Error:", error);
        } finally {
            setLoading(false);
        }
    }, [userId, loadGuestCart]);

    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    // ============================
    // Add To Cart
    // ============================
    const addToCart = async (productId, quantity = 1) => {
        const qty = Math.max(1, Number(quantity) || 1);

        if (!userId) {
            // Guest Cart Flow
            try {
                const currentGuest = loadGuestCart();
                const existingIdx = currentGuest.findIndex(
                    (item) => (item.productId?._id || item.productId) === productId
                );

                if (existingIdx > -1) {
                    currentGuest[existingIdx].quantity += qty;
                } else {
                    const productData = await ProductService.getProductById(productId);
                    currentGuest.push({
                        productId: {
                            _id: productData._id,
                            product_title: productData.product_title || productData.title,
                            discounted_price: productData.discounted_price || productData.price,
                            original_price: productData.original_price || productData.price,
                            product_image_url: productData.product_image_url || productData.image,
                            product_category: productData.product_category || productData.category,
                        },
                        title: productData.product_title || productData.title,
                        image: productData.product_image_url || productData.image,
                        price: productData.discounted_price || productData.price,
                        quantity: qty,
                    });
                }

                saveGuestCart(currentGuest);
                setCart([...currentGuest]);
                return;
            } catch (err) {
                console.error("Guest Add to Cart Error:", err);
                toast.error("Could not add product to cart");
                return;
            }
        }

        try {
            await CartService.addToCart(userId, productId, qty);
            await fetchCart();
        } catch (error) {
            console.error("Add To Cart Error:", error);
            const msg = error.response?.data?.message || "Failed to add item to cart";
            toast.error(msg);
        }
    };

    // ============================
    // Update Quantity
    // ============================
    const updateQuantity = async (productId, quantity) => {
        const targetQty = Number(quantity);

        if (targetQty <= 0) {
            await removeItem(productId);
            return;
        }

        if (!userId) {
            const currentGuest = loadGuestCart();
            const idx = currentGuest.findIndex(
                (item) => (item.productId?._id || item.productId) === productId
            );
            if (idx > -1) {
                currentGuest[idx].quantity = targetQty;
                saveGuestCart(currentGuest);
                setCart([...currentGuest]);
            }
            return;
        }

        try {
            await CartService.updateQuantity(userId, productId, targetQty);
            await fetchCart();
        } catch (error) {
            console.error("Update Quantity Error:", error);
            toast.error("Failed to update item quantity");
        }
    };

    // ============================
    // Remove Item
    // ============================
    const removeItem = async (productId) => {
        if (!userId) {
            const currentGuest = loadGuestCart();
            const filtered = currentGuest.filter(
                (item) => (item.productId?._id || item.productId) !== productId
            );
            saveGuestCart(filtered);
            setCart(filtered);
            toast.success("Item removed from cart");
            return;
        }

        try {
            await CartService.removeItem(userId, productId);
            await fetchCart();
            toast.success("Item removed from cart");
        } catch (error) {
            console.error("Remove Item Error:", error);
            toast.error("Failed to remove item");
        }
    };

    // ============================
    // Clear Cart
    // ============================
    const clearCart = async () => {
        if (!userId) {
            localStorage.removeItem(GUEST_CART_KEY);
            setCart([]);
            return;
        }

        try {
            await CartService.clearCart(userId);
            setCart([]);
        } catch (error) {
            console.error("Clear Cart Error:", error);
        }
    };

    // Derived Counts & Financial Totals
    const cartCount = useMemo(() => {
        return cart.reduce((total, item) => total + (item.quantity || 1), 0);
    }, [cart]);

    const subtotal = useMemo(() => {
        return cart.reduce((sum, item) => {
            const price =
                item.price ??
                item.productId?.discounted_price ??
                item.productId?.price ??
                0;
            return sum + price * (item.quantity || 1);
        }, 0);
    }, [cart]);

    const shippingCharge = useMemo(() => {
        if (subtotal === 0) return 0;
        return subtotal >= 1000 ? 0 : 99;
    }, [subtotal]);

    const taxAmount = useMemo(() => {
        return Math.round(subtotal * 0.18);
    }, [subtotal]);

    const grandTotal = useMemo(() => {
        return subtotal + shippingCharge + taxAmount;
    }, [subtotal, shippingCharge, taxAmount]);

    return (
        <CartContext.Provider
            value={{
                cart,
                cartCount,
                subtotal,
                shippingCharge,
                taxAmount,
                grandTotal,
                loading,
                addToCart,
                updateQuantity,
                removeItem,
                clearCart,
                fetchCart,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
