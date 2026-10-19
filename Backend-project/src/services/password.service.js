import bcrypt from "bcryptjs";
import {
    generateResetToken,
    hashResetToken,
} from "../utils/generateResetToken.js";
import passwordRepository from "../repositories/password.repository.js";
import { sendEmail } from "../utils/sendEmail.js";
import env from "../config/env.js";

class PasswordService {

    async forgotPassword(email) {
        if (!email) {
            throw new Error("Email address is required");
        }

        const user = await passwordRepository.findByEmail(email.toLowerCase().trim());

        if (!user) {
            // For security, do not disclose if email exists
            return true;
        }

        const resetToken = generateResetToken();

        user.resetPasswordToken = hashResetToken(resetToken);
        user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

        await passwordRepository.save(user);

        const resetUrl = `${env.frontend_url}/reset-password/${resetToken}`;

        try {
            await sendEmail({
                email: user.email,
                subject: "ElectroNova - Password Reset Request",
                html: `
                    <h2>Password Reset Request</h2>
                    <p>Hello ${user.name || "Customer"},</p>
                    <p>Click the link below to reset your password:</p>
                    <p><a href="${resetUrl}">${resetUrl}</a></p>
                    <p>This link expires in 15 minutes.</p>
                    <p>If you did not request this, please ignore this email.</p>
                `,
            });
        } catch (emailError) {
            console.error("Failed to send password reset email:", emailError.message);
        }

        return true;
    }

    async resetPassword(token, newPassword) {
        if (!token || !newPassword) {
            throw new Error("Reset token and new password are required");
        }

        if (newPassword.length < 6) {
            throw new Error("Password must be at least 6 characters long");
        }

        const hashedToken = hashResetToken(token);
        const user = await passwordRepository.findByResetToken(hashedToken);

        if (!user) {
            throw new Error("Password reset token is invalid or has expired");
        }

        user.password = await bcrypt.hash(newPassword, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await passwordRepository.save(user);
        return true;
    }

}

export default new PasswordService();