import jwt from "jsonwebtoken";
import env from "../config/env.js";

const generateToken = (userId) => {
    return jwt.sign(
        {
            id: userId,
        },
        env.jwt_secret,
        {
            expiresIn: env.jwt_expires_in,
        }
    );
};

export default generateToken;