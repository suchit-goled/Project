import validator from "validator";
import passwordService from "../services/password.service.js";
import ApiResponse from "../utils/apiResponse.js";

class PasswordController {

    async forgotPassword(req, res, next) {
        try {
            const { email } = req.body || {};

            if (!email || typeof email !== "string" || !email.trim()) {
                return ApiResponse.error(res, "Email is required", 400);
            }

            const normalizedEmail = email.trim().toLowerCase();
            if (normalizedEmail.length > 254 || !validator.isEmail(normalizedEmail)) {
                return ApiResponse.error(res, "Please provide a valid email address.", 400);
            }

            await passwordService.forgotPassword(normalizedEmail);

            return ApiResponse.success(
                res,
                {},
                "If that email is registered, a password reset link has been sent."
            );
        } catch (error) {
            next(error);
        }
    }

    async resetPassword(req, res, next) {
        try {
            const { token, newPassword } = req.body || {};
            const resetToken = token || (req.params && req.params.token);

            if (!resetToken || !newPassword) {
                return ApiResponse.error(res, "Token and new password are required", 400);
            }

            if (typeof resetToken !== "string" || resetToken.length > 200) {
                return ApiResponse.error(res, "Invalid reset token format", 400);
            }

            if (typeof newPassword !== "string" || newPassword.length < 6) {
                return ApiResponse.error(res, "Password must be at least 6 characters long", 400);
            }

            if (newPassword.length > 128) {
                return ApiResponse.error(res, "Password cannot exceed 128 characters", 400);
            }

            await passwordService.resetPassword(resetToken, newPassword);

            return ApiResponse.success(
                res,
                {},
                "Password has been reset successfully. You can now log in."
            );
        } catch (error) {
            return ApiResponse.error(res, error.message, 400);
        }
    }

}

export default new PasswordController();
