import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        address: {
            type: String,
            default: "",
        },

        city: {
            type: String,
            default: "",
        },

        state: {
            type: String,
            default: "",
        },

        pincode: {
            type: String,
            default: "",
        },

        password: {
            type: String,
            required: true,
            minlength: 6,
        },

        phone: {
            type: String,
            default: "",
        },

        profileImage: {
            type: String,
            default: "",
        },

        role: {
            type: String,
            enum: ["user", "customer", "seller", "admin", "superadmin"],
            default: "user",
        },

        sellerStatus: {
            type: String,
            enum: ["none", "pending", "approved", "rejected", "suspended"],
            default: "none",
            index: true,
        },

        sellerProfile: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Seller",
        },

        isEmailVerified: {
            type: Boolean,
            default: false,
        },

        resetPasswordToken: {
            type: String,
        },

        resetPasswordExpire: {
            type: Date,
        },
    },
    {
        timestamps: true,
        toJSON: {
            transform: function (doc, ret) {
                delete ret.password;
                delete ret.resetPasswordToken;
                delete ret.resetPasswordExpire;
                delete ret.__v;
                return ret;
            }
        },
        toObject: {
            transform: function (doc, ret) {
                delete ret.password;
                delete ret.resetPasswordToken;
                delete ret.resetPasswordExpire;
                delete ret.__v;
                return ret;
            }
        }
    }
);

export default mongoose.model("User", userSchema);
