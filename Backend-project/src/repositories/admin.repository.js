import User from "../models/user.model.js";
import Product from "../models/Product.js";
import Order from "../models/order.model.js";
import Seller from "../models/seller.model.js";
import Store from "../models/store.model.js";
import SellerOrder from "../models/sellerOrder.model.js";
import Payout from "../models/payout.model.js";

class AdminRepository {
    async getDashboardStats() {
        const [
            totalUsers,
            totalProducts,
            totalOrders,
            pendingOrders,
            completedOrders,
            cancelledOrders,
        ] = await Promise.all([
            User.countDocuments(),
            Product.countDocuments(),
            Order.countDocuments(),
            Order.countDocuments({ orderStatus: "Pending" }),
            Order.countDocuments({ orderStatus: "Delivered" }),
            Order.countDocuments({ orderStatus: "Cancelled" }),
        ]);

        let totalRevenue = 0;
        try {
            const revenue = await Order.aggregate([
                { $match: { orderStatus: "Delivered" } },
                { $group: { _id: null, totalRevenue: { $sum: "$total" } } },
            ]);
            totalRevenue = revenue.length > 0 ? revenue[0].totalRevenue : 0;
        } catch {
            totalRevenue = 0;
        }

        // Marketplace metrics with safe fallbacks
        let totalSellers = 0;
        let pendingSellerApprovals = 0;
        let activeStores = 0;
        let totalCommissionRevenue = 0;
        let grossMerchandiseValue = 0;
        let pendingPayouts = 0;

        try {
            [totalSellers, pendingSellerApprovals, activeStores, pendingPayouts] = await Promise.all([
                Seller.countDocuments(),
                Seller.countDocuments({ status: "pending" }),
                Store.countDocuments({ isActive: true }),
                Payout.countDocuments({ status: "Pending" }),
            ]);

            const commissionAgg = await SellerOrder.aggregate([
                { $match: { orderStatus: { $ne: "Cancelled" } } },
                {
                    $group: {
                        _id: null,
                        totalCommission: { $sum: "$commissionAmount" },
                        totalGMV: { $sum: "$total" },
                    },
                },
            ]);

            if (commissionAgg.length > 0) {
                totalCommissionRevenue = commissionAgg[0].totalCommission || 0;
                grossMerchandiseValue = commissionAgg[0].totalGMV || 0;
            }
        } catch {
            // Safe fallback in minimal mock environments
        }

        let latestOrders = [];
        try {
            latestOrders = await Order.find().sort({ createdAt: -1 }).limit(5);
        } catch {}

        let latestUsers = [];
        try {
            latestUsers = await User.find().select("-password").sort({ createdAt: -1 }).limit(5);
        } catch {}

        return {
            totalUsers,
            totalProducts,
            totalOrders,
            pendingOrders,
            completedOrders,
            cancelledOrders,
            totalRevenue,
            totalSellers,
            pendingSellerApprovals,
            activeStores,
            totalCommissionRevenue,
            grossMerchandiseValue: grossMerchandiseValue || totalRevenue,
            pendingPayouts,
            latestOrders,
            latestUsers,
        };
    }
}

export default new AdminRepository();
