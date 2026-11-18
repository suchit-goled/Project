import { test, describe } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../src/app.js";
import env from "../src/config/env.js";
import User from "../src/models/user.model.js";
import Commission from "../src/models/commission.model.js";
import Payout from "../src/models/payout.model.js";
import Shipment from "../src/models/shipment.model.js";
import SellerOrder from "../src/models/sellerOrder.model.js";
import Seller from "../src/models/seller.model.js";
import Store from "../src/models/store.model.js";
import orderModel from "../src/models/order.model.js";
import commissionService from "../src/services/commission.service.js";
import shipmentService from "../src/services/shipment.service.js";

describe("Phase 6 & 7: Commission Engine, Settlement Ledger & Logistics Tests", () => {
    const adminUserId = "60d0fe4f5311236168a109a1";
    const sellerUserId = "60d0fe4f5311236168a109b1";
    const otherSellerId = "60d0fe4f5311236168a109b2";
    const customerUserId = "60d0fe4f5311236168a109c1";

    const adminToken = jwt.sign(
        { id: adminUserId, role: "admin" },
        env.jwt_secret,
        { expiresIn: "1h" }
    );

    const sellerToken = jwt.sign(
        { id: sellerUserId, role: "seller" },
        env.jwt_secret,
        { expiresIn: "1h" }
    );

    const mockAdmin = {
        _id: adminUserId,
        name: "Super Admin",
        email: "admin@electronova.in",
        role: "admin",
    };

    const mockSeller = {
        _id: sellerUserId,
        name: "Bangalore Electronics",
        email: "seller@bangalore.in",
        role: "seller",
        sellerStatus: "approved",
    };

    const mockUserFind = (id) => {
        let target = null;
        if (String(id) === adminUserId) target = mockAdmin;
        if (String(id) === sellerUserId) target = mockSeller;
        return {
            select: () => Promise.resolve(target),
            then: (resolve) => resolve(target),
        };
    };

    // Backup originals
    const origUserFindById = User.findById;

    test("GET /api/admin/commission returns marketplace commission settings", async () => {
        User.findById = mockUserFind;

        const origFindOne = Commission.findOne;
        Commission.findOne = () => Promise.resolve({
            defaultRate: 5.0,
            categoryRates: [
                { category: "Smartphones", rate: 4.5 },
                { category: "Laptops", rate: 6.0 },
            ],
            sellerRates: [],
        });

        try {
            const res = await request(app)
                .get("/api/admin/commission")
                .set("Authorization", `Bearer ${adminToken}`);

            assert.strictEqual(res.statusCode, 200);
            assert.strictEqual(res.body.success, true);
            assert.strictEqual(res.body.data.defaultRate, 5.0);
            assert.strictEqual(res.body.data.categoryRates.length, 2);
        } finally {
            Commission.findOne = origFindOne;
            User.findById = origUserFindById;
        }
    });

    test("PUT /api/admin/commission/default validates rate (0-100) and updates rate", async () => {
        User.findById = mockUserFind;

        const mockSettings = {
            _id: "60d0fe4f5311236168a109d9",
            defaultRate: 5.0,
            categoryRates: [],
            sellerRates: [],
            save: function () { return Promise.resolve(this); },
        };

        const origFindOne = Commission.findOne;
        Commission.findOne = () => Promise.resolve(mockSettings);

        try {
            // Invalid negative rate
            const resBad = await request(app)
                .put("/api/admin/commission/default")
                .set("Authorization", `Bearer ${adminToken}`)
                .send({ defaultRate: -5 });
            assert.strictEqual(resBad.statusCode, 400);

            // Invalid rate > 100
            const resBad2 = await request(app)
                .put("/api/admin/commission/default")
                .set("Authorization", `Bearer ${adminToken}`)
                .send({ defaultRate: 150 });
            assert.strictEqual(resBad2.statusCode, 400);

            // Valid rate 7.5%
            const resOk = await request(app)
                .put("/api/admin/commission/default")
                .set("Authorization", `Bearer ${adminToken}`)
                .send({ defaultRate: 7.5 });

            assert.strictEqual(resOk.statusCode, 200);
            assert.strictEqual(mockSettings.defaultRate, 7.5);
        } finally {
            Commission.findOne = origFindOne;
            User.findById = origUserFindById;
        }
    });

    test("Commission resolution follows priority hierarchy: Seller Override > Category Rate > Platform Default", async () => {
        const origCommissionFindOne = Commission.findOne;
        Commission.findOne = () => Promise.resolve({
            defaultRate: 5.0,
            categoryRates: [
                { category: "Smartphones", rate: 4.0 },
                { category: "Accessories", rate: 12.0 },
            ],
            sellerRates: [
                { sellerId: sellerUserId, rate: 3.5 },
            ],
        });

        try {
            // Priority 1: Seller profile override
            const rate1 = await commissionService.resolveCommissionRate({
                sellerId: otherSellerId,
                category: "Accessories",
                sellerProfile: { commissionRateOverride: 2.5 },
            });
            assert.strictEqual(rate1, 2.5);

            // Priority 2: SellerRates list override in Commission doc
            const rate2 = await commissionService.resolveCommissionRate({
                sellerId: sellerUserId,
                category: "Accessories",
                sellerProfile: null,
            });
            assert.strictEqual(rate2, 3.5);

            // Priority 3: Category match
            const rate3 = await commissionService.resolveCommissionRate({
                sellerId: otherSellerId,
                category: "Smartphones",
                sellerProfile: null,
            });
            assert.strictEqual(rate3, 4.0);

            // Priority 4: Platform default fallback
            const rate4 = await commissionService.resolveCommissionRate({
                sellerId: otherSellerId,
                category: "UnknownCategory",
                sellerProfile: null,
            });
            assert.strictEqual(rate4, 5.0);
        } finally {
            Commission.findOne = origCommissionFindOne;
        }
    });

    test("GET /api/admin/commission/reports aggregates marketplace metrics", async () => {
        User.findById = mockUserFind;

        const origAggregate = SellerOrder.aggregate;
        SellerOrder.aggregate = (pipeline) => {
            if (pipeline[1] && pipeline[1].$group && pipeline[1].$group._id === null) {
                return Promise.resolve([
                    {
                        totalGMV: 150000,
                        totalGrossSales: 140000,
                        totalCommissionEarned: 8400,
                        totalSellerEarnings: 131600,
                        totalOrders: 12,
                        averageCommissionRate: 6.0,
                    },
                ]);
            }
            return Promise.resolve([
                { _id: "Apple", totalSales: 80000, itemCount: 2 },
            ]);
        };

        try {
            const res = await request(app)
                .get("/api/admin/commission/reports")
                .set("Authorization", `Bearer ${adminToken}`);

            assert.strictEqual(res.statusCode, 200);
            assert.strictEqual(res.body.success, true);
            assert.strictEqual(res.body.data.summary.totalGMV, 150000);
            assert.strictEqual(res.body.data.summary.totalCommissionEarned, 8400);
            assert.strictEqual(res.body.data.summary.totalSellerEarnings, 131600);
        } finally {
            SellerOrder.aggregate = origAggregate;
            User.findById = origUserFindById;
        }
    });

    test("Payout lifecycle: Admin updates payout status and logs transaction reference", async () => {
        User.findById = mockUserFind;

        const mockPayout = {
            _id: "60d0fe4f5311236168a109e1",
            payoutNumber: "PAY-100234-567",
            sellerId: sellerUserId,
            netAmount: 48500,
            status: "Pending",
            save: function () { return Promise.resolve(this); },
        };

        const origPayoutFindById = Payout.findById;
        Payout.findById = () => Promise.resolve(mockPayout);

        try {
            const res = await request(app)
                .put(`/api/admin/payouts/${mockPayout._id}/status`)
                .set("Authorization", `Bearer ${adminToken}`)
                .send({
                    status: "Completed",
                    transactionReference: "NEFT2026111700982",
                    remarks: "Disbursed to HDFC Bank",
                });

            assert.strictEqual(res.statusCode, 200);
            assert.strictEqual(mockPayout.status, "Completed");
            assert.strictEqual(mockPayout.transactionReference, "NEFT2026111700982");
            assert.ok(mockPayout.processedAt);
        } finally {
            Payout.findById = origPayoutFindById;
            User.findById = origUserFindById;
        }
    });

    test("GET /api/seller/payouts returns seller's own payout history with tenant isolation", async () => {
        User.findById = mockUserFind;

        const origSellerFindOne = Seller.findOne;
        const origStoreFindOne = Store.findOne;
        Seller.findOne = () => Promise.resolve({
            _id: "60d0fe4f5311236168a109b3",
            userId: sellerUserId,
            status: "approved",
        });
        Store.findOne = () => Promise.resolve({
            _id: "60d0fe4f5311236168a109b4",
            sellerId: sellerUserId,
            name: "Bangalore Electronics Hub",
        });

        const origPayoutFind = Payout.find;
        const origPayoutCount = Payout.countDocuments;

        Payout.find = (filter) => {
            assert.strictEqual(String(filter.sellerId), sellerUserId);
            return {
                sort: () => ({
                    skip: () => ({
                        limit: () => ({
                            populate: () => ({
                                populate: () => Promise.resolve([
                                    {
                                        _id: "60d0fe4f5311236168a109e2",
                                        payoutNumber: "PAY-998877",
                                        netAmount: 25000,
                                        status: "Completed",
                                    },
                                ]),
                            }),
                        }),
                    }),
                }),
            };
        };
        Payout.countDocuments = () => Promise.resolve(1);

        try {
            const res = await request(app)
                .get("/api/seller/payouts")
                .set("Authorization", `Bearer ${sellerToken}`);

            assert.strictEqual(res.statusCode, 200);
            assert.strictEqual(res.body.success, true);
            assert.strictEqual(res.body.data.payouts.length, 1);
            assert.strictEqual(res.body.data.payouts[0].payoutNumber, "PAY-998877");
        } finally {
            Seller.findOne = origSellerFindOne;
            Store.findOne = origStoreFindOne;
            Payout.find = origPayoutFind;
            Payout.countDocuments = origPayoutCount;
            User.findById = origUserFindById;
        }
    });

    test("Public tracking endpoint GET /api/shipments/track/:trackingNumber returns tracking data without auth", async () => {
        const origShipmentFindOne = Shipment.findOne;
        Shipment.findOne = (query) => {
            if (query.trackingNumber === "EN-TRK-88776655") {
                return {
                    populate: () => Promise.resolve({
                        trackingNumber: "EN-TRK-88776655",
                        carrier: "ElectroNova Logistics",
                        currentStatus: "In Transit",
                        deliveryMethod: "platform",
                        events: [
                            { status: "Created", location: "Bangalore Hub", timestamp: new Date() },
                            { status: "In Transit", location: "Mumbai Central", timestamp: new Date() },
                        ],
                    }),
                };
            }
            return { populate: () => Promise.resolve(null) };
        };

        try {
            const res = await request(app)
                .get("/api/shipments/track/EN-TRK-88776655");

            assert.strictEqual(res.statusCode, 200);
            assert.strictEqual(res.body.success, true);
            assert.strictEqual(res.body.data.trackingNumber, "EN-TRK-88776655");
            assert.strictEqual(res.body.data.currentStatus, "In Transit");
            assert.strictEqual(res.body.data.events.length, 2);

            // Non-existent tracking number returns 404
            const resNotFound = await request(app)
                .get("/api/shipments/track/INVALID-TRACKING");
            assert.strictEqual(resNotFound.statusCode, 404);
        } finally {
            Shipment.findOne = origShipmentFindOne;
        }
    });

    test("Parent order status synchronizes to Delivered when all child SellerOrders are Delivered", async () => {
        const parentOrderId = "60d0fe4f5311236168a109f1";
        const sellerOrderId = "60d0fe4f5311236168a109f2";

        const mockParentOrder = {
            _id: parentOrderId,
            orderStatus: "Shipped",
            shippingAddress: { address: "123 MG Road", city: "Bengaluru" },
            save: function () { return Promise.resolve(this); },
        };

        const mockSellerOrder = {
            _id: sellerOrderId,
            parentOrderId,
            orderStatus: "Dispatched",
            shipmentTimeline: [],
            save: function () { return Promise.resolve(this); },
        };

        const origSellerOrderFindById = SellerOrder.findById;
        const origSellerOrderFind = SellerOrder.find;
        const origOrderFindById = orderModel.findById;
        const origShipmentFindOne = Shipment.findOne;
        const origShipmentSave = Shipment.prototype.save;

        SellerOrder.findById = () => Promise.resolve(mockSellerOrder);
        SellerOrder.find = () => Promise.resolve([
            { _id: sellerOrderId, orderStatus: "Delivered" },
            { _id: "60d0fe4f5311236168a109f3", orderStatus: "Delivered" },
        ]);
        orderModel.findById = () => Promise.resolve(mockParentOrder);
        Shipment.findOne = () => Promise.resolve(null);
        Shipment.prototype.save = function () { return Promise.resolve(this); };

        try {
            await shipmentService.createOrUpdateShipment({
                sellerOrderId,
                carrier: "Delhivery Express",
                trackingNumber: "DEL-889900",
                currentStatus: "Delivered",
                note: "Delivered to recipient with OTP verification",
            });

            assert.strictEqual(mockSellerOrder.orderStatus, "Delivered");
            assert.strictEqual(mockParentOrder.orderStatus, "Delivered");
            assert.ok(mockSellerOrder.deliveredAt);
        } finally {
            SellerOrder.findById = origSellerOrderFindById;
            SellerOrder.find = origSellerOrderFind;
            orderModel.findById = origOrderFindById;
            Shipment.findOne = origShipmentFindOne;
            Shipment.prototype.save = origShipmentSave;
        }
    });
});
