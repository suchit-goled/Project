import User from "../models/user.model.js";
import AppError from "../utils/AppError.js";

class ProfileService {
    async getProfile(userId) {
        const user = await User.findById(userId).select("-password -resetPasswordToken -resetPasswordExpire");
        if (!user) {
            throw new AppError("User not found", 404);
        }
        return user;
    }

    async updateProfile(userId, updateData) {
        const user = await User.findById(userId);
        if (!user) {
            throw new AppError("User not found", 404);
        }

        const allowedFields = ["name", "phone", "address", "city", "state", "pincode", "profileImage"];
        for (const field of allowedFields) {
            if (updateData[field] !== undefined) {
                user[field] = typeof updateData[field] === "string" ? updateData[field].trim() : updateData[field];
            }
        }

        await user.save();
        return await User.findById(userId).select("-password -resetPasswordToken -resetPasswordExpire");
    }
}

export default new ProfileService();
