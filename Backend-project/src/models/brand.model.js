import mongoose from "mongoose";

const brandSchema = new mongoose.Schema(
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
        logo: {
            type: String,
            default: "",
        },
        description: {
            type: String,
            default: "",
        },
        website: {
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
        timestamps: true,
    }
);

export default mongoose.model("Brand", brandSchema);
