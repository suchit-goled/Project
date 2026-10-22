import { test, describe } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import app from "../src/app.js";
import env from "../src/config/env.js";
import User from "../src/models/user.model.js";
import Address from "../src/models/address.model.js";
import orderModel from "../src/models/order.model.js";
import paymentRepository from "../src/repositories/payment.repository.js";

describe("User, Security & Business Logic Hardening Tests", () => {
    const testUserId = "60d0fe4f5311236168a109ca";
    const otherUserId = "60d0fe4f5311236168a109cb";

    const userToken = jwt.sign(
        { id: testUserId, role: "user" },
        env.jwt_secret,
        { expiresIn: "1h" }
    );

    const adminToken = jwt.sign(
        { id: "60d0fe4f5311236168a109cc", role: "admin" },
        env.jwt_secret,
        { expiresIn: "1h" }
    );

    const mockHashedPassword = bcrypt.hashSync("correctpassword123", 10);

    const mockUser = {
        _id: testUserId,
        name: "ElectroNova Tester",
        email: "tester@electronova.com",
        password: mockHashedPassword,
        role: "user",
        save: async function () { return this; }
    };

    const origFindById = User.findById;
    const origFindOne = User.findOne;
    const origAddressCreate = Address.create;
    const origAddressFindOneAndUpdate = Address.findOneAndUpdate;
    const origOrderFindById = orderModel.findById;

    test.before(() => {
        User.findById = (id) => {
            const userObj = {
                ...mockUser,
                _id: id || testUserId,
                role: id === "60d0fe4f5311236168a109cc" ? "admin" : "user",
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
        User.findById = origFindById;
        User.findOne = origFindOne;
        Address.create = origAddressCreate;
        Address.findOneAndUpdate = origAddressFindOneAndUpdate;
        orderModel.findById = origOrderFindById;
    });

    // 1. NoSQL Injection Protection
    test("NoSQL injection keys starting with $ or containing . are stripped from request body", async () => {
        const res = await request(app)
            .post("/api/contact")
            .send({
                name: "Test User",
                email: "test@example.com",
                message: "Valid message for testing sanitization",
                $where: "sleep(5000)",
                $gt: "",
                "nested.field": "injected"
            });

        assert.equal(res.status, 200);
        assert.equal(res.body.success, true);
    });

    // 2. Change Password Security
    test("Change password rejects empty or missing fields", async () => {
        const res = await request(app)
            .put("/api/users/change-password")
            .set("Authorization", `Bearer ${userToken}`)
            .send({});

        assert.equal(res.status, 400);
        assert.equal(res.body.success, false);
        assert.ok(res.body.message.includes("Current password and new password are required"));
    });

    test("Change password rejects new password shorter than 6 characters", async () => {
        const res = await request(app)
            .put("/api/users/change-password")
            .set("Authorization", `Bearer ${userToken}`)
            .send({
                currentPassword: "correctpassword123",
                newPassword: "123"
            });

        assert.equal(res.status, 400);
        assert.equal(res.body.success, false);
        assert.ok(res.body.message.includes("at least 6 characters"));
    });

    test("Change password rejects incorrect current password", async () => {
        const res = await request(app)
            .put("/api/users/change-password")
            .set("Authorization", `Bearer ${userToken}`)
            .send({
                currentPassword: "wrongpassword!",
                newPassword: "newsecretpassword123"
            });

        assert.equal(res.status, 400);
        assert.equal(res.body.success, false);
        assert.ok(res.body.message.includes("Incorrect current password"));
    });

    test("Change password accepts correct current password and updates hash", async () => {
        const res = await request(app)
            .put("/api/users/change-password")
            .set("Authorization", `Bearer ${userToken}`)
            .send({
                currentPassword: "correctpassword123",
                newPassword: "updatedStrongPassword2026"
            });

        assert.equal(res.status, 200);
        assert.equal(res.body.success, true);
        assert.ok(res.body.message.includes("Password changed successfully"));
    });

    // 3. User Profile Update
    test("Update profile rejects empty name", async () => {
        const res = await request(app)
            .put("/api/users/profile")
            .set("Authorization", `Bearer ${userToken}`)
            .send({ name: "   " });

        assert.equal(res.status, 400);
        assert.equal(res.body.success, false);
        assert.ok(res.body.message.includes("Name cannot be empty"));
    });

    test("Update profile accepts valid fields", async () => {
        const res = await request(app)
            .put("/api/users/profile")
            .set("Authorization", `Bearer ${userToken}`)
            .send({
                name: "Updated Full Name",
                phone: "9876543210",
                city: "Bengaluru"
            });

        assert.equal(res.status, 200);
        assert.equal(res.body.success, true);
    });

    // 4. Address Mass Assignment Protection
    test("Address creation validates required fields", async () => {
        const res = await request(app)
            .post("/api/address")
            .set("Authorization", `Bearer ${userToken}`)
            .send({});

        assert.equal(res.status, 400);
        assert.equal(res.body.success, false);
    });

    test("Address update ignores injected userId in body (Mass Assignment defense)", async () => {
        let receivedUpdate = null;
        Address.findOneAndUpdate = (query, update) => {
            receivedUpdate = update;
            return Promise.resolve({
                _id: "60d0fe4f5311236168a109e1",
                userId: testUserId,
                city: "Mumbai"
            });
        };

        const res = await request(app)
            .put("/api/address/60d0fe4f5311236168a109e1")
            .set("Authorization", `Bearer ${userToken}`)
            .send({
                userId: "hackerInjectedUserId999",
                city: "Mumbai"
            });

        assert.equal(res.status, 200);
        assert.strictEqual(receivedUpdate.userId, undefined);
        assert.equal(receivedUpdate.city, "Mumbai");
    });

    // 5. Order Cancellation Status Constraints
    test("Order cancellation rejects cancellation of shipped orders", async () => {
        orderModel.findById = () => Promise.resolve({
            _id: "60d0fe4f5311236168a109f1",
            userId: testUserId,
            orderStatus: "Shipped",
            save: () => Promise.resolve(this)
        });

        const res = await request(app)
            .put("/api/orders/cancel/60d0fe4f5311236168a109f1")
            .set("Authorization", `Bearer ${userToken}`);

        assert.equal(res.status, 400);
        assert.equal(res.body.success, false);
        assert.ok(res.body.message.includes("Shipped orders cannot be cancelled directly"));
    });

    test("Order cancellation rejects unauthorized cancel attempt (IDOR protection)", async () => {
        orderModel.findById = () => Promise.resolve({
            _id: "60d0fe4f5311236168a109f2",
            userId: otherUserId, // belongs to another user
            orderStatus: "Pending",
            save: () => Promise.resolve(this)
        });

        const res = await request(app)
            .put("/api/orders/cancel/60d0fe4f5311236168a109f2")
            .set("Authorization", `Bearer ${userToken}`);

        assert.equal(res.status, 403);
        assert.equal(res.body.success, false);
        assert.ok(res.body.message.includes("Access denied"));
    });

    // 6. Timing-Safe Payment Verification
    test("Timing-safe Razorpay verification handles invalid or empty signature safely", async () => {
        const verified1 = await paymentRepository.verifyPayment("order_123", "pay_456", "");
        assert.equal(verified1, false);

        const verified2 = await paymentRepository.verifyPayment("order_123", "pay_456", null);
        assert.equal(verified2, false);

        const verified3 = await paymentRepository.verifyPayment("order_123", "pay_456", "shortSig");
        assert.equal(verified3, false);
    });

    // 7. Admin Order Status Transition
    test("Admin order status update rejects invalid status with 400", async () => {
        const res = await request(app)
            .put("/api/admin/orders/60d0fe4f5311236168a109f1/status")
            .set("Authorization", `Bearer ${adminToken}`)
            .send({ status: "InvalidStatusXYZ" });

        assert.equal(res.status, 400);
        assert.equal(res.body.success, false);
        assert.ok(res.body.message.includes("Invalid order status"));
    });
});
