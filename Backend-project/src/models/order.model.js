import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            required: true,
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

                image: String,

                quantity: {
                    type: Number,
                    required: true,
                },

                price: {
                    type: Number,
                    required: true,
                },
            },
        ],

        shippingAddress: {
            fullName: String,
            phone: String,
            address: String,
            city: String,
            state: String,
            pincode: String,
        },

        paymentMethod: {
            type: String,
            default: "Cash on Delivery",
        },

        subtotal: Number,

        shippingCharge: Number,

        tax: Number,

        total: Number,

        orderStatus: {
            type: String,
            default: "Pending",
        },

        paymentStatus: {
            type: String,
            default: "Pending",
        },

        // Multi-Vendor Marketplace extensions (v3.0.0)
        parentOrderNumber: {
            type: String,
            unique: true,
            sparse: true,
            index: true,
        },

        sellerOrders: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "SellerOrder",
            },
        ],

        commissionTotal: {
            type: Number,
            default: 0,
        },

        isMultiSeller: {
            type: Boolean,
            default: false,
        },

        razorpayOrderId: {
            type: String,
            default: "",
        },

        razorpayPaymentId: {
            type: String,
            default: "",
        },

        razorpaySignature: {
            type: String,
            default: "",
        },

        notes: {
            type: String,
            default: "",
        },
    },
    {
        timestamps: true,
    }
);

OrderSchema.index({ userId: 1, createdAt: -1 });
OrderSchema.index({ orderStatus: 1 });

export default mongoose.model("Order", OrderSchema);