import ApiResponse from "../utils/apiResponse.js";

const errorMiddleware = (err, req, res, next) => {

    const statusCode = err.statusCode || 500;

    return ApiResponse.error(
        res,
        err.message,
        statusCode
    );

};

export default errorMiddleware;