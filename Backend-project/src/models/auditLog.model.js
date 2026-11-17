import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
    {
        actorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            index: true,
        },
        actorEmail: {
            type: String,
            default: "",
        },
        actorRole: {
            type: String,
            default: "unknown",
            index: true,
        },
        action: {
            type: String,
            required: true,
            index: true,
        },
        targetType: {
            type: String,
            required: true,
            index: true, // "Seller", "Store", "Product", "Order", "SellerOrder", "Commission", "Payout", "User"
        },
        targetId: {
            type: String,
            default: "",
            index: true,
        },
        details: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },
        ipAddress: {
            type: String,
            default: "",
        },
        userAgent: {
            type: String,
            default: "",
        },
    },
    {
        timestamps: true,
    }
);

auditLogSchema.index({ createdAt: -1 });

export default mongoose.model("AuditLog", auditLogSchema);
