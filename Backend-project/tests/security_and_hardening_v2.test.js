import { test, describe } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../src/app.js";
import env from "../src/config/env.js";
import User from "../src/models/user.model.js";
import Product from "../src/models/Product.js";
import Cart from "../src/models/Cart.js";
import Wishlist from "../src/models/wishlist.model.js";
import Address from "../src/models/address.model.js";
import productService from "../src/services/product.service.js";

describe("Security, Bug Fixes & Edge Case Hardening Suite v2", () => {
    const testUserId = "60d0fe4f5311236168a109ca";
    const testAdminId = "60d0fe4f5311236168a109cc";

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
    const origProductFindById = Product.findById;
    const origCartFindOne = Cart.findOne;
    const origCartCreate = Cart.create;
    const origWishlistFindOne = Wishlist.findOne;
    const origProductServiceUpdate = productService.updateProduct;
    const origProductServiceDelete = productService.deleteProduct;

    test.before(() => {
        User.findById = (id) => {
            const isAdmin = id === testAdminId;
            const userObj = {
                _id: id || testUserId,
                name: isAdmin ? "Admin Tester" : "Customer Tester",
                email: isAdmin ? "admin@electronova.com" : "customer@electronova.com",
                role: isAdmin ? "admin" : "user",
                password: "hashedPasswordSecret123",
                resetPasswordToken: "secretToken123",
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
        Product.findById = origProductFindById;
        Cart.findOne = origCartFindOne;
        Cart.create = origCartCreate;
        Wishlist.findOne = origWishlistFindOne;
        productService.updateProduct = origProductServiceUpdate;
        productService.deleteProduct = origProductServiceDelete;
    });

    // 1. User Model toJSON transform strips sensitive fields
    test("User model toJSON transform strips password and reset tokens", () => {
        const dummyUserDoc = new User({
            name: "John Secure",
            email: "john@secure.com",
            password: "hashedPassword123",
            resetPasswordToken: "secretReset123",
            resetPasswordExpire: new Date()
        });

        const jsonOut = dummyUserDoc.toJSON();
        assert.strictEqual(jsonOut.password, undefined);
        assert.strictEqual(jsonOut.resetPasswordToken, undefined);
        assert.strictEqual(jsonOut.resetPasswordExpire, undefined);
        assert.strictEqual(jsonOut.__v, undefined);
        assert.equal(jsonOut.name, "John Secure");
    });

    // 2. Wishlist rejects adding non-existent product
    test("Wishlist addToWishlist rejects non-existent product with 404", async () => {
        Product.findById = () => Promise.resolve(null);

        const res = await request(app)
            .post("/api/wishlist")
            .set("Authorization", `Bearer ${userToken}`)
            .send({ productId: "60d0fe4f5311236168a10999" });

        assert.equal(res.status, 404);
        assert.equal(res.body.success, false);
        assert.ok(res.body.message.includes("Product not found"));
    });

    // 3. Cart rejects non-integer or excessive quantity (> 50)
    test("Cart addToCart rejects quantity exceeding 50 units", async () => {
        Product.findById = () => Promise.resolve({
            _id: "60d0fe4f5311236168a10901",
            product_title: "Overstock Item",
            product_image_url: "https://example.com/item.jpg",
            discounted_price: 1999
        });

        const res = await request(app)
            .post("/api/cart/add")
            .set("Authorization", `Bearer ${userToken}`)
            .send({
                productId: "60d0fe4f5311236168a10901",
                quantity: 99
            });

        assert.equal(res.status, 400);
        assert.equal(res.body.success, false);
        assert.ok(res.body.message.includes("Maximum quantity allowed"));
    });

    test("Cart addToCart rejects float / non-integer quantity", async () => {
        const res = await request(app)
            .post("/api/cart/add")
            .set("Authorization", `Bearer ${userToken}`)
            .send({
                productId: "60d0fe4f5311236168a10901",
                quantity: 2.5
            });

        assert.equal(res.status, 400);
        assert.equal(res.body.success, false);
        assert.ok(res.body.message.includes("positive integer"));
    });

    // 4. Cart update rejects quantity exceeding 50
    test("Cart updateQuantity rejects quantity exceeding 50", async () => {
        const res = await request(app)
            .put("/api/cart/update")
            .set("Authorization", `Bearer ${userToken}`)
            .send({
                productId: "60d0fe4f5311236168a10901",
                quantity: 100
            });

        assert.equal(res.status, 400);
        assert.equal(res.body.success, false);
        assert.ok(res.body.message.includes("Maximum quantity allowed per item is 50"));
    });

    // 5. Order creation rejects invalid paymentMethod
    test("Order creation rejects invalid payment method", async () => {
        const res = await request(app)
            .post("/api/orders")
            .set("Authorization", `Bearer ${userToken}`)
            .send({
                shippingAddress: {
                    address: "123 Tech Boulevard",
                    city: "Bengaluru"
                },
                paymentMethod: "Cryptocurrency"
            });

        assert.equal(res.status, 400);
        assert.equal(res.body.success, false);
        assert.ok(res.body.message.includes("Invalid payment method specified"));
    });

    // 6. Review comment length limit
    test("Review submission rejects comments longer than 1000 characters", async () => {
        const overlyLongComment = "A".repeat(1050);

        const res = await request(app)
            .post("/api/reviews")
            .set("Authorization", `Bearer ${userToken}`)
            .send({
                productId: "60d0fe4f5311236168a10901",
                rating: 5,
                comment: overlyLongComment
            });

        assert.equal(res.status, 400);
        assert.equal(res.body.success, false);
        assert.ok(res.body.message.includes("cannot exceed 1000 characters"));
    });

    // 7. Admin product update returns 404 for non-existent product
    test("Admin product update returns 404 when product is missing", async () => {
        productService.updateProduct = () => Promise.resolve(null);

        const res = await request(app)
            .put("/api/admin/products/60d0fe4f5311236168a10999")
            .set("Authorization", `Bearer ${adminToken}`)
            .send({ product_title: "Non-existent item" });

        assert.equal(res.status, 404);
        assert.equal(res.body.success, false);
        assert.ok(res.body.message.includes("Product not found"));
    });

    // 8. Admin product delete returns 404 when product is missing
    test("Admin product delete returns 404 when product is missing", async () => {
        productService.deleteProduct = () => Promise.resolve(null);

        const res = await request(app)
            .delete("/api/admin/products/60d0fe4f5311236168a10999")
            .set("Authorization", `Bearer ${adminToken}`);

        assert.equal(res.status, 404);
        assert.equal(res.body.success, false);
        assert.ok(res.body.message.includes("Product not found"));
    });

    // 9. Root status check returns version 2.5.0
    test("GET / returns version 2.5.0 with secure health metadata", async () => {
        const res = await request(app).get("/");
        assert.equal(res.status, 200);
        assert.equal(res.body.success, true);
        assert.equal(res.body.version, "2.5.0");
    });
});
