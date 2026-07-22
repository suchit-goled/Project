import {
    generateResetToken,
    hashResetToken,
} from "../utils/generateResetToken.js";

import passwordRepository from "../repositories/password.repository.js";
import { sendEmail } from "../utils/sendEmail.js";

class PasswordService {

    async forgotPassword(email) {

        const user = await passwordRepository.findByEmail(email);

        if (!user) {
            throw new Error("User not found");
        }

        const resetToken = generateResetToken();

        user.resetPasswordToken = hashResetToken(resetToken);
        user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

        await passwordRepository.save(user);

        const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

        await sendEmail({
            email: user.email,
            subject: "Password Reset",
            html: `
                <h2>Password Reset</h2>
                <p>Click the link below to reset your password:</p>
                <a href="${resetUrl}">${resetUrl}</a>
                <p>This link expires in 15 minutes.</p>
            `,
        });

        return true;
    }

}

export default new PasswordService();