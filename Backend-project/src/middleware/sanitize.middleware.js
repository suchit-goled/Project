/**
 * Middleware to sanitize user input and prevent MongoDB operator / NoSQL injection,
 * Prototype Pollution, and null-byte injection attacks.
 * Compatible with Express 5 (mutates objects in place rather than reassigning getters).
 */
const forbiddenKeys = new Set([
    "__proto__",
    "constructor",
    "prototype",
    "__defineGetter__",
    "__defineSetter__",
    "__lookupGetter__",
    "__lookupSetter__"
]);

const cleanInPlace = (obj) => {
    if (!obj || typeof obj !== "object") return;

    if (Array.isArray(obj)) {
        for (let i = 0; i < obj.length; i++) {
            if (typeof obj[i] === "string" && obj[i].includes("\0")) {
                obj[i] = obj[i].replace(/\0/g, "");
            } else if (obj[i] && typeof obj[i] === "object") {
                cleanInPlace(obj[i]);
            }
        }
        return;
    }

    for (const key of Object.keys(obj)) {
        if (
            key.startsWith("$") ||
            key.includes(".") ||
            forbiddenKeys.has(key)
        ) {
            delete obj[key];
        } else if (typeof obj[key] === "string" && obj[key].includes("\0")) {
            obj[key] = obj[key].replace(/\0/g, "");
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
