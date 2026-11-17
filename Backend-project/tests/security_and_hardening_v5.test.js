import { test, describe } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../src/app.js";
import env from "../src/config/env.js";
import User from "../src/models/user.model.js";
import orderModel from "../src/models/order.model.js";
import Cart from "../src/models/Cart.js";
import Wishlist from "../src/models/wishlist.model.js";
import Product from "../src/models/Product.js";

describe("Security, Bug Fixes & Edge Case Hardening Suite v5", () => {
    const testUserId = "60d0fe4f5311236168a109ca";
    const testAdminId = "60d0fe4f5311236168a109cb";
    const validOrderId = "60d0fe4f5311236168a109aa";
    const validProductId = "60d0fe4f5311236168a109bb";

    const userToken = jwt.sign(
        { id: testUserId, role: "user" },
        env.jwt_secret,
        { expiresIn: "1h" }
    );

    const adminToken = jwt.sign(
        { id: testAdminId, role: "admin" },
        env.jwt_secret,
        { expiresIn: "1h" }
    );

    const origUserFindById = User.findById;
    const origOrderFind = orderModel.find;
    const origOrderFindByIdAndUpdate = orderModel.findByIdAndUpdate;
    const origCartFind = Cart.find;
    const origWishlistFindOneAndDelete = Wishlist.findOneAndDelete;
    const origProductFindById = Product.findById;

    test.before(() => {
        User.findById = (id) => {
            const role = String(id) === testAdminId ? "admin" : "user";
            const userObj = {
                _id: id || testUserId,
                name: role === "admin" ? "Admin Tester" : "Customer Tester",
                email: `${role}@electronova.com`,
                role,
                save: async function () { return this; }
            };
            return {
                select: () => Promise.resolve(userObj),
                then: (onFulfilled, onRejected) => Promise.resolve(userObj).then(onFulfilled, onRejected),
                catch: (onRejected) => Promise.resolve(userObj).catch(onRejected)
            };
        };
    });

    test.after(() => {
        User.findById = origUserFindById;
        orderModel.find = origOrderFind;
        orderModel.findByIdAndUpdate = origOrderFindByIdAndUpdate;
        Cart.find = origCartFind;
        Wishlist.findOneAndDelete = origWishlistFindOneAndDelete;
        Product.findById = origProductFindById;
    });

    // 1. Root status check confirms upgraded version 2.6.0
    test("GET / confirms platform version 2.6.0 and health metadata", async () => {
        const res = await request(app).get("/");
        assert.equal(res.status, 200);
        assert.equal(res.body.success, true);
        assert.equal(res.body.version, "2.6.0");
    });

    // 2. SyntaxError interceptor handles malformed JSON in request body
    test("POST with malformed JSON body returns 400 with syntax error description", async () => {
        const res = await request(app)
            .post("/api/auth/login")
            .set("Content-Type", "application/json")
            .send('{"email": "broken-json", "password": }');

        assert.equal(res.status, 400);
        assert.equal(res.body.success, false);
        assert.ok(res.body.message.includes("Malformed JSON"));
    });

    // 3. Malformed URI parameters return 400 instead of unhandled 500
    test("GET with malformed URI encoding returns 400 Bad Request", async () => {
        const res = await request(app).get("/api/products/%ZZ");
        assert.equal(res.status, 400);
        assert.equal(res.body.success, false);
        assert.ok(res.body.message.includes("Malformed request URL"));
    });

    // 4. Protect middleware rejects Authorization header containing only 'Bearer' and whitespace
    test("Protect middleware rejects whitespace-only Bearer token with 401", async () => {
        const res = await request(app)
            .get("/api/cart")
            .set("Authorization", "Bearer    ");

        assert.equal(res.status, 401);
        assert.equal(res.body.success, false);
        assert.ok(res.body.message.includes("Token missing"));
    });

    // 5. Password forgot-password endpoint validates email format with 400
    test("POST /api/password/forgot-password rejects invalid email syntax with 400", async () => {
        const res = await request(app)
            .post("/api/password/forgot-password")
            .send({ email: "invalid-email-address-without-at" });

        assert.equal(res.status, 400);
        assert.equal(res.body.success, false);
        assert.ok(res.body.message.includes("valid email"));
    });

    // 6. Password reset endpoint validates token format and bounds
    test("POST /api/password/reset-password rejects oversized reset token format with 400", async () => {
        const res = await request(app)
            .post("/api/password/reset-password")
            .send({
                token: "a".repeat(250),
                newPassword: "ValidNewPassword123"
            });

        assert.equal(res.status, 400);
        assert.equal(res.body.success, false);
        assert.ok(res.body.message.includes("reset token format"));
    });

    // 7. Admin order status accepts synchronized statuses ('Packed', 'Out for Delivery')
    test("PUT /api/admin/orders/:id accepts valid synchronized status 'Packed'", async () => {
        orderModel.findByIdAndUpdate = (id, update) => Promise.resolve({
            _id: id,
            orderStatus: update.orderStatus
        });

        const res = await request(app)
            .put(`/api/admin/orders/${validOrderId}`)
            .set("Authorization", `Bearer ${adminToken}`)
            .send({ status: "Packed" });

        assert.equal(res.status, 200);
        assert.equal(res.body.success, true);
        assert.equal(res.body.data.orderStatus, "Packed");
    });

    // 8. Admin order status returns 404 when order does not exist
    test("PUT /api/admin/orders/:id returns 404 when targeted order does not exist", async () => {
        orderModel.findByIdAndUpdate = () => Promise.resolve(null);

        const res = await request(app)
            .put(`/api/admin/orders/${validOrderId}`)
            .set("Authorization", `Bearer ${adminToken}`)
            .send({ status: "Delivered" });

        assert.equal(res.status, 404);
        assert.equal(res.body.success, false);
        assert.ok(res.body.message.includes("Order not found"));
    });

    // 9. Admin product creation rejects negative price and empty title
    test("POST /api/admin/products rejects negative price and missing title with 400", async () => {
        const res = await request(app)
            .post("/api/admin/products")
            .set("Authorization", `Bearer ${adminToken}`)
            .send({
                product_title: "   ",
                discounted_price: -100
            });

        assert.equal(res.status, 400);
        assert.equal(res.body.success, false);
        assert.ok(res.body.message.includes("title is required"));
    });

    // 10. Direct GET /api/orders returns authenticated user's orders
    test("GET /api/orders fetches current authenticated user orders directly", async () => {
        orderModel.find = (filter) => {
            assert.equal(filter.userId, testUserId);
            return {
                sort: () => Promise.resolve([
                    { _id: validOrderId, userId: testUserId, total: 1999 }
                ])
            };
        };

        const res = await request(app)
            .get("/api/orders")
            .set("Authorization", `Bearer ${userToken}`);

        assert.equal(res.status, 200);
        assert.equal(res.body.success, true);
        assert.equal(res.body.data.count, 1);
    });

    // 11. Direct GET /api/cart returns authenticated user's cart
    test("GET /api/cart fetches current authenticated user cart directly", async () => {
        Cart.find = (filter) => {
            assert.equal(filter.userId, testUserId);
            return {
                populate: () => Promise.resolve([
                    { _id: "60d0fe4f5311236168a109dd", userId: testUserId, quantity: 2, price: 499 }
                ])
            };
        };

        const res = await request(app)
            .get("/api/cart")
            .set("Authorization", `Bearer ${userToken}`);

        assert.equal(res.status, 200);
        assert.equal(res.body.success, true);
        assert.equal(res.body.cart.length, 1);
    });

    // 12. Wishlist removal via body DELETE /api/wishlist works cleanly
    test("DELETE /api/wishlist with productId in request body removes item", async () => {
        Wishlist.findOneAndDelete = (filter) => {
            assert.equal(filter.userId, testUserId);
            assert.equal(filter.productId, validProductId);
            return Promise.resolve({ _id: "60d0fe4f5311236168a109ee" });
        };

        const res = await request(app)
            .delete("/api/wishlist")
            .set("Authorization", `Bearer ${userToken}`)
            .send({ productId: validProductId });

        assert.equal(res.status, 200);
        assert.equal(res.body.success, true);
        assert.ok(res.body.message.includes("removed from wishlist"));
    });

});
