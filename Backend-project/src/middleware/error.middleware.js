import ApiResponse from "../utils/apiResponse.js";
import env from "../config/env.js";

const errorMiddleware = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";
    let errors = err.errors || [];

    // Mongoose Bad ObjectId (CastError)
    if (err.name === "CastError") {
        statusCode = 400;
        message = `Resource not found with id of ${err.value}`;
    }

    // Mongoose Duplicate Key Error
    if (err.code === 11000) {
        statusCode = 400;
        const field = Object.keys(err.keyValue || {})[0] || "field";
        message = `Duplicate value entered for ${field}. Please use another value.`;
    }

    // Mongoose Validation Error
    if (err.name === "ValidationError") {
        statusCode = 400;
        errors = Object.values(err.errors || {}).map((val) => val.message);
        message = errors.join(", ") || "Validation failed";
    }

    // JWT Errors
    if (err.name === "JsonWebTokenError") {
        statusCode = 401;
        message = "Invalid token. Authorization denied.";
    }

    if (err.name === "TokenExpiredError") {
        statusCode = 401;
        message = "Token expired. Please log in again.";
    }

    // Multer Upload Errors
    if (err.name === "MulterError") {
        statusCode = 400;
        if (err.code === "LIMIT_FILE_SIZE") {
            message = "File size exceeds 5MB limit. Please upload a smaller image.";
        } else {
            message = `Upload error: ${err.message}`;
        }
    }

    // In production, sanitize 500 internal errors
    if (statusCode === 500 && env.node_env === "production") {
        message = "Internal Server Error";
    }

    return ApiResponse.error(
        res,
        message,
        statusCode,
        errors
    );
};

export default errorMiddleware;
