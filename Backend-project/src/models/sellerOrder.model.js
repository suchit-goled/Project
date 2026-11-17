import mongoose from "mongoose";

const sellerOrderSchema = new mongoose.Schema(
    {
        sellerOrderNumber: {
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
        parentOrderNumber: {
            type: String,
            index: true,
            default: "",
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
        storeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Store",
            required: true,
            index: true,
        },
        products: [
            {
                productId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Product",
                    required: true,
                },
                title: {
                    type: String,
                    required: true,
                },
                image: {
                    type: String,
                    default: "",
                },
                price: {
                    type: Number,
                    required: true,
                    min: 0,
                },
                quantity: {
                    type: Number,
                    required: true,
                    min: 1,
                },
                sku: {
                    type: String,
                    default: "",
                },
                brand: {
                    type: String,
                    default: "",
                },
            },
        ],
        subtotal: {
            type: Number,
            required: true,
            min: 0,
        },
        shippingCharge: {
            type: Number,
            default: 0,
            min: 0,
        },
        tax: {
            type: Number,
            default: 0,
            min: 0,
        },
        total: {
            type: Number,
            required: true,
            min: 0,
        },
        commissionRate: {
            type: Number,
            required: true,
            min: 0,
            max: 100,
        },
        commissionAmount: {
            type: Number,
            required: true,
            min: 0,
        },
        sellerEarnings: {
            type: Number,
            required: true,
            min: 0,
        },
        deliveryMethod: {
            type: String,
            enum: ["seller", "platform"],
            default: "platform",
            index: true,
        },
        orderStatus: {
            type: String,
            enum: [
                "Pending",
                "Confirmed",
                "Packed",
                "Dispatched",
                "In Transit",
                "Out for Delivery",
                "Delivered",
                "Cancelled",
                "Returned",
            ],
            default: "Pending",
            index: true,
        },
        paymentStatus: {
            type: String,
            enum: ["Pending", "Paid", "Failed", "Refunded"],
            default: "Pending",
            index: true,
        },
        shipmentTimeline: [
            {
                status: {
                    type: String,
                    required: true,
                },
                timestamp: {
                    type: Date,
                    default: Date.now,
                },
                note: {
                    type: String,
                    default: "",
                },
                location: {
                    type: String,
                    default: "",
                },
                updatedBy: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                },
            },
        ],
        trackingNumber: {
            type: String,
            default: "",
            index: true,
        },
        courierPartner: {
            type: String,
            default: "",
        },
        shippingAddress: {
            fullName: String,
            phone: String,
            address: String,
            city: String,
            state: String,
            pincode: String,
        },
        cancellationReason: {
            type: String,
            default: "",
        },
        cancelledBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        cancelledAt: {
            type: Date,
        },
        deliveredAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

sellerOrderSchema.index({ sellerId: 1, orderStatus: 1 });
sellerOrderSchema.index({ customerId: 1, createdAt: -1 });

export default mongoose.model("SellerOrder", sellerOrderSchema);
