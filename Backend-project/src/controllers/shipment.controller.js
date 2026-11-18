import shipmentService from "../services/shipment.service.js";
import ApiResponse from "../utils/apiResponse.js";
import SellerOrder from "../models/sellerOrder.model.js";

class ShipmentController {
    /**
     * GET /api/shipments/track/:trackingNumber
     * Public shipment tracking lookup
     */
    async trackShipment(req, res, next) {
        try {
            const { trackingNumber } = req.params;
            const shipment = await shipmentService.getShipmentByTracking(trackingNumber);

            if (!shipment) {
                return ApiResponse.error(res, "No shipment found for this tracking number", 404);
            }

            return ApiResponse.success(res, shipment, "Shipment details retrieved successfully.");
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/shipments/order/:orderId
     * Retrieve all shipments for a customer's order
     */
    async getOrderShipments(req, res, next) {
        try {
            const { orderId } = req.params;
            const shipments = await shipmentService.getShipmentsByOrderId(orderId);
            return ApiResponse.success(res, shipments, "Order shipments retrieved successfully.");
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/shipments/update
     * Update or create shipment (Seller or Admin)
     */
    async updateShipment(req, res, next) {
        try {
            const {
                sellerOrderId,
                carrier,
                trackingNumber,
                deliveryMethod,
                currentStatus,
                note,
                location,
                estimatedDelivery,
            } = req.body;

            if (!sellerOrderId) {
                return ApiResponse.error(res, "sellerOrderId is required", 400);
            }

            // Tenant isolation check for sellers
            if (req.user.role === "seller") {
                const ownsOrder = await SellerOrder.findOne({
                    _id: sellerOrderId,
                    sellerId: req.user._id,
                });
                if (!ownsOrder) {
                    return ApiResponse.error(res, "Unauthorized: You do not own this seller sub-order.", 403);
                }
            }

            const shipment = await shipmentService.createOrUpdateShipment({
                sellerOrderId,
                carrier,
                trackingNumber,
                deliveryMethod,
                currentStatus,
                note,
                location,
                estimatedDelivery,
                updatedBy: req.user._id,
            });

            return ApiResponse.success(res, shipment, "Shipment updated successfully.");
        } catch (error) {
            next(error);
        }
    }
}

export default new ShipmentController();
