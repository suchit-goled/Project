import mongoose from "mongoose";
import Shipment from "../models/shipment.model.js";
import SellerOrder from "../models/sellerOrder.model.js";
import orderModel from "../models/order.model.js";
import AuditLog from "../models/auditLog.model.js";

class ShipmentService {
    /**
     * Map shipment status to SellerOrder status
     */
    mapShipmentToOrderStatus(shipmentStatus) {
        switch (shipmentStatus) {
            case "Picked Up":
                return "Packed";
            case "In Transit":
                return "Dispatched";
            case "Out for Delivery":
                return "Out for Delivery";
            case "Delivered":
                return "Delivered";
            case "Returned":
                return "Returned";
            default:
                return "Confirmed";
        }
    }

    /**
     * Create or update shipment with tracking details and timeline
     */
    async createOrUpdateShipment({
        sellerOrderId,
        carrier = "ElectroNova Logistics",
        trackingNumber = "",
        deliveryMethod = "platform",
        currentStatus = "Created",
        note = "",
        location = "",
        originAddress = null,
        destinationAddress = null,
        estimatedDelivery = null,
        updatedBy = null,
    }) {
        if (!sellerOrderId || !mongoose.isValidObjectId(sellerOrderId)) {
            throw new Error("Valid sellerOrderId is required");
        }

        const sellerOrder = await SellerOrder.findById(sellerOrderId);
        if (!sellerOrder) {
            throw new Error("Seller order not found");
        }

        const parentOrder = await orderModel.findById(sellerOrder.parentOrderId);

        // Generate tracking number if empty
        const effectiveTrackingNumber = trackingNumber.trim() ||
            sellerOrder.trackingNumber ||
            `EN-TRK-${Date.now().toString().slice(-8)}-${Math.floor(100 + Math.random() * 900)}`;

        let shipment = await Shipment.findOne({ sellerOrderId });

        if (!shipment) {
            shipment = new Shipment({
                sellerOrderId,
                parentOrderId: sellerOrder.parentOrderId,
                carrier: carrier || "ElectroNova Logistics",
                trackingNumber: effectiveTrackingNumber,
                deliveryMethod: deliveryMethod || sellerOrder.deliveryMethod || "platform",
                originAddress: originAddress || {},
                destinationAddress: destinationAddress || parentOrder?.shippingAddress || sellerOrder.shippingAddress || {},
                currentStatus,
                estimatedDelivery: estimatedDelivery || new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
                events: [
                    {
                        status: currentStatus,
                        location: location || "Fulfillment Center",
                        timestamp: new Date(),
                        description: note || `Shipment initialized via ${carrier}`,
                    },
                ],
            });
        } else {
            shipment.carrier = carrier || shipment.carrier;
            shipment.trackingNumber = effectiveTrackingNumber;
            shipment.deliveryMethod = deliveryMethod || shipment.deliveryMethod;
            shipment.currentStatus = currentStatus;
            if (estimatedDelivery) shipment.estimatedDelivery = estimatedDelivery;
            if (currentStatus === "Delivered") shipment.deliveredAt = new Date();

            shipment.events.push({
                status: currentStatus,
                location: location || "",
                timestamp: new Date(),
                description: note || `Shipment status updated to ${currentStatus}`,
            });
        }

        await shipment.save();

        // Sync to SellerOrder
        const mappedOrderStatus = this.mapShipmentToOrderStatus(currentStatus);
        sellerOrder.trackingNumber = effectiveTrackingNumber;
        sellerOrder.courierPartner = carrier;
        sellerOrder.orderStatus = mappedOrderStatus;

        if (!Array.isArray(sellerOrder.shipmentTimeline)) {
            sellerOrder.shipmentTimeline = [];
        }
        sellerOrder.shipmentTimeline.push({
            status: mappedOrderStatus,
            timestamp: new Date(),
            note: note || `Package status: ${currentStatus} (${carrier})`,
            location,
        });

        if (mappedOrderStatus === "Delivered") {
            sellerOrder.deliveredAt = new Date();
        }

        await sellerOrder.save();

        // Auto-synchronize Parent Order Status
        if (parentOrder) {
            const siblingSellerOrders = await SellerOrder.find({
                parentOrderId: sellerOrder.parentOrderId,
            });

            const allDelivered = siblingSellerOrders.every((so) => so.orderStatus === "Delivered");
            const allCancelled = siblingSellerOrders.every((so) => so.orderStatus === "Cancelled");
            const anyInTransit = siblingSellerOrders.some((so) =>
                ["Packed", "Dispatched", "In Transit", "Out for Delivery"].includes(so.orderStatus)
            );

            if (allDelivered) {
                parentOrder.orderStatus = "Delivered";
                await parentOrder.save();
            } else if (allCancelled) {
                parentOrder.orderStatus = "Cancelled";
                await parentOrder.save();
            } else if (anyInTransit && parentOrder.orderStatus !== "Delivered") {
                parentOrder.orderStatus = "Shipped";
                await parentOrder.save();
            }
        }

        // Audit Log
        if (updatedBy) {
            try {
                await AuditLog.create({
                    action: "SHIPMENT_STATUS_UPDATE",
                    actor: { userId: updatedBy, role: "seller" },
                    target: { model: "Shipment", id: shipment._id },
                    details: { trackingNumber: effectiveTrackingNumber, status: currentStatus },
                });
            } catch {}
        }

        return shipment;
    }

    /**
     * Public shipment tracking by tracking number
     */
    async getShipmentByTracking(trackingNumber) {
        if (!trackingNumber || typeof trackingNumber !== "string") {
            throw new Error("Tracking number is required");
        }

        const shipment = await Shipment.findOne({
            trackingNumber: trackingNumber.trim(),
        })
            .populate({
                path: "sellerOrderId",
                select: "sellerOrderNumber products total orderStatus",
                populate: { path: "storeId", select: "name storeName slug rating logo" },
            });

        if (!shipment) {
            return null;
        }

        return shipment;
    }

    /**
     * Get all shipments for a parent order
     */
    async getShipmentsByOrderId(parentOrderId) {
        if (!parentOrderId || !mongoose.isValidObjectId(parentOrderId)) {
            throw new Error("Invalid parent order ID format");
        }

        return Shipment.find({ parentOrderId })
            .populate({
                path: "sellerOrderId",
                select: "sellerOrderNumber products total orderStatus",
                populate: { path: "storeId", select: "name storeName slug rating logo" },
            })
            .sort({ createdAt: -1 });
    }
}

export default new ShipmentService();
