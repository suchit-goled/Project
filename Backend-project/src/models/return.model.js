import mongoose from "mongoose";

const returnSchema = new mongoose.Schema(
    {
        returnNumber: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        parentOrderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
            required: true,
            index: true,
        },
        sellerOrderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "SellerOrder",
            required: true,
            index: true,
        },
        customerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        sellerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },
        quantity: {
            type: Number,
            default: 1,
            min: 1,
        },
        reason: {
            type: String,
            required: true,
        },
        detailedDescription: {
            type: String,
            default: "",
        },
        images: [
            {
                type: String,
            },
        ],
        status: {
            type: String,
            enum: [
                "Requested",
                "Approved",
                "Rejected",
                "Item Picked Up",
                "Received by Seller",
                "Refund Approved",
                "Refund Processed",
                "Closed",
            ],
            default: "Requested",
            index: true,
        },
        refundAmount: {
            type: Number,
            required: true,
            min: 0,
        },
        refundStatus: {
            type: String,
            enum: ["Pending", "Processed", "Failed"],
            default: "Pending",
        },
        refundTransactionId: {
            type: String,
            default: "",
        },
        timeline: [
            {
                status: { type: String, required: true },
                timestamp: { type: Date, default: Date.now },
                note: { type: String, default: "" },
                actor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
            },
        ],
    },
    {
        timestamps: true,
    }
);

returnSchema.index({ sellerId: 1, status: 1 });
returnSchema.index({ customerId: 1, status: 1 });

export default mongoose.model("Return", returnSchema);
