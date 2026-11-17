import mongoose from "mongoose";

const sellerSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
            index: true,
        },
        sellerType: {
            type: String,
            enum: ["individual", "business"],
            default: "business",
            required: true,
        },
        legalName: {
            type: String,
            required: true,
            trim: true,
        },
        displayName: {
            type: String,
            trim: true,
            default: "",
        },
        contactEmail: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },
        contactPhone: {
            type: String,
            required: true,
            trim: true,
        },
        gstin: {
            type: String,
            trim: true,
            uppercase: true,
            default: "",
        },
        pan: {
            type: String,
            trim: true,
            uppercase: true,
            default: "",
        },
        idProofUrl: {
            type: String,
            default: "",
        },
        businessAddress: {
            addressLine: { type: String, default: "" },
            city: { type: String, default: "" },
            state: { type: String, default: "" },
            pincode: { type: String, default: "" },
            country: { type: String, default: "India" },
        },
        bankDetails: {
            accountNumber: { type: String, default: "" },
            ifscCode: { type: String, uppercase: true, default: "" },
            bankName: { type: String, default: "" },
            accountHolderName: { type: String, default: "" },
        },
        status: {
            type: String,
            enum: ["pending", "approved", "rejected", "suspended"],
            default: "pending",
            index: true,
        },
        rejectionReason: {
            type: String,
            default: "",
        },
        approvedAt: {
            type: Date,
        },
        approvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        commissionRateOverride: {
            type: Number,
            default: null,
            min: 0,
            max: 100,
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

sellerSchema.index({ status: 1, sellerType: 1 });

export default mongoose.model("Seller", sellerSchema);
