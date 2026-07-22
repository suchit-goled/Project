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

        const decoded = jwt.verify(token, env.jwt_secret);

        const user = await User.findById(decoded.id).select("-password");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found"
            });
        }

        req.user = user;

        console.log("Authenticated User:", req.user);

        next();

    } catch (error) {
        console.error(error);

        res.status(401).json({
            success: false,
            message: error.message
        });
    }
};