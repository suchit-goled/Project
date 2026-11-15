import { test, describe } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import app from "../src/app.js";
import env from "../src/config/env.js";
import User from "../src/models/user.model.js";
import orderModel from "../src/models/order.model.js";
import Cart from "../src/models/Cart.js";
import Address from "../src/models/address.model.js";

describe("Security, Bug Fixes & Edge Case Hardening Suite v4", () => {
    const testUserId = "60d0fe4f5311236168a109ca";
    const validOrderId = "60d0fe4f5311236168a109aa";
    const validAddressId = "60d0fe4f5311236168a109ee";
    const currentPass = "currentSecretPassword123";

    const userToken = jwt.sign(
        { id: testUserId, role: "user" },
        env.jwt_secret,
        { expiresIn: "1h" }
    );

    const origUserFindById = User.findById;
    const origOrderFindById = orderModel.findById;
    const origAddressFindOneAndUpdate = Address.findOneAndUpdate;

    test.before(async () => {
        const hashedCurrentPass = await bcrypt.hash(currentPass, 10);

        User.findById = (id) => {
            const userObj = {
                _id: id || testUserId,
                name: "Customer Tester",
                email: "customer@electronova.com",
                role: "user",
                password: hashedCurrentPass,
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
        orderModel.findById = origOrderFindById;
        Address.findOneAndUpdate = origAddressFindOneAndUpdate;
    });

    // 1. Payment creation rejects invalid order ObjectId format with 400
    test("POST /api/payment/create-order rejects invalid order ObjectId with 400", async () => {
        const res = await request(app)
            .post("/api/payment/create-order")
            .set("Authorization", `Bearer ${userToken}`)
            .send({ orderId: "invalid-hex-order-id" });

        assert.equal(res.status, 400);
        assert.equal(res.body.success, false);
        assert.ok(res.body.message.includes("Invalid order ID format"));
    });

    // 2. Payment creation rejects payment creation for already paid orders with 400
    test("POST /api/payment/create-order rejects already paid orders with 400", async () => {
        orderModel.findById = () => Promise.resolve({
            _id: validOrderId,
            userId: testUserId,
            paymentStatus: "Paid",
            orderStatus: "Confirmed",
            total: 2499
        });

        const res = await request(app)
            .post("/api/payment/create-order")
            .set("Authorization", `Bearer ${userToken}`)
            .send({ orderId: validOrderId });

        assert.equal(res.status, 400);
        assert.equal(res.body.success, false);
        assert.ok(res.body.message.includes("already been paid"));
    });

    // 3. Payment creation rejects payment creation for cancelled orders with 400
    test("POST /api/payment/create-order rejects cancelled orders with 400", async () => {
        orderModel.findById = () => Promise.resolve({
            _id: validOrderId,
            userId: testUserId,
            paymentStatus: "Pending",
            orderStatus: "Cancelled",
            total: 2499
        });

        const res = await request(app)
            .post("/api/payment/create-order")
            .set("Authorization", `Bearer ${userToken}`)
            .send({ orderId: validOrderId });

        assert.equal(res.status, 400);
        assert.equal(res.body.success, false);
        assert.ok(res.body.message.includes("cancelled order"));
    });

    // 4. Payment verification rejects invalid order ObjectId with 400
    test("POST /api/payment/verify rejects invalid order ObjectId format with 400", async () => {
        const res = await request(app)
            .post("/api/payment/verify")
            .set("Authorization", `Bearer ${userToken}`)
            .send({
                orderId: "malformed-id-999",
                razorpay_order_id: "order_xyz",
                razorpay_payment_id: "pay_123",
                razorpay_signature: "sig_456"
            });

        assert.equal(res.status, 400);
        assert.equal(res.body.success, false);
        assert.ok(res.body.message.includes("Invalid order ID format"));
    });

    // 5. Payment verification is idempotent for already paid orders (returns 200)
    test("POST /api/payment/verify returns idempotent 200 for already paid orders", async () => {
        orderModel.findById = () => Promise.resolve({
            _id: validOrderId,
            userId: testUserId,
            paymentStatus: "Paid",
            orderStatus: "Confirmed",
            total: 2499
        });

        const res = await request(app)
            .post("/api/payment/verify")
            .set("Authorization", `Bearer ${userToken}`)
            .send({
                orderId: validOrderId,
                razorpay_order_id: "order_xyz",
                razorpay_payment_id: "pay_123",
                razorpay_signature: "sig_456"
            });

        assert.equal(res.status, 200);
        assert.equal(res.body.success, true);
        assert.ok(res.body.message.includes("already verified"));
    });

    // 6. Cart item addition rejects invalid product ObjectId format with 400
    test("POST /api/cart/add rejects invalid product ObjectId format with 400", async () => {
        const res = await request(app)
            .post("/api/cart/add")
            .set("Authorization", `Bearer ${userToken}`)
            .send({
                productId: "not-a-valid-hex-product-id",
                quantity: 1
            });

        assert.equal(res.status, 400);
        assert.equal(res.body.success, false);
        assert.ok(res.body.message.includes("Invalid product ID format"));
    });

    // 7. Cart removal rejects invalid product ObjectId format with 400
    test("DELETE /api/cart/remove rejects invalid product ObjectId format with 400", async () => {
        const res = await request(app)
            .delete("/api/cart/remove")
            .set("Authorization", `Bearer ${userToken}`)
            .send({ productId: "not-a-valid-hex-product-id" });

        assert.equal(res.status, 400);
        assert.equal(res.body.success, false);
        assert.ok(res.body.message.includes("Invalid product ID format"));
    });

    // 8. Address update rejects invalid address ObjectId with 400
    test("PUT /api/address/:id rejects invalid address ObjectId format with 400", async () => {
        const res = await request(app)
            .put("/api/address/malformed-address-id")
            .set("Authorization", `Bearer ${userToken}`)
            .send({ fullName: "Jane Doe" });

        assert.equal(res.status, 400);
        assert.equal(res.body.success, false);
        assert.ok(res.body.message.includes("Invalid address ID format"));
    });

    // 9. Change password rejects new password exceeding 128 characters
    test("PUT /api/users/change-password rejects new password exceeding 128 characters", async () => {
        const hugePassword = "A".repeat(129);

        const res = await request(app)
            .put("/api/users/change-password")
            .set("Authorization", `Bearer ${userToken}`)
            .send({
                currentPassword: currentPass,
                newPassword: hugePassword
            });

        assert.equal(res.status, 400);
        assert.equal(res.body.success, false);
        assert.ok(res.body.message.includes("cannot exceed 128 characters"));
    });

    // 10. Change password rejects identical new password matching current password
    test("PUT /api/users/change-password rejects new password matching current password", async () => {
        const res = await request(app)
            .put("/api/users/change-password")
            .set("Authorization", `Bearer ${userToken}`)
            .send({
                currentPassword: currentPass,
                newPassword: currentPass
            });

        assert.equal(res.status, 400);
        assert.equal(res.body.success, false);
        assert.ok(res.body.message.includes("must be different from current password"));
    });
});
