import validator from "validator";
import ApiResponse from "../utils/apiResponse.js";

/**
 * Higher-order middleware factory for request validation.
 * @param {Object} schema - Key-value pair of field names and their validator rules.
 */
export const validate = (schema) => {
    return (req, res, next) => {
        const errors = [];
        const source = req.method === "GET" ? req.query : req.body;

        for (const [field, rules] of Object.entries(schema)) {
            const value = source[field];

            if (rules.required && (value === undefined || value === null || value === "")) {
                errors.push(`${field} is required.`);
                continue;
            }

            if (value !== undefined && value !== null && value !== "") {
                if (rules.isEmail && !validator.isEmail(String(value))) {
                    errors.push(`${field} must be a valid email address.`);
                }

                if (rules.minLength && String(value).length < rules.minLength) {
                    errors.push(`${field} must be at least ${rules.minLength} characters long.`);
                }

                if (rules.isNumeric && isNaN(Number(value))) {
                    errors.push(`${field} must be a valid number.`);
                }

                if (rules.min !== undefined && Number(value) < rules.min) {
                    errors.push(`${field} must be at least ${rules.min}.`);
                }

                if (rules.max !== undefined && Number(value) > rules.max) {
                    errors.push(`${field} cannot exceed ${rules.max}.`);
                }
            }
        }

        if (errors.length > 0) {
            return ApiResponse.error(res, "Validation failed", 400, errors);
        }

        next();
    };
};

export default validate;
