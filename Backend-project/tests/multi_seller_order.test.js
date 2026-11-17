import { test, describe } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../src/app.js";
import env from "../src/config/env.js";
import User from "../src/models/user.model.js";
import Cart from "../src/models/Cart.js";
import Product from "../src/models/Product.js";
import orderModel from "../src/models/order.model.js";
import SellerOrder from "../src/models/sellerOrder.model.js";
import Seller from "../src/models/seller.model.js";
import Store from "../src/models/store.model.js";

describe("Phase 5: Multi-Seller Cart, Order Decomposition & Inventory Tests", () => {
    const customerUserId = "60d0fe4f5311236168a109ca";
    const sellerAUserId = "60d0fe4f5311236168a109cb";
    const sellerBUserId = "60d0fe4f5311236168a109cc";
    const storeAId = "60d0fe4f5311236168a109cd";
    const storeBId = "60d0fe4f5311236168a109ce";

    const customerToken = jwt.sign(
        { id: customerUserId, role: "customer" },
        env.jwt_secret,
        { expiresIn: "1h" }
    );

    const mockCustomer = {
        _id: customerUserId,
        name: "Rahul Verma",
        email: "rahul@example.com",
        role: "customer",
    };

    const mockProdA = {
        _id: "60d0fe4f5311236168a109d1",
        product_title: "Sony WH-1000XM5 Headphones",
        discounted_price: 28990,
        original_price: 34990,
        stock: 10,
        sellerId: sellerAUserId,
        storeId: storeAId,
        product_image_url: "https://example.com/sony.jpg",
    };

    const mockProdB = {
        _id: "60d0fe4f5311236168a109d2",
        product_title: "Apple Watch Series 9 GPS",
        discounted_price: 41900,
        original_price: 44900,
        stock: 5,
        sellerId: sellerBUserId,
        storeId: storeBId,
        product_image_url: "https://example.com/apple.jpg",
    };

    // Backup originals
    const origUserFindById = User.findById;
    const origCartFind = Cart.find;
    const origCartDeleteMany = Cart.deleteMany;
    const origProductFind = Product.find;
    const origProductFindByIdAndUpdate = Product.findByIdAndUpdate;
    const origOrderCreate = orderModel.create;
    const origOrderFindById = orderModel.findById;
    const origSellerOrderCreate = SellerOrder.create;
    const origSellerOrderUpdateMany = SellerOrder.updateMany;
    const origSellerFindOne = Seller.findOne;
    const origStoreFindOne = Store.findOne;

    let savedParentOrder = null;
    let savedSellerOrders = [];
    let stockChanges = [];

    test.before(() => {
        User.findById = () => ({
            select: () => Promise.resolve(mockCustomer),
        });

        Cart.deleteMany = () => Promise.resolve({ deletedCount: 2 });

        Product.find = () => Promise.resolve([mockProdA, mockProdB]);

        Product.findByIdAndUpdate = (id, update) => {
            stockChanges.push({ id, update });
            return Promise.resolve(true);
        };

        orderModel.create = (data) => {
            savedParentOrder = {
                _id: "60d0fe4f5311236168a109ff",
                ...data,
                save: () => Promise.resolve(),
            };
            return Promise.resolve(savedParentOrder);
        };

        orderModel.findById = (id) => {
            const ord = savedParentOrder || {
                _id: id,
                userId: customerUserId,
                parentOrderNumber: "EN-2026-981240",
                orderStatus: "Confirmed",
                paymentStatus: "Pending",
                total: 70890,
                products: [
                    { productId: mockProdA._id, quantity: 1, price: 28990, title: mockProdA.product_title },
                ],
                sellerOrders: savedSellerOrders,
                save: () => Promise.resolve(),
            };

            return {
                populate: () => Promise.resolve(ord),
                then: (fn) => Promise.resolve(ord).then(fn),
            };
        };

        SellerOrder.create = (data) => {
            const child = {
                _id: `child-${Date.now()}-${Math.random()}`,
                ...data,
                save: () => Promise.resolve(),
            };
            savedSellerOrders.push(child);
            return Promise.resolve(child);
        };

        SellerOrder.updateMany = () => Promise.resolve({ modifiedCount: 2 });

        Seller.findOne = ({ userId }) => {
            if (String(userId) === sellerAUserId) {
                return Promise.resolve({ userId: sellerAUserId, commissionRateOverride: 4.5 });
            }
            return Promise.resolve({ userId: sellerBUserId, commissionRateOverride: 6.0 });
        };

        Store.findOne = () => Promise.resolve({
            name: "Partner Tech Store",
            slug: "partner-tech",
            deliveryOptions: { supportsSellerDelivery: true },
        });
    });

    test.after(() => {
        User.findById = origUserFindById;
        Cart.find = origCartFind;
        Cart.deleteMany = origCartDeleteMany;
        Product.find = origProductFind;
        Product.findByIdAndUpdate = origProductFindByIdAndUpdate;
        orderModel.create = origOrderCreate;
        orderModel.findById = origOrderFindById;
        SellerOrder.create = origSellerOrderCreate;
        SellerOrder.updateMany = origSellerOrderUpdateMany;
        Seller.findOne = origSellerFindOne;
        Store.findOne = origStoreFindOne;
    });

    test("Order checkout rejects when cart item quantity exceeds available stock", async () => {
        Cart.find = () => Promise.resolve([
            {
                productId: mockProdA._id,
                title: mockProdA.product_title,
                price: mockProdA.discounted_price,
                quantity: 25, // Available is only 10
                sellerId: sellerAUserId,
            }
        ]);

        const res = await request(app)
            .post("/api/orders")
            .set("Authorization", `Bearer ${customerToken}`)
            .send({
                shippingAddress: {
                    fullName: "Rahul Verma",
                    address: "Flat 402, Lotus Apts",
                    city: "Mumbai",
                    state: "Maharashtra",
                    pincode: "400001",
                    phone: "9876543210",
                },
                paymentMethod: "Cash On Delivery",
            });

        assert.equal(res.status, 400);
        assert.equal(res.body.success, false);
        assert.match(res.body.message, /insufficient stock/i);
    });

    test("Multi-seller cart decomposes into 1 parent order and 2 separate SellerOrders", async () => {
        savedSellerOrders = [];
        stockChanges = [];

        Cart.find = () => Promise.resolve([
            {
                productId: mockProdA._id,
                title: mockProdA.product_title,
                price: 28990,
                quantity: 1,
                sellerId: sellerAUserId,
                storeId: storeAId,
            },
            {
                productId: mockProdB._id,
                title: mockProdB.product_title,
                price: 41900,
                quantity: 1,
                sellerId: sellerBUserId,
                storeId: storeBId,
            },
        ]);

        const res = await request(app)
            .post("/api/orders")
            .set("Authorization", `Bearer ${customerToken}`)
            .send({
                shippingAddress: {
                    fullName: "Rahul Verma",
                    address: "Flat 402, Lotus Apts",
                    city: "Mumbai",
                    state: "Maharashtra",
                    pincode: "400001",
                    phone: "9876543210",
                },
                paymentMethod: "Cash On Delivery",
            });

        assert.equal(res.status, 201);
        assert.equal(res.body.success, true);
        assert.equal(res.body.data.isMultiSeller, true);
        assert.ok(res.body.data.parentOrderNumber.startsWith("EN-"));

        // Verify that 2 separate seller orders were created
        assert.equal(savedSellerOrders.length, 2);

        // Verify seller A sub-order
        const sellerAOrder = savedSellerOrders.find(o => String(o.sellerId) === sellerAUserId);
        assert.ok(sellerAOrder);
        assert.equal(sellerAOrder.subtotal, 28990);
        assert.equal(sellerAOrder.commissionRate, 4.5);
        assert.equal(sellerAOrder.commissionAmount, Math.round(28990 * 0.045));
        assert.equal(sellerAOrder.sellerEarnings, 28990 - Math.round(28990 * 0.045));
        assert.ok(sellerAOrder.sellerOrderNumber.endsWith("-A"));

        // Verify seller B sub-order
        const sellerBOrder = savedSellerOrders.find(o => String(o.sellerId) === sellerBUserId);
        assert.ok(sellerBOrder);
        assert.equal(sellerBOrder.subtotal, 41900);
        assert.equal(sellerBOrder.commissionRate, 6.0);
        assert.equal(sellerBOrder.commissionAmount, Math.round(41900 * 0.06));
        assert.ok(sellerBOrder.sellerOrderNumber.endsWith("-B"));

        // Verify stock decrement occurred for both products
        assert.equal(stockChanges.length, 2);
        assert.equal(stockChanges[0].update.$inc.stock, -1);
        assert.equal(stockChanges[1].update.$inc.stock, -1);
    });

    test("GET /api/orders/details/:orderId retrieves parent order with populated sub-orders", async () => {
        const res = await request(app)
            .get("/api/orders/details/60d0fe4f5311236168a109ff")
            .set("Authorization", `Bearer ${customerToken}`);

        assert.equal(res.status, 200);
        assert.equal(res.body.success, true);
        assert.ok(res.body.data.order);
    });

    test("PUT /api/orders/cancel/:orderId synchronizes cancellation to child SellerOrders", async () => {
        const res = await request(app)
            .put("/api/orders/cancel/60d0fe4f5311236168a109ff")
            .set("Authorization", `Bearer ${customerToken}`);

        assert.equal(res.status, 200);
        assert.equal(res.body.success, true);
        assert.equal(res.body.data.order.orderStatus, "Cancelled");
    });
});
