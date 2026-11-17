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

        // Multi-Vendor Marketplace extensions (v3.0.0)
        sellerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            index: true,
        },
        storeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Store",
            index: true,
        },
        brand: {
            type: String,
            default: "",
            index: true,
        },
        description: {
            type: String,
            default: "",
        },
        images: [
            {
                type: String,
            },
        ],
        specifications: [
            {
                key: { type: String, default: "" },
                value: { type: String, default: "" },
            },
        ],
        stock: {
            type: Number,
            default: 25,
            min: 0,
            index: true,
        },
        sku: {
            type: String,
            trim: true,
            index: true,
        },
        deliveryOptions: {
            supportsSellerDelivery: { type: Boolean, default: true },
            supportsPlatformDelivery: { type: Boolean, default: true },
            estimatedDeliveryDays: { type: Number, default: 3 },
        },
        approvalStatus: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "approved",
            index: true,
        },
        rejectionReason: {
            type: String,
            default: "",
        },
        isActive: {
            type: Boolean,
            default: true,
            index: true,
        },
    },
    {
        collection: "Products", // Preserves existing collection data
        timestamps: true,
    }
);

productSchema.index({ product_title: "text", brand: "text", description: "text" });
productSchema.index({ product_category: 1, discounted_price: 1 });


export default mongoose.model("Product", productSchema);