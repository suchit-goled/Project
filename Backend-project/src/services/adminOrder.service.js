import adminOrderRepository from "../repositories/adminOrder.repository.js";

class AdminOrderService {

    async getAllOrders(status) {
        return await adminOrderRepository.getAllOrders(status);
    }

    async updateOrderStatus(orderId, orderStatus) {

        const validStatus = [
            "Pending",
            "Confirmed",
            "Packed",
            "Shipped",
            "Out for Delivery",
            "Delivered",
            "Cancelled"
        ];

        if (!validStatus.includes(orderStatus)) {
            throw new Error("Invalid order status");
        }

        return await adminOrderRepository.updateOrderStatus(
            orderId,
            orderStatus
        );

    }

}

export default new AdminOrderService();