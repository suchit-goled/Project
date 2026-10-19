import passwordService from "../services/password.service.js";
import ApiResponse from "../utils/apiResponse.js";

class PasswordController {

    async forgotPassword(req, res, next) {
        try {
            const { email } = req.body;

            if (!email) {
                return ApiResponse.error(res, "Email is required", 400);
            }

            await passwordService.forgotPassword(email);

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
            const { token, newPassword } = req.body;
            const resetToken = token || req.params.token;

            if (!resetToken || !newPassword) {
                return ApiResponse.error(res, "Token and new password are required", 400);
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