import mongoose from "mongoose";
import Commission from "../models/commission.model.js";
import Payout from "../models/payout.model.js";
import SellerOrder from "../models/sellerOrder.model.js";
import Seller from "../models/seller.model.js";
import Store from "../models/store.model.js";
import AuditLog from "../models/auditLog.model.js";

class CommissionService {
    /**
     * Get or initialize marketplace commission configuration
     */
    async getCommissionSettings() {
        let settings = await Commission.findOne();
        if (!settings) {
            settings = await Commission.create({
                defaultRate: 5.0,
                categoryRates: [
                    { category: "Smartphones", rate: 5.0 },
                    { category: "Laptops", rate: 6.0 },
                    { category: "Headphones", rate: 8.0 },
                    { category: "Gaming Accessories", rate: 9.0 },
                    { category: "Mobile Accessories", rate: 12.0 },
                    { category: "Home Electronics", rate: 7.0 },
                ],
                sellerRates: [],
                notes: "Initial ElectroNova platform commission policy",
            });
        }
        return settings;
    }

    /**
     * Update default platform commission percentage
     */
    async updateDefaultRate(rate, adminUserId) {
        const numRate = Number(rate);
        if (isNaN(numRate) || numRate < 0 || numRate > 100) {
            throw new Error("Commission rate must be a number between 0 and 100");
        }

        const settings = await this.getCommissionSettings();
        settings.defaultRate = numRate;
        if (adminUserId && mongoose.isValidObjectId(adminUserId)) {
            settings.updatedBy = adminUserId;
        }
        await settings.save();

        try {
            await AuditLog.create({
                action: "COMMISSION_DEFAULT_RATE_UPDATED",
                actor: { userId: adminUserId, role: "admin" },
                target: { model: "Commission", id: settings._id },
                details: { newDefaultRate: numRate },
            });
        } catch {
            // Non-blocking audit log
        }

        return settings;
    }

    /**
     * Set or update category-specific commission rate
     */
    async setCategoryRate(category, rate, adminUserId) {
        if (!category || typeof category !== "string" || !category.trim()) {
            throw new Error("Category name is required");
        }
        const numRate = Number(rate);
        if (isNaN(numRate) || numRate < 0 || numRate > 100) {
            throw new Error("Commission rate must be a number between 0 and 100");
        }

        const settings = await this.getCommissionSettings();
        const catTrimmed = category.trim();

        const existingIndex = settings.categoryRates.findIndex(
            (cr) => cr.category.toLowerCase() === catTrimmed.toLowerCase()
        );

        if (existingIndex >= 0) {
            settings.categoryRates[existingIndex].rate = numRate;
            settings.categoryRates[existingIndex].category = catTrimmed;
        } else {
            settings.categoryRates.push({ category: catTrimmed, rate: numRate });
        }

        if (adminUserId && mongoose.isValidObjectId(adminUserId)) {
            settings.updatedBy = adminUserId;
        }
        await settings.save();

        try {
            await AuditLog.create({
                action: "COMMISSION_CATEGORY_RATE_UPDATED",
                actor: { userId: adminUserId, role: "admin" },
                target: { model: "Commission", id: settings._id },
                details: { category: catTrimmed, rate: numRate },
            });
        } catch {}

        return settings;
    }

    /**
     * Delete a category-specific commission rate
     */
    async deleteCategoryRate(category, adminUserId) {
        const settings = await this.getCommissionSettings();
        settings.categoryRates = settings.categoryRates.filter(
            (cr) => cr.category.toLowerCase() !== category.trim().toLowerCase()
        );
        if (adminUserId && mongoose.isValidObjectId(adminUserId)) {
            settings.updatedBy = adminUserId;
        }
        await settings.save();
        return settings;
    }

    /**
     * Set or update seller-specific commission rate override
     */
    async setSellerRate(sellerId, rate, adminUserId) {
        if (!sellerId || !mongoose.isValidObjectId(sellerId)) {
            throw new Error("Valid seller user ID is required");
        }
        const numRate = Number(rate);
        if (isNaN(numRate) || numRate < 0 || numRate > 100) {
            throw new Error("Commission rate must be a number between 0 and 100");
        }

        const settings = await this.getCommissionSettings();
        const existingIndex = settings.sellerRates.findIndex(
            (sr) => String(sr.sellerId) === String(sellerId)
        );

        if (existingIndex >= 0) {
            settings.sellerRates[existingIndex].rate = numRate;
        } else {
            settings.sellerRates.push({ sellerId, rate: numRate });
        }

        if (adminUserId && mongoose.isValidObjectId(adminUserId)) {
            settings.updatedBy = adminUserId;
        }
        await settings.save();

        // Also sync override to Seller model
        try {
            await Seller.findOneAndUpdate(
                { userId: sellerId },
                { commissionRateOverride: numRate }
            );
        } catch {}

        try {
            await AuditLog.create({
                action: "COMMISSION_SELLER_RATE_UPDATED",
                actor: { userId: adminUserId, role: "admin" },
                target: { model: "Commission", id: settings._id },
                details: { sellerId, rate: numRate },
            });
        } catch {}

        return settings;
    }

    /**
     * Resolve effective commission rate for an order item/group using priority hierarchy:
     * 1. Seller override (Seller model or Commission.sellerRates)
     * 2. Category rate (Commission.categoryRates)
     * 3. Platform default rate (Commission.defaultRate or 5.0)
     */
    async resolveCommissionRate({ sellerId, category, sellerProfile = null }) {
        let settings = null;
        try {
            settings = await this.getCommissionSettings();
        } catch {
            settings = { defaultRate: 5.0, categoryRates: [], sellerRates: [] };
        }

        // 1. Check seller override
        if (sellerProfile && sellerProfile.commissionRateOverride !== null && sellerProfile.commissionRateOverride !== undefined) {
            return Number(sellerProfile.commissionRateOverride);
        }

        if (sellerId && settings?.sellerRates?.length > 0) {
            const sellerMatch = settings.sellerRates.find(
                (sr) => String(sr.sellerId) === String(sellerId)
            );
            if (sellerMatch) return Number(sellerMatch.rate);
        }

        // 2. Check category rate
        if (category && settings?.categoryRates?.length > 0) {
            const catMatch = settings.categoryRates.find(
                (cr) => cr.category.toLowerCase() === String(category).trim().toLowerCase()
            );
            if (catMatch) return Number(catMatch.rate);
        }

        // 3. Fallback to platform default rate
        return settings?.defaultRate !== undefined ? Number(settings.defaultRate) : 5.0;
    }

    /**
     * Get aggregate marketplace commission and revenue metrics
     */
    async getCommissionReports({ startDate, endDate, sellerId } = {}) {
        const match = { orderStatus: { $ne: "Cancelled" } };

        if (sellerId && mongoose.isValidObjectId(sellerId)) {
            match.sellerId = new mongoose.Types.ObjectId(sellerId);
        }

        if (startDate || endDate) {
            match.createdAt = {};
            if (startDate) match.createdAt.$gte = new Date(startDate);
            if (endDate) match.createdAt.$lte = new Date(endDate);
        }

        let aggregateResult = [];
        try {
            aggregateResult = await SellerOrder.aggregate([
                { $match: match },
                {
                    $group: {
                        _id: null,
                        totalGMV: { $sum: "$total" },
                        totalGrossSales: { $sum: "$subtotal" },
                        totalCommissionEarned: { $sum: "$commissionAmount" },
                        totalSellerEarnings: { $sum: "$sellerEarnings" },
                        totalOrders: { $sum: 1 },
                        averageCommissionRate: { $avg: "$commissionRate" },
                    },
                },
            ]);
        } catch {
            aggregateResult = [];
        }

        const metrics = aggregateResult.length > 0 ? aggregateResult[0] : {
            totalGMV: 0,
            totalGrossSales: 0,
            totalCommissionEarned: 0,
            totalSellerEarnings: 0,
            totalOrders: 0,
            averageCommissionRate: 5.0,
        };

        // Category breakdown
        let categoryBreakdown = [];
        try {
            categoryBreakdown = await SellerOrder.aggregate([
                { $match: match },
                { $unwind: "$products" },
                {
                    $group: {
                        _id: "$products.brand",
                        totalSales: { $sum: { $multiply: ["$products.price", "$products.quantity"] } },
                        itemCount: { $sum: "$products.quantity" },
                    },
                },
                { $sort: { totalSales: -1 } },
                { $limit: 8 },
            ]);
        } catch {
            categoryBreakdown = [];
        }

        return {
            summary: {
                totalGMV: metrics.totalGMV,
                totalGrossSales: metrics.totalGrossSales,
                totalCommissionEarned: metrics.totalCommissionEarned,
                totalSellerEarnings: metrics.totalSellerEarnings,
                totalOrders: metrics.totalOrders,
                averageCommissionRate: Number((metrics.averageCommissionRate || 5.0).toFixed(2)),
            },
            categoryBreakdown,
        };
    }

    /**
     * Get Payouts list
     */
    async getPayouts({ sellerId, status, page = 1, limit = 20 } = {}) {
        const filter = {};
        if (sellerId && mongoose.isValidObjectId(sellerId)) {
            filter.sellerId = sellerId;
        }
        if (status && status !== "all") {
            filter.status = status;
        }

        const validPage = Math.max(1, Number(page) || 1);
        const validLimit = Math.max(1, Math.min(100, Number(limit) || 20));

        let query = Payout.find(filter)
            .sort({ createdAt: -1 })
            .skip((validPage - 1) * validLimit)
            .limit(validLimit);

        if (typeof query.populate === "function") {
            query = query
                .populate("sellerId", "name email")
                .populate("storeId", "name storeName slug");
        }

        const [payouts, total] = await Promise.all([
            query,
            Payout.countDocuments(filter),
        ]);

        return {
            payouts,
            total,
            page: validPage,
            totalPages: Math.ceil(total / validLimit) || 1,
        };
    }

    /**
     * Generate a new payout cycle for a seller
     */
    async generatePayout({ sellerId, periodStart, periodEnd, remarks = "", adminUserId = null }) {
        if (!sellerId || !mongoose.isValidObjectId(sellerId)) {
            throw new Error("Valid seller user ID is required");
        }

        const pStart = periodStart ? new Date(periodStart) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const pEnd = periodEnd ? new Date(periodEnd) : new Date();

        // Find delivered orders within period that are not already settled in another completed payout
        const eligibleOrders = await SellerOrder.find({
            sellerId,
            orderStatus: "Delivered",
            createdAt: { $gte: pStart, $lte: pEnd },
        });

        if (!eligibleOrders || eligibleOrders.length === 0) {
            throw new Error("No eligible delivered orders found for this settlement period");
        }

        const store = await Store.findOne({ sellerId });
        const seller = await Seller.findOne({ userId: sellerId });

        let grossSales = 0;
        let commissionDeducted = 0;
        let netAmount = 0;

        for (const order of eligibleOrders) {
            grossSales += Number(order.subtotal || 0);
            commissionDeducted += Number(order.commissionAmount || 0);
            netAmount += Number(order.sellerEarnings || 0);
        }

        const payoutNumber = `PAY-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

        const payout = await Payout.create({
            payoutNumber,
            sellerId,
            storeId: store?._id,
            grossSales,
            commissionDeducted,
            netAmount,
            orderCount: eligibleOrders.length,
            sellerOrders: eligibleOrders.map((o) => o._id),
            periodStart: pStart,
            periodEnd: pEnd,
            status: "Pending",
            bankDetails: seller?.bankDetails || {},
            remarks,
        });

        if (adminUserId) {
            try {
                await AuditLog.create({
                    action: "PAYOUT_GENERATED",
                    actor: { userId: adminUserId, role: "admin" },
                    target: { model: "Payout", id: payout._id },
                    details: { payoutNumber, netAmount, orderCount: eligibleOrders.length },
                });
            } catch {}
        }

        return payout;
    }

    /**
     * Update payout status (Pending -> Processing -> Completed -> Failed)
     */
    async updatePayoutStatus(payoutId, { status, transactionReference = "", remarks = "" }, adminUserId = null) {
        if (!payoutId || !mongoose.isValidObjectId(payoutId)) {
            throw new Error("Invalid payout ID format");
        }

        const allowed = ["Pending", "Processing", "Completed", "Failed"];
        if (!allowed.includes(status)) {
            throw new Error(`Invalid status. Allowed: ${allowed.join(", ")}`);
        }

        const payout = await Payout.findById(payoutId);
        if (!payout) {
            throw new Error("Payout record not found");
        }

        payout.status = status;
        if (transactionReference) payout.transactionReference = transactionReference;
        if (remarks) payout.remarks = remarks;
        if (status === "Completed") {
            payout.processedAt = new Date();
            if (adminUserId && mongoose.isValidObjectId(adminUserId)) {
                payout.processedBy = adminUserId;
            }
        }

        await payout.save();

        if (adminUserId) {
            try {
                await AuditLog.create({
                    action: "PAYOUT_STATUS_UPDATED",
                    actor: { userId: adminUserId, role: "admin" },
                    target: { model: "Payout", id: payout._id },
                    details: { newStatus: status, transactionReference },
                });
            } catch {}
        }

        return payout;
    }
}

export default new CommissionService();
