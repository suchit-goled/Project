import User from "../models/user.model.js";

class UserRepository {
    async findByEmail(email) {
        return await User.findOne({ email: email.toLowerCase().trim() });
    }

    async findById(id) {
        return await User.findById(id).select("-password -resetPasswordToken -resetPasswordExpire");
    }

    async findByIdWithPassword(id) {
        return await User.findById(id);
    }

    async create(userData) {
        return await User.create(userData);
    }

    async updateById(id, updateData) {
        return await User.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    }

    async count(query = {}) {
        return await User.countDocuments(query);
    }
}

export default new UserRepository();
