import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
    {
        recipientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        message: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            enum: ["order", "payment", "commission", "product", "system", "payout", "return"],
            default: "system",
            index: true,
        },
        link: {
            type: String,
            default: "",
        },
        isRead: {
            type: Boolean,
            default: false,
            index: true,
        },
        readAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

notificationSchema.index({ recipientId: 1, isRead: 1, createdAt: -1 });

export default mongoose.model("Notification", notificationSchema);
