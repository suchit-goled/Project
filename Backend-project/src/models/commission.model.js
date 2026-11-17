import mongoose from "mongoose";

const commissionSchema = new mongoose.Schema(
    {
        defaultRate: {
            type: Number,
            required: true,
            default: 5.0,
            min: 0,
            max: 100,
        },
        categoryRates: [
            {
                category: {
                    type: String,
                    required: true,
                    trim: true,
                },
                rate: {
                    type: Number,
                    required: true,
                    min: 0,
                    max: 100,
                },
            },
        ],
        sellerRates: [
            {
                sellerId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                    required: true,
                },
                rate: {
                    type: Number,
                    required: true,
                    min: 0,
                    max: 100,
                },
            },
        ],
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
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

export default mongoose.model("Commission", commissionSchema);
