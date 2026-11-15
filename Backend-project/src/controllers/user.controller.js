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
            const trimmedName = String(name).trim().slice(0, 100);
            if (trimmedName.length === 0) {
                return ApiResponse.error(res, "Name cannot be empty", 400);
            }
            user.name = trimmedName;
        }
        if (phone !== undefined) user.phone = String(phone).trim().slice(0, 25);
        if (address !== undefined) user.address = String(address).trim().slice(0, 250);
        if (city !== undefined) user.city = String(city).trim().slice(0, 100);
        if (state !== undefined) user.state = String(state).trim().slice(0, 100);
        if (pincode !== undefined) user.pincode = String(pincode).trim().slice(0, 20);

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

        if (String(newPassword).length > 128) {
            return ApiResponse.error(res, "New password cannot exceed 128 characters.", 400);
        }

        if (currentPassword === newPassword) {
            return ApiResponse.error(res, "New password must be different from current password.", 400);
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
