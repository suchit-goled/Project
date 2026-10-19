import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import env from "../config/env.js";

export const protect = async (req, res, next) => {
    try {
        let token;

        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer")
        ) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Not authorized. Token missing."
            });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, env.jwt_secret);
        } catch (jwtError) {
            if (jwtError.name === "TokenExpiredError") {
                return res.status(401).json({
                    success: false,
                    message: "Token expired. Please log in again."
                });
            }
            return res.status(401).json({
                success: false,
                message: "Invalid token. Authorization denied."
            });
        }

        let user;
        try {
            user = await User.findById(decoded.id).select("-password");
        } catch (dbError) {
            return res.status(401).json({
                success: false,
                message: "Authentication failed. Could not verify user."
            });
        }

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User account no longer exists."
            });
        }

        req.user = user;
        next();

    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Authentication error occurred."
        });
    }
};

export const optionalProtect = async (req, res, next) => {
    try {
        let token;
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer")
        ) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (token) {
            const decoded = jwt.verify(token, env.jwt_secret);
            const user = await User.findById(decoded.id).select("-password");
            if (user) {
                req.user = user;
            }
        }
        next();
    } catch {
        // Continue even if token is invalid or expired
        next();
    }
};