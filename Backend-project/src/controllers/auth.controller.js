import authService from "../services/auth.service.js";
import ApiResponse from "../utils/apiResponse.js";

// Register / Signup Handler
export const registerUser = async (req, res, next) => {
    try {
        const result = await authService.register(req.body);

        return ApiResponse.success(
            res,
            result,
            "User registered successfully",
            201
        );
    } catch (error) {
        next(error);
    }
};

// Alias for registerUser to support both /signup and /register
export const signup = registerUser;

// Login Handler
export const loginUser = async (req, res, next) => {
    try {
        const result = await authService.login(req.body);

        return res.status(200).json({
            success: true,
            message: "Login successful",
            token: result.token,
            user: result.user
        });
    } catch (error) {
        next(error);
    }
};

// Get Profile Handler
export const getProfile = async (req, res, next) => {
    try {
        const user = await authService.getProfile(req.user._id);

        return ApiResponse.success(
            res,
            { user },
            "Profile retrieved successfully"
        );
    } catch (error) {
        next(error);
    }
};