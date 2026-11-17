import mongoose from "mongoose";

const storeSchema = new mongoose.Schema(
    {
        sellerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        sellerProfileId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Seller",
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
        },
        tagline: {
            type: String,
            default: "",
            trim: true,
        },
        description: {
            type: String,
            default: "",
        },
        logo: {
            type: String,
            default: "",
        },
        banner: {
            type: String,
            default: "",
        },
        pickupAddress: {
            addressLine: { type: String, default: "" },
            city: { type: String, default: "" },
            state: { type: String, default: "" },
            pincode: { type: String, default: "" },
            phone: { type: String, default: "" },
        },
        rating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
        },
        totalReviews: {
            type: Number,
            default: 0,
            min: 0,
        },
        isActive: {
            type: Boolean,
            default: true,
            index: true,
        },
        deliveryOptions: {
            supportsSellerDelivery: { type: Boolean, default: true },
            supportsPlatformDelivery: { type: Boolean, default: true },
        },
        returnPolicy: {
            type: String,
            default: "7 days replacement or return for electronics in original condition.",
        },
        socialLinks: {
            website: { type: String, default: "" },
            twitter: { type: String, default: "" },
            facebook: { type: String, default: "" },
            instagram: { type: String, default: "" },
        },
    },
    {
        timestamps: true,
    }
);

storeSchema.index({ name: "text", description: "text" });

export default mongoose.model("Store", storeSchema);
