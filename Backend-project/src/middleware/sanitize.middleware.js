/**
 * Middleware to sanitize user input and prevent MongoDB operator / NoSQL injection.
 * Compatible with Express 5 (mutates objects in place rather than reassigning getters).
 */
const cleanInPlace = (obj) => {
    if (!obj || typeof obj !== "object") return;

    for (const key of Object.keys(obj)) {
        if (key.startsWith("$") || key.includes(".")) {
            delete obj[key];
        } else if (obj[key] && typeof obj[key] === "object") {
            cleanInPlace(obj[key]);
        }
    }
};

export const mongoSanitize = (req, res, next) => {
    if (req.body && typeof req.body === "object") {
        cleanInPlace(req.body);
    }
    if (req.query && typeof req.query === "object") {
        cleanInPlace(req.query);
    }
    if (req.params && typeof req.params === "object") {
        cleanInPlace(req.params);
    }
    next();
};

export default mongoSanitize;
