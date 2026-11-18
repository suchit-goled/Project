import commissionService from "../services/commission.service.js";
import ApiResponse from "../utils/apiResponse.js";

class CommissionController {
    /**
     * GET /api/admin/commission
     * Retrieve current platform commission settings
     */
    async getSettings(req, res, next) {
        try {
            const settings = await commissionService.getCommissionSettings();
            return ApiResponse.success(res, settings, "Commission settings retrieved successfully.");
        } catch (error) {
            next(error);
        }
    }

    /**
     * PUT /api/admin/commission/default
     * Update platform default commission rate
     */
    async updateDefaultRate(req, res, next) {
        try {
            const { defaultRate } = req.body;
            const numRate = Number(defaultRate);
            if (defaultRate === undefined || isNaN(numRate) || numRate < 0 || numRate > 100) {
                return ApiResponse.error(res, "defaultRate must be a valid number between 0 and 100", 400);
            }

            const updated = await commissionService.updateDefaultRate(numRate, req.user._id);
            return ApiResponse.success(res, updated, "Platform default commission rate updated.");
        } catch (error) {
            next(error);
        }
    }

    /**
     * PUT /api/admin/commission/category
     * Set or update category-specific commission rate
     */
    async setCategoryRate(req, res, next) {
        try {
            const { category, rate } = req.body;
            if (!category || typeof category !== "string") {
                return ApiResponse.error(res, "category is required", 400);
            }
            const numRate = Number(rate);
            if (rate === undefined || isNaN(numRate) || numRate < 0 || numRate > 100) {
                return ApiResponse.error(res, "rate must be a valid number between 0 and 100", 400);
            }

            const updated = await commissionService.setCategoryRate(category, numRate, req.user._id);
            return ApiResponse.success(res, updated, `Commission rate set for category '${category}'.`);
        } catch (error) {
            next(error);
        }
    }

    /**
     * DELETE /api/admin/commission/category/:category
     * Remove category commission rate
     */
    async deleteCategoryRate(req, res, next) {
        try {
            const { category } = req.params;
            const updated = await commissionService.deleteCategoryRate(category, req.user._id);
            return ApiResponse.success(res, updated, `Commission rate removed for category '${category}'.`);
        } catch (error) {
            next(error);
        }
    }

    /**
     * PUT /api/admin/commission/seller
     * Set or update individual seller commission override
     */
    async setSellerRate(req, res, next) {
        try {
            const { sellerId, rate } = req.body;
            if (!sellerId) {
                return ApiResponse.error(res, "sellerId is required", 400);
            }
            const numRate = Number(rate);
            if (rate === undefined || isNaN(numRate) || numRate < 0 || numRate > 100) {
                return ApiResponse.error(res, "rate must be a valid number between 0 and 100", 400);
            }

            const updated = await commissionService.setSellerRate(sellerId, numRate, req.user._id);
            return ApiResponse.success(res, updated, "Seller commission rate override updated.");
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/admin/commission/reports
     * Aggregate marketplace commission, GMV and category metrics
     */
    async getReports(req, res, next) {
        try {
            const { startDate, endDate, sellerId } = req.query;
            const reports = await commissionService.getCommissionReports({
                startDate,
                endDate,
                sellerId,
            });
            return ApiResponse.success(res, reports, "Commission reports generated successfully.");
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/admin/payouts
     * Super Admin view all payouts with filtering and pagination
     */
    async getAllPayouts(req, res, next) {
        try {
            const { sellerId, status, page, limit } = req.query;
            const result = await commissionService.getPayouts({
                sellerId,
                status,
                page,
                limit,
            });
            return ApiResponse.success(res, result, "Payouts fetched successfully.");
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/admin/payouts/generate
     * Generate a new settlement payout cycle for a seller
     */
    async generatePayout(req, res, next) {
        try {
            const { sellerId, periodStart, periodEnd, remarks } = req.body;
            if (!sellerId) {
                return ApiResponse.error(res, "sellerId is required", 400);
            }

            const payout = await commissionService.generatePayout({
                sellerId,
                periodStart,
                periodEnd,
                remarks,
                adminUserId: req.user._id,
            });

            return ApiResponse.success(res, payout, "Payout settlement generated successfully.", 201);
        } catch (error) {
            next(error);
        }
    }

    /**
     * PUT /api/admin/payouts/:id/status
     * Update payout status (Pending -> Processing -> Completed -> Failed)
     */
    async updatePayoutStatus(req, res, next) {
        try {
            const { id } = req.params;
            const { status, transactionReference, remarks } = req.body;

            if (!status) {
                return ApiResponse.error(res, "status is required", 400);
            }

            const updated = await commissionService.updatePayoutStatus(
                id,
                { status, transactionReference, remarks },
                req.user._id
            );

            return ApiResponse.success(res, updated, `Payout status updated to ${status}.`);
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/seller/payouts
     * Seller self-service view of their own payout statements
     */
    async getSellerPayouts(req, res, next) {
        try {
            const { status, page, limit } = req.query;
            const result = await commissionService.getPayouts({
                sellerId: req.user._id,
                status,
                page,
                limit,
            });
            return ApiResponse.success(res, result, "Seller payouts retrieved successfully.");
        } catch (error) {
            next(error);
        }
    }
}

export default new CommissionController();
