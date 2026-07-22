import mongoose from "mongoose";

const heroSchema = new mongoose.Schema(
    {
        badge: {
            type: String,
            default: "PREMIUM ELECTRONICS",
        },
        title: {
            type: String,
            required: true,
        },
        highlight: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        primaryButton: {
            type: String,
            default: "Shop Collection",
        },
        secondaryButton: {
            type: String,
            default: "Explore Deals",
        },
    },
    { _id: false }
);

const homeSettingsSchema = new mongoose.Schema(
    {
        hero: heroSchema,

        featuredCategories: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Category",
            },
        ],

        featuredProducts: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
            },
        ],

        trendingProducts: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
            },
        ],

        featuredBrands: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Brand",
            },
        ],
    },
    {
        timestamps: true,
    }
);

export default mongoose.model(
    "HomeSettings",
    homeSettingsSchema
);