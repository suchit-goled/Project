import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
    {
        code: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true,
            index: true,
        },
        description: {
            type: String,
            default: "",
        },
        discountType: {
            type: String,
            enum: ["percentage", "fixed"],
            default: "percentage",
        },
        discountValue: {
            type: Number,
            required: true,
            min: 0,
        },
        minOrderValue: {
            type: Number,
            default: 0,
            min: 0,
        },
        maxDiscount: {
            type: Number,
            default: 0, // 0 means no cap for percentage discounts
            min: 0,
        },
        startDate: {
            type: Date,
            default: Date.now,
        },
        endDate: {
            type: Date,
            required: true,
        },
        usageLimit: {
            type: Number,
            default: 1000,
        },
        usedCount: {
            type: Number,
            default: 0,
        },
        isActive: {
            type: Boolean,
            default: true,
            index: true,
        },
        applicableSellerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        applicableCategories: [
            {
                type: String,
            },
        ],
    },
    {
        timestamps: true,
    }
);

export default mongoose.model("Coupon", couponSchema);
