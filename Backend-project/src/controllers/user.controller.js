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

        if (name !== undefined) user.name = name.trim();
        if (phone !== undefined) user.phone = phone.trim();
        if (address !== undefined) user.address = address.trim();
        if (city !== undefined) user.city = city.trim();
        if (state !== undefined) user.state = state.trim();
        if (pincode !== undefined) user.pincode = pincode.trim();

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