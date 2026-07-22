import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

// =============================
// Add Product To Cart
// =============================
export const addToCart = async (req, res) => {
    try {
        const { userId, productId, quantity = 1 } = req.body;

        if (!userId || !productId) {
            return res.status(400).json({
                success: false,
                message: "User ID and Product ID are required"
            });
        }

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        let cartItem = await Cart.findOne({
            userId,
            productId
        });

        if (cartItem) {
            cartItem.quantity += Number(quantity);
            await cartItem.save();
        } else {
            cartItem = await Cart.create({
                userId,
                productId,
                title: product.product_title,
                image: product.product_image_url,
                price: product.discounted_price,
                quantity
            });
        }

        res.status(200).json({
            success: true,
            message: "Product added to cart",
            item: cartItem
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

// =============================
// Get Cart
// =============================
export const getCart = async (req, res) => {
    try {

        const cart = await Cart.find({
            userId: req.params.userId
        }).populate("productId");

        res.status(200).json({
            success: true,
            cart
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

// =============================
// Update Quantity
// =============================
export const updateQuantity = async (req, res) => {

    try {

        const { userId, productId, quantity } = req.body;

        if (!userId || !productId) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields"
            });
        }

        const cartItem = await Cart.findOne({
            userId,
            productId
        });

        if (!cartItem) {
            return res.status(404).json({
                success: false,
                message: "Cart item not found"
            });
        }

        cartItem.quantity = quantity;

        await cartItem.save();

        res.status(200).json({
            success: true,
            message: "Quantity updated",
            item: cartItem
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

// =============================
// Remove Item
// =============================
export const removeFromCart = async (req, res) => {

    try {

        const { userId, productId } = req.body;

        await Cart.findOneAndDelete({
            userId,
            productId
        });

        res.status(200).json({
            success: true,
            message: "Item removed successfully"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

// =============================
// Clear Cart
// =============================
export const clearCart = async (req, res) => {

    try {

        await Cart.deleteMany({
            userId: req.params.userId
        });

        res.status(200).json({
            success: true,
            message: "Cart cleared successfully"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};