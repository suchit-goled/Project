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
    },
    {
        timestamps: true,
    }
);

export default mongoose.model("Order", OrderSchema);