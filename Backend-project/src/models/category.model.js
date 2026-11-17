import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
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
        icon: {
            type: String,
            default: "",
        },
        image: {
            type: String,
            default: "",
        },
        description: {
            type: String,
            default: "",
        },
        commissionRate: {
            type: Number,
            default: 5,
            min: 0,
            max: 100,
        },
        isActive: {
            type: Boolean,
            default: true,
            index: true,
        },
        displayOrder: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model("Category", categorySchema);
