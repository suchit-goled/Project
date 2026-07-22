import passwordService from "../services/password.service.js";
import ApiResponse from "../utils/apiResponse.js";

class PasswordController {

    async forgotPassword(req, res, next) {

        try {

            const { email } = req.body;

            await passwordService.forgotPassword(email);

            return ApiResponse.success(
                res,
                {},
                "Password reset email sent successfully."
            );

        } catch (error) {
            next(error);
        }

    }

}

export default new PasswordController();