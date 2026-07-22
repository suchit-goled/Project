import User from "../models/user.model.js";
import Product from "../models/Product.js";
import Order from "../models/order.model.js";

class AdminRepository {

    async getDashboardStats() {

        const [
            totalUsers,
            totalProducts,
            totalOrders,
            pendingOrders,
            completedOrders,
            cancelledOrders
        ] = await Promise.all([

            User.countDocuments(),

            Product.countDocuments(),

            Order.countDocuments(),

            Order.countDocuments({
                orderStatus: "Pending"
            }),

            Order.countDocuments({
                orderStatus: "Delivered"
            }),

            Order.countDocuments({
                orderStatus: "Cancelled"
            }),

        ]);

        const revenue = await Order.aggregate([
            {
                $match: {
                    orderStatus: "Delivered"
                }
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: {
                        $sum: "$total"
                    }
                }
            }
        ]);

        const latestOrders = await Order.find()
            .sort({ createdAt: -1 })
            .limit(5);

        const latestUsers = await User.find()
            .select("-password")
            .sort({ createdAt: -1 })
            .limit(5);

        return {

            totalUsers,

            totalProducts,

            totalOrders,

            pendingOrders,

            completedOrders,

            cancelledOrders,

            totalRevenue:
                revenue.length > 0
                    ? revenue[0].totalRevenue
                    : 0,

            latestOrders,

            latestUsers,

        };

    }

}

export default new AdminRepository();