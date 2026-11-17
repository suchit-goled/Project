import mongoose from "mongoose";

const shipmentSchema = new mongoose.Schema(
    {
        sellerOrderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "SellerOrder",
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
        carrier: {
            type: String,
            required: true,
            default: "ElectroNova Logistics",
        },
        trackingNumber: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        deliveryMethod: {
            type: String,
            enum: ["seller", "platform"],
            default: "platform",
        },
        originAddress: {
            addressLine: String,
            city: String,
            state: String,
            pincode: String,
            phone: String,
        },
        destinationAddress: {
            fullName: String,
            phone: String,
            address: String,
            city: String,
            state: String,
            pincode: String,
        },
        currentStatus: {
            type: String,
            enum: [
                "Created",
                "Picked Up",
                "In Transit",
                "Out for Delivery",
                "Delivered",
                "Failed",
                "Returned",
            ],
            default: "Created",
            index: true,
        },
        estimatedDelivery: {
            type: Date,
        },
        deliveredAt: {
            type: Date,
        },
        events: [
            {
                status: {
                    type: String,
                    required: true,
                },
                location: {
                    type: String,
                    default: "",
                },
                timestamp: {
                    type: Date,
                    default: Date.now,
                },
                description: {
                    type: String,
                    default: "",
                },
            },
        ],
    },
    {
        timestamps: true,
    }
);

export default mongoose.model("Shipment", shipmentSchema);
