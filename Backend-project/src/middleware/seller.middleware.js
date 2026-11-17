import Seller from "../models/seller.model.js";
import Store from "../models/store.model.js";

/**
 * Middleware ensuring the authenticated user is an authorized seller or admin.
 * Attaches req.seller and req.store for strict multi-tenant isolation.
 */
export const sellerOnly = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required."
            });
        }

        const isPlatformAdmin = req.user.role === "admin" || req.user.role === "superadmin";

        // Admin override with fallback context
        if (isPlatformAdmin && req.query.sellerId) {
            const seller = await Seller.findOne({ userId: req.query.sellerId });
            const store = await Store.findOne({ sellerId: req.query.sellerId });
            req.seller = seller;
            req.store = store;
            req.isAdmin = true;
            return next();
        }

        if (req.user.role !== "seller" && !isPlatformAdmin) {
            return res.status(403).json({
                success: false,
                message: "Access denied. Seller account privileges required."
            });
        }

        // Find seller profile
        const seller = await Seller.findOne({ userId: req.user._id });
        if (!seller) {
            return res.status(404).json({
                success: false,
                message: "Seller profile not found. Please complete seller registration."
            });
        }

        if (seller.status === "suspended") {
            return res.status(403).json({
                success: false,
                message: "Your seller store has been suspended. Please contact ElectroNova compliance."
            });
        }

        // Find store
        let store = await Store.findOne({
            $or: [
                { sellerId: req.user._id },
                { sellerProfileId: seller._id },
            ]
        });

        req.seller = seller;
        req.store = store;
        req.isAdmin = isPlatformAdmin;

        next();
    } catch (err) {
        console.error("Seller middleware error:", err);
        return res.status(500).json({
            success: false,
            message: "Internal server error during seller authorization check."
        });
    }
};

/**
 * Checks if seller is verified/approved before allowing mutations like product creation.
 */
export const verifiedSellerOnly = (req, res, next) => {
    if (req.isAdmin) return next();

    if (!req.seller || (req.seller.status !== "approved" && !req.seller.isVerified)) {
        return res.status(403).json({
            success: false,
            message: "Seller account is pending administrative verification and approval."
        });
    }

    next();
};
