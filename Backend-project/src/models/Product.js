import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
    {
        product_title: String,
        product_rating: Number,
        total_reviews: Number,
        discounted_price: Number,
        original_price: Number,
        product_image_url: String,
        product_category: String,
        discount_percentage: Number,
        isFeatured: Boolean,
    },
    {
        collection: "Products", // Change to "Products" if that's where your data actually is
    }
);

export default mongoose.model("Product", productSchema);