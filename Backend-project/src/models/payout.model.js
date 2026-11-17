import mongoose from "mongoose";

const payoutSchema = new mongoose.Schema(
    {
        payoutNumber: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        sellerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        storeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Store",
            required: true,
            index: true,
        },
        grossSales: {
            type: Number,
            required: true,
            min: 0,
        },
        commissionDeducted: {
            type: Number,
            required: true,
            min: 0,
        },
        netAmount: {
            type: Number,
            required: true,
            min: 0,
        },
        orderCount: {
            type: Number,
            default: 0,
        },
        sellerOrders: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "SellerOrder",
            },
        ],
        periodStart: {
            type: Date,
            required: true,
        },
        periodEnd: {
            type: Date,
            required: true,
        },
        status: {
            type: String,
            enum: ["Pending", "Processing", "Completed", "Failed"],
            default: "Pending",
            index: true,
        },
        bankDetails: {
            accountNumber: { type: String, default: "" },
            ifscCode: { type: String, default: "" },
            bankName: { type: String, default: "" },
            accountHolderName: { type: String, default: "" },
        },
        transactionReference: {
            type: String,
            default: "",
        },
        processedAt: {
            type: Date,
        },
        processedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        remarks: {
            type: String,
            default: "",
        },
    },
    {
        timestamps: true,
    }
);

payoutSchema.index({ sellerId: 1, status: 1 });

export default mongoose.model("Payout", payoutSchema);
