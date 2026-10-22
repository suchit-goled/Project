import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import ApiResponse from "../utils/apiResponse.js";

export const getProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id).select("-password -resetPasswordToken -resetPasswordExpire");

        if (!user) {
            return ApiResponse.error(res, "User not found", 404);
        }

        return ApiResponse.success(res, { user }, "Profile fetched successfully");
    } catch (err) {
        next(err);
    }
};

export const updateProfile = async (req, res, next) => {
    try {
        const {
            name,
            phone,
            address,
            city,
            state,
            pincode,
        } = req.body;

        const user = await User.findById(req.user._id);

        if (!user) {
            return ApiResponse.error(res, "User not found", 404);
        }

        if (name !== undefined) {
            const trimmedName = String(name).trim();
            if (trimmedName.length === 0) {
                return ApiResponse.error(res, "Name cannot be empty", 400);
            }
            user.name = trimmedName;
        }
        if (phone !== undefined) user.phone = String(phone).trim();
        if (address !== undefined) user.address = String(address).trim();
        if (city !== undefined) user.city = String(city).trim();
        if (state !== undefined) user.state = String(state).trim();
        if (pincode !== undefined) user.pincode = String(pincode).trim();

        await user.save();

        const safeUser = await User.findById(req.user._id).select("-password -resetPasswordToken -resetPasswordExpire");

        return ApiResponse.success(
            res,
            { user: safeUser },
            "Profile updated successfully"
        );
    } catch (err) {
        next(err);
    }
};

export const changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return ApiResponse.error(res, "Current password and new password are required.", 400);
        }

        if (String(newPassword).length < 6) {
            return ApiResponse.error(res, "New password must be at least 6 characters long.", 400);
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            return ApiResponse.error(res, "User not found.", 404);
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return ApiResponse.error(res, "Incorrect current password.", 400);
        }

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        return ApiResponse.success(
            res,
            null,
            "Password changed successfully."
        );
    } catch (err) {
        next(err);
    }
};
