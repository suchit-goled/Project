import User from "../models/user.model.js";

class PasswordRepository {

    async findByEmail(email) {
        return await User.findOne({ email });
    }

    async save(user) {
        return await user.save();
    }

    async findByResetToken(token) {
        return await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpire: { $gt: Date.now() },
        });
    }

}

export default new PasswordRepository();