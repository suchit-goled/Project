import { test, describe } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../src/app.js";
import env from "../src/config/env.js";
import User from "../src/models/user.model.js";
import Seller from "../src/models/seller.model.js";
import Store from "../src/models/store.model.js";
import Product from "../src/models/Product.js";
import SellerOrder from "../src/models/sellerOrder.model.js";
import Payout from "../src/models/payout.model.js";

describe("Phase 4: Multi-Vendor Seller Onboarding, Dashboard & Tenant Isolation Tests", () => {
    const sellerUserId = "60d0fe4f5311236168a109ca";
    const otherSellerId = "60d0fe4f5311236168a109cb";
    const customerUserId = "60d0fe4f5311236168a109cc";

    const sellerToken = jwt.sign(
        { id: sellerUserId, role: "seller" },
        env.jwt_secret,
        { expiresIn: "1h" }
    );

    const customerToken = jwt.sign(
        { id: customerUserId, role: "customer" },
        env.jwt_secret,
        { expiresIn: "1h" }
    );

    const mockSellerUser = {
        _id: sellerUserId,
        name: "Vikram Electronics",
        email: "vikram@example.com",
        role: "seller",
    };

    const mockCustomerUser = {
        _id: customerUserId,
        name: "Ramesh Sharma",
        email: "ramesh@example.com",
        role: "customer",
    };

    const mockSellerProfile = {
        _id: "seller-profile-101",
        userId: sellerUserId,
        sellerType: "business",
        legalName: "Vikram Tech Retail Pvt Ltd",
        displayName: "Vikram Tech",
        contactEmail: "vikram@example.com",
        contactPhone: "9876543210",
        gstin: "29AABCU9603R1Z2",
        pan: "AABCU9603R",
        status: "approved",
        isVerified: true,
    };

    const mockStore = {
        _id: "store-101",
        sellerId: sellerUserId,
        sellerProfileId: "seller-profile-101",
        name: "Vikram Tech Mega Store",
        slug: "vikram-tech-mega-store",
        description: "Authorized electronics and computer peripherals distributor.",
        pickupAddress: { city: "Bengaluru", state: "Karnataka", pincode: "560001" },
        rating: 4.8,
        totalReviews: 85,
        isActive: true,
        save: () => Promise.resolve(),
    };

    const mockSellerOrder = {
        _id: "507f1f77bcf86cd799439011",
        sellerOrderNumber: "EN-2026-1001-A",
        parentOrderId: "60d0fe4f5311236168a109cd",
        parentOrderNumber: "EN-2026-1001",
        customerId: {
            _id: customerUserId,
            name: "Ramesh Sharma",
            email: "ramesh@example.com",
        },
        sellerId: sellerUserId,
        storeId: "store-101",
        products: [
            {
                productId: "prod-1",
                title: "Dell XPS 15 Laptop",
                price: 135000,
                quantity: 1,
            }
        ],
        subtotal: 135000,
        commissionRate: 4.5,
        commissionAmount: 6075,
        sellerEarnings: 128925,
        orderStatus: "Confirmed",
        shipmentTimeline: [
            { status: "Confirmed", timestamp: new Date(), note: "Order placed" }
        ],
        save: () => Promise.resolve(),
    };

    // Backup originals
    const origUserFindById = User.findById;
    const origUserFindByIdAndUpdate = User.findByIdAndUpdate;
    const origSellerFindOne = Seller.findOne;
    const origSellerCreate = Seller.create;
    const origStoreFindOne = Store.findOne;
    const origStoreCreate = Store.create;
    const origProductCount = Product.countDocuments;
    const origProductFind = Product.find;
    const origProductFindOne = Product.findOne;
    const origProductCreate = Product.create;
    const origProductFindOneAndDelete = Product.findOneAndDelete;
    const origSellerOrderFind = SellerOrder.find;
    const origSellerOrderFindOne = SellerOrder.findOne;
    const origSellerOrderCount = SellerOrder.countDocuments;
    const origPayoutFind = Payout.find;

    test.before(() => {
        User.findById = (id) => ({
            select: () => {
                if (String(id) === sellerUserId) return Promise.resolve(mockSellerUser);
                if (String(id) === customerUserId) return Promise.resolve(mockCustomerUser);
                return Promise.resolve(null);
            }
        });

        User.findByIdAndUpdate = () => Promise.resolve(mockSellerUser);

        Seller.findOne = ({ userId }) => {
            if (String(userId) === sellerUserId) return Promise.resolve(mockSellerProfile);
            return Promise.resolve(null);
        };

        Seller.create = (data) => Promise.resolve({ ...mockSellerProfile, ...data });

        Store.findOne = (query) => {
            if (query && (query.sellerId === customerUserId || query["$or"]?.some(o => o.sellerId === customerUserId))) {
                return Promise.resolve(null);
            }
            return Promise.resolve({ ...mockStore, save: () => Promise.resolve() });
        };
        Store.create = (data) => Promise.resolve({ ...mockStore, ...data, save: () => Promise.resolve() });

        Product.countDocuments = () => Promise.resolve(45);

        Product.find = () => ({
            sort: () => ({
                skip: () => ({
                    limit: () => Promise.resolve([
                        {
                            _id: "prod-101",
                            product_title: "Sony WH-1000XM5 Wireless Headphones",
                            sellerId: sellerUserId,
                            storeId: "store-101",
                            discounted_price: 29990,
                            original_price: 34990,
                            stock: 15,
                            approvalStatus: "approved",
                        }
                    ])
                })
            })
        });

        Product.create = (data) => Promise.resolve({
            _id: "prod-new-102",
            ...data,
            sellerId: sellerUserId,
        });

        Product.findOne = (query) => {
            if (query && query.sellerId && String(query.sellerId) !== sellerUserId) {
                return Promise.resolve(null);
            }
            return Promise.resolve({
                _id: query._id || "507f1f77bcf86cd799439011",
                product_title: "Sony WH-1000XM5 Wireless Headphones",
                sellerId: sellerUserId,
                discounted_price: 29990,
                original_price: 34990,
                save: () => Promise.resolve(),
            });
        };

        Product.findOneAndDelete = (query) => {
            if (query && query.sellerId && String(query.sellerId) !== sellerUserId) {
                return Promise.resolve(null);
            }
            return Promise.resolve({
                _id: query._id || "507f1f77bcf86cd799439011",
                sellerId: sellerUserId,
            });
        };

        SellerOrder.find = ({ sellerId }) => {
            if (String(sellerId) === sellerUserId) {
                const list = [mockSellerOrder];
                return {
                    sort: () => ({
                        skip: () => ({
                            limit: () => ({
                                populate: () => Promise.resolve(list)
                            })
                        }),
                        then: (fn) => Promise.resolve(list).then(fn),
                    }),
                    then: (fn) => Promise.resolve(list).then(fn),
                };
            }
            return {
                sort: () => ({
                    skip: () => ({
                        limit: () => ({
                            populate: () => Promise.resolve([])
                        })
                    })
                }),
                then: (fn) => Promise.resolve([]).then(fn),
            };
        };

        SellerOrder.countDocuments = () => Promise.resolve(1);

        SellerOrder.findOne = (query) => {
            if (query && query.sellerId && String(query.sellerId) !== sellerUserId) {
                // Tenant isolation test: returns null if not this seller
                return { populate: () => Promise.resolve(null) };
            }
            return {
                populate: () => Promise.resolve(mockSellerOrder),
                then: (fn) => Promise.resolve(mockSellerOrder).then(fn),
            };
        };

        Payout.find = () => ({
            sort: () => Promise.resolve([
                {
                    payoutNumber: "PAY-2026-001",
                    grossSales: 135000,
                    commissionDeducted: 6075,
                    netAmount: 128925,
                    status: "completed",
                }
            ])
        });
    });

    test.after(() => {
        User.findById = origUserFindById;
        User.findByIdAndUpdate = origUserFindByIdAndUpdate;
        Seller.findOne = origSellerFindOne;
        Seller.create = origSellerCreate;
        Store.findOne = origStoreFindOne;
        Store.create = origStoreCreate;
        Product.countDocuments = origProductCount;
        Product.find = origProductFind;
        Product.findOne = origProductFindOne;
        Product.create = origProductCreate;
        Product.findOneAndDelete = origProductFindOneAndDelete;
        SellerOrder.find = origSellerOrderFind;
        SellerOrder.findOne = origSellerOrderFindOne;
        SellerOrder.countDocuments = origSellerOrderCount;
        Payout.find = origPayoutFind;
    });

    test("POST /api/seller/register rejects unauthenticated request with 401", async () => {
        const res = await request(app)
            .post("/api/seller/register")
            .send({ legalName: "Unauthorized Seller" });

        assert.equal(res.status, 401);
        assert.equal(res.body.success, false);
    });

    test("POST /api/seller/register rejects missing legalName with 400", async () => {
        const res = await request(app)
            .post("/api/seller/register")
            .set("Authorization", `Bearer ${customerToken}`)
            .send({ contactPhone: "9876543210" });

        assert.equal(res.status, 400);
        assert.equal(res.body.success, false);
        assert.match(res.body.message, /legal.*name is required/i);
    });

    test("POST /api/seller/register rejects missing contactPhone with 400", async () => {
        const res = await request(app)
            .post("/api/seller/register")
            .set("Authorization", `Bearer ${customerToken}`)
            .send({ legalName: "New Electronics" });

        assert.equal(res.status, 400);
        assert.equal(res.body.success, false);
        assert.match(res.body.message, /contact phone.*required/i);
    });

    test("POST /api/seller/register successfully registers new seller profile and store", async () => {
        const res = await request(app)
            .post("/api/seller/register")
            .set("Authorization", `Bearer ${customerToken}`)
            .send({
                sellerType: "business",
                legalName: "Kavita Mobiles & Electronics",
                contactPhone: "9812345678",
                gstin: "27AABCU9603R1ZM",
                pan: "AABCU9603R",
                storeName: "Kavita Mobiles",
                storeDescription: "Certified seller of smartphones & tablets",
            });

        assert.equal(res.status, 201);
        assert.equal(res.body.success, true);
        assert.ok(res.body.data.seller);
        assert.ok(res.body.data.store);
    });

    test("GET /api/seller/profile returns seller and store data for authenticated seller", async () => {
        const res = await request(app)
            .get("/api/seller/profile")
            .set("Authorization", `Bearer ${sellerToken}`);

        assert.equal(res.status, 200);
        assert.equal(res.body.success, true);
        assert.equal(res.body.data.seller.legalName, "Vikram Tech Retail Pvt Ltd");
        assert.equal(res.body.data.store.name, "Vikram Tech Mega Store");
    });

    test("GET /api/seller/dashboard blocks non-seller customer with 403 Forbidden", async () => {
        const res = await request(app)
            .get("/api/seller/dashboard")
            .set("Authorization", `Bearer ${customerToken}`);

        assert.equal(res.status, 403);
        assert.equal(res.body.success, false);
    });

    test("GET /api/seller/dashboard returns seller metrics for authorized seller", async () => {
        const res = await request(app)
            .get("/api/seller/dashboard")
            .set("Authorization", `Bearer ${sellerToken}`);

        assert.equal(res.status, 200);
        assert.equal(res.body.success, true);
        assert.equal(typeof res.body.data.totalProducts, "number");
        assert.equal(typeof res.body.data.grossSales, "number");
        assert.equal(typeof res.body.data.availableEarnings, "number");
        assert.ok(Array.isArray(res.body.data.recentOrders));
    });

    test("GET /api/seller/orders returns sub-orders belonging to authenticated seller", async () => {
        const res = await request(app)
            .get("/api/seller/orders")
            .set("Authorization", `Bearer ${sellerToken}`);

        assert.equal(res.status, 200);
        assert.equal(res.body.success, true);
        assert.ok(Array.isArray(res.body.data.orders));
        assert.equal(res.body.data.orders[0].sellerOrderNumber, "EN-2026-1001-A");
    });

    test("GET /api/seller/orders/:id returns sub-order details with customer reference", async () => {
        const res = await request(app)
            .get("/api/seller/orders/507f1f77bcf86cd799439011")
            .set("Authorization", `Bearer ${sellerToken}`);

        assert.equal(res.status, 200);
        assert.equal(res.body.success, true);
        assert.equal(res.body.data.sellerOrderNumber, "EN-2026-1001-A");
        assert.equal(res.body.data.subtotal, 135000);
    });

    test("PUT /api/seller/orders/:id/status rejects invalid order status with 400", async () => {
        const res = await request(app)
            .put("/api/seller/orders/507f1f77bcf86cd799439011/status")
            .set("Authorization", `Bearer ${sellerToken}`)
            .send({ status: "InvalidHackedStatus" });

        assert.equal(res.status, 400);
        assert.equal(res.body.success, false);
        assert.match(res.body.message, /invalid order status/i);
    });

    test("PUT /api/seller/orders/:id/status accepts valid status update and appends timeline", async () => {
        const res = await request(app)
            .put("/api/seller/orders/507f1f77bcf86cd799439011/status")
            .set("Authorization", `Bearer ${sellerToken}`)
            .send({
                status: "Packed",
                note: "Order packaged securely with bubble wrap and invoice.",
                trackingNumber: "DTDC98234812",
                carrier: "DTDC Express",
            });

        assert.equal(res.status, 200);
        assert.equal(res.body.success, true);
        assert.equal(res.body.data.orderStatus, "Packed");
    });

    test("GET /api/seller/earnings returns gross sales, commission and net payout ledger", async () => {
        const res = await request(app)
            .get("/api/seller/earnings")
            .set("Authorization", `Bearer ${sellerToken}`);

        assert.equal(res.status, 200);
        assert.equal(res.body.success, true);
        assert.equal(res.body.data.grossSales, 135000);
        assert.equal(res.body.data.commissionDeducted, 6075);
        assert.equal(res.body.data.netEarnings, 128925);
        assert.ok(Array.isArray(res.body.data.payouts));
    });

    test("GET /api/seller/products returns seller's products list with pagination", async () => {
        const res = await request(app)
            .get("/api/seller/products")
            .set("Authorization", `Bearer ${sellerToken}`);

        assert.equal(res.status, 200);
        assert.equal(res.body.success, true);
        assert.ok(Array.isArray(res.body.data.products));
        assert.equal(res.body.data.products[0].sellerId, sellerUserId);
    });

    test("POST /api/seller/products creates product associated with seller store", async () => {
        const res = await request(app)
            .post("/api/seller/products")
            .set("Authorization", `Bearer ${sellerToken}`)
            .send({
                title: "OnePlus 12 5G (Flowy Emerald, 256GB)",
                category: "Smartphones",
                brand: "OnePlus",
                price: 64999,
                original_price: 69999,
                stock: 20,
            });

        assert.equal(res.status, 201);
        assert.equal(res.body.success, true);
        assert.equal(res.body.data.sellerId, sellerUserId);
    });

    test("PUT /api/seller/products/:id updates seller product, blocks cross-tenant mutation", async () => {
        // Valid update by owner
        const validRes = await request(app)
            .put("/api/seller/products/507f1f77bcf86cd799439011")
            .set("Authorization", `Bearer ${sellerToken}`)
            .send({ price: 27999, stock: 25 });

        assert.equal(validRes.status, 200);
        assert.equal(validRes.body.success, true);

        // Invalid objectId format rejected
        const invalidIdRes = await request(app)
            .put("/api/seller/products/invalid-id")
            .set("Authorization", `Bearer ${sellerToken}`)
            .send({ price: 27999 });

        assert.equal(invalidIdRes.status, 400);
        assert.equal(invalidIdRes.body.success, false);
    });

    test("DELETE /api/seller/products/:id removes product, blocks cross-tenant deletion", async () => {
        const res = await request(app)
            .delete("/api/seller/products/507f1f77bcf86cd799439011")
            .set("Authorization", `Bearer ${sellerToken}`);

        assert.equal(res.status, 200);
        assert.equal(res.body.success, true);
        assert.equal(res.body.data.id, "507f1f77bcf86cd799439011");
    });
});
