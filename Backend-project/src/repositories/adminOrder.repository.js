import Order from "../models/order.model.js";

class AdminOrderRepository {

    async getAllOrders(status) {

        const filter = {};

        if (status) {
            filter.orderStatus = status;
        }

        return await Order.find(filter)
            .sort({ createdAt: -1 });

    }

    async updateOrderStatus(orderId, orderStatus) {

        return await Order.findByIdAndUpdate(
            orderId,
            { orderStatus },
            { new: true }
        );

    }

}

export default new AdminOrderRepository();