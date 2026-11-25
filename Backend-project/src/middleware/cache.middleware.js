import cacheService from "../cache/cacheService.js";

/**
 * Reusable Express Caching Middleware for Hot Read Endpoints
 * 
 * @param {number} ttlSeconds - Duration in seconds to keep response cached
 * @param {Function} [customKeyGen] - Optional custom key generator function (req) => string
 */
export const cacheResponse = (ttlSeconds = 300, customKeyGen = null) => {
    return (req, res, next) => {
        // Only cache idempotent GET requests
        if (req.method !== "GET") {
            return next();
        }

        // Allow bypassing cache via header for debugging/admin: Cache-Control: no-cache
        if (req.headers["cache-control"] === "no-cache" || req.headers["x-skip-cache"] === "true") {
            res.setHeader("X-Cache", "BYPASS");
            return next();
        }

        const cacheKey = customKeyGen
            ? customKeyGen(req)
            : `http:${req.baseUrl || ""}${req.path}?${new URLSearchParams(req.query || {}).toString()}`;

        const cachedData = cacheService.get(cacheKey);

        if (cachedData !== null) {
            res.setHeader("X-Cache", "HIT");
            res.setHeader("X-Cache-TTL", `${ttlSeconds}s`);
            return res.status(200).json(cachedData);
        }

        res.setHeader("X-Cache", "MISS");

        // Hook into res.json to capture and cache successful responses
        const originalJson = res.json.bind(res);
        res.json = (body) => {
            if (res.statusCode === 200 && body) {
                cacheService.set(cacheKey, body, ttlSeconds);
            }
            return originalJson(body);
        };

        next();
    };
};

export default cacheResponse;
