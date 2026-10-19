import { test, describe } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../src/app.js";
import env from "../src/config/env.js";
import User from "../src/models/user.model.js";
import Cart from "../src/models/Cart.js";

describe("Cart, Order, and Review Business Logic Validation Tests", () => {
    const testUserId = "60d0fe4f5311236168a109ca";
    const testToken = jwt.sign(
        { id: testUserId, role: "user" },
        env.jwt_secret,
        { expiresIn: "1h" }
    );

    // Mock User lookup for protect middleware
    const mockUser = {
        _id: testUserId,
        name: "Test User",
        email: "test@example.com",
        role: "user"
    };

    // Store original functions
    const originalFindById = User.findById;
    const originalCartFind = Cart.find;

    test.before(() => {
        User.findById = () => ({
            select: () => Promise.resolve(mockUser)
        });
        Cart.find = () => Promise.resolve([]);
    });

    test.after(() => {
        User.findById = originalFindById;
        Cart.find = originalCartFind;
    });

    test("Order creation rejects request when cart is empty", async () => {
        const res = await request(app)
            .post("/api/orders")
            .set("Authorization", `Bearer ${testToken}`)
            .send({
                shippingAddress: {
                    fullName: "Test User",
                    address: "123 Street",
                    city: "Tech City",
                    state: "CA",
                    pincode: "12345"
                },
                paymentMethod: "Cash On Delivery"
            });

        assert.equal(res.status, 400);
        assert.equal(res.body.success, false);
        assert.ok(res.body.message.includes("Cart is empty"));
    });

    test("Order creation rejects requests with missing or empty shippingAddress", async () => {
        const res = await request(app)
            .post("/api/orders")
            .set("Authorization", `Bearer ${testToken}`)
            .send({ paymentMethod: "Cash On Delivery" });

        assert.equal(res.status, 400);
        assert.equal(res.body.success, false);
        assert.ok(res.body.message.includes("shipping address"));
    });

    test("Cart update rejects request with missing productId or quantity", async () => {
        const res = await request(app)
            .put("/api/cart/update")
            .set("Authorization", `Bearer ${testToken}`)
            .send({});

        assert.equal(res.status, 400);
        assert.equal(res.body.success, false);
    });

    test("Review creation validates that rating must be between 1 and 5", async () => {
        const res = await request(app)
            .post("/api/reviews")
            .set("Authorization", `Bearer ${testToken}`)
            .send({ productId: "60d0fe4f5311236168a109cb", rating: 10, comment: "Out of range" });

        assert.equal(res.status, 400);
        assert.equal(res.body.success, false);
        assert.ok(res.body.message.includes("between 1 and 5"));
    });

    test("User cannot access another user's cart without admin privilege (IDOR protection)", async () => {
        const victimUserId = "60d0fe4f5311236168a109cb"; // Different from testUserId
        const res = await request(app)
            .get(`/api/cart/${victimUserId}`)
            .set("Authorization", `Bearer ${testToken}`);

        assert.equal(res.status, 403);
        assert.equal(res.body.success, false);
        assert.ok(res.body.message.includes("Access denied"));
    });

    test("User cannot access another user's orders without admin privilege (IDOR protection)", async () => {
        const victimUserId = "60d0fe4f5311236168a109cb"; // Different from testUserId
        const res = await request(app)
            .get(`/api/orders/${victimUserId}`)
            .set("Authorization", `Bearer ${testToken}`);

        assert.equal(res.status, 403);
        assert.equal(res.body.success, false);
        assert.ok(res.body.message.includes("Access denied"));
    });

});
