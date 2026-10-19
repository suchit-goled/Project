import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import AppError from "../utils/AppError.js";

class CartService {
    async addToCart(userId, productId, quantity = 1) {
        if (!productId) {
            throw new AppError("Product ID is required", 400);
        }

        const numQuantity = Number(quantity);
        if (isNaN(numQuantity) || numQuantity <= 0) {
            throw new AppError("Quantity must be a positive integer", 400);
        }

        const product = await Product.findById(productId);
        if (!product) {
            throw new AppError("Product not found", 404);
        }

        let cartItem = await Cart.findOne({ userId, productId });

        if (cartItem) {
            cartItem.quantity += numQuantity;
            await cartItem.save();
        } else {
            cartItem = await Cart.create({
                userId,
                productId,
                title: product.product_title,
                image: product.product_image_url,
                price: product.discounted_price,
                quantity: numQuantity
            });
        }

        return cartItem;
    }

    async getCart(userId) {
        return await Cart.find({ userId }).populate("productId");
    }

    async updateQuantity(userId, productId, quantity) {
        if (!productId || quantity === undefined) {
            throw new AppError("Product ID and quantity are required", 400);
        }

        const numQuantity = Number(quantity);
        if (numQuantity <= 0) {
            await Cart.findOneAndDelete({ userId, productId });
            return null;
        }

        const cartItem = await Cart.findOne({ userId, productId });
        if (!cartItem) {
            throw new AppError("Cart item not found", 404);
        }

        cartItem.quantity = numQuantity;
        await cartItem.save();
        return cartItem;
    }

    async removeItem(userId, productId) {
        return await Cart.findOneAndDelete({ userId, productId });
    }

    async clearCart(userId) {
        return await Cart.deleteMany({ userId });
    }
}

export default new CartService();
