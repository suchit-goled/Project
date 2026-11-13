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
import Review from "../src/models/review.model.js";

describe("Security, Bug Fixes & Edge Case Hardening Suite v3", () => {
    const testUserId = "60d0fe4f5311236168a109ca";
    const testAdminId = "60d0fe4f5311236168a109cc";
    const otherAdminId = "60d0fe4f5311236168a109cd";
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
    const origUserCount = User.countDocuments;
    const origProductFindById = Product.findById;
    const origProductFind = Product.find;
    const origProductCount = Product.countDocuments;
    const origProductFindByIdAndUpdate = Product.findByIdAndUpdate;
    const origCartFindOneAndDelete = Cart.findOneAndDelete;
    const origWishlistFindOne = Wishlist.findOne;
    const origWishlistCreate = Wishlist.create;
    const origWishlistFindOneAndDelete = Wishlist.findOneAndDelete;
    const origReviewFindOne = Review.findOne;
    const origReviewCreate = Review.create;
    const origReviewFind = Review.find;

    test.before(() => {
        User.findById = (id) => {
            const isAdmin = id === testAdminId || id === otherAdminId;
            const userObj = {
                _id: id || testUserId,
                name: isAdmin ? "Admin Tester" : "Customer Tester",
                email: isAdmin ? "admin@electronova.com" : "customer@electronova.com",
                role: isAdmin ? "admin" : "user",
                password: "hashedPasswordSecret123",
                save: async function () { return this; },
                deleteOne: async function () { return this; }
            };
            return {
                select: () => Promise.resolve(userObj),
                then: (onFulfilled, onRejected) => Promise.resolve(userObj).then(onFulfilled, onRejected),
                catch: (onRejected) => Promise.resolve(userObj).catch(onRejected)
            };
        };

        Product.findById = (id) => {
            if (id === validProductId) {
                return Promise.resolve({
                    _id: validProductId,
                    product_title: "ElectroNova Pulse Earbuds",
                    discounted_price: 3499,
                    original_price: 4999
                });
            }
            return Promise.resolve(null);
        };
    });

    test.after(() => {
        User.findById = origUserFindById;
        User.countDocuments = origUserCount;
        Product.findById = origProductFindById;
        Product.findByIdAndUpdate = origProductFindByIdAndUpdate;
        Product.find = origProductFind;
        Product.countDocuments = origProductCount;
        Cart.findOneAndDelete = origCartFindOneAndDelete;
        Wishlist.findOne = origWishlistFindOne;
        Wishlist.create = origWishlistCreate;
        Wishlist.findOneAndDelete = origWishlistFindOneAndDelete;
        Review.findOne = origReviewFindOne;
        Review.create = origReviewCreate;
        Review.find = origReviewFind;
    });

    // 1. Root and health check return version 2.4.0
    test("GET / returns version 2.4.0 and security status", async () => {
        const res = await request(app).get("/");
        assert.equal(res.status, 200);
        assert.equal(res.body.success, true);
        assert.equal(res.body.version, "2.4.0");
    });

    // 2. Product filtering handles minPrice=0 and inverted ranges gracefully
    test("GET /api/products handles minPrice=0 and inverted price bounds", async () => {
        let capturedFilter = null;
        Product.countDocuments = (f) => {
            capturedFilter = f;
            return Promise.resolve(1);
        };
        Product.find = (f) => {
            capturedFilter = f;
            return {
                sort: () => ({
                    skip: () => ({
                        limit: () => Promise.resolve([{
                            _id: validProductId,
                            product_title: "ElectroNova Pulse Earbuds",
                            discounted_price: 3499
                        }])
                    })
                })
            };
        };

        const res = await request(app)
            .get("/api/products")
            .query({ minPrice: "10000", maxPrice: "1000" });

        assert.equal(res.status, 200);
        assert.equal(res.body.success, true);
        // Should have swapped 10000 and 1000 so minVal is 1000 and maxVal is 10000
        assert.equal(capturedFilter.discounted_price.$gte, 1000);
        assert.equal(capturedFilter.discounted_price.$lte, 10000);
    });

    // 3. Cart deletion supports route parameter /remove/:productId
    test("DELETE /api/cart/remove/:productId deletes item from cart", async () => {
        let deletedProductId = null;
        Cart.findOneAndDelete = (query) => {
            deletedProductId = query.productId;
            return Promise.resolve({ productId: query.productId });
        };

        const res = await request(app)
            .delete(`/api/cart/remove/${validProductId}`)
            .set("Authorization", `Bearer ${userToken}`);

        assert.equal(res.status, 200);
        assert.equal(res.body.success, true);
        assert.equal(deletedProductId, validProductId);
        assert.equal(res.body.message, "Item removed successfully");
    });

    // 4. Wishlist addition rejects invalid ObjectId format
    test("Wishlist addition rejects invalid ObjectId format with 400", async () => {
        const res = await request(app)
            .post("/api/wishlist")
            .set("Authorization", `Bearer ${userToken}`)
            .send({ productId: "not-a-valid-hex-object-id" });

        assert.equal(res.status, 400);
        assert.equal(res.body.success, false);
        assert.ok(res.body.message.includes("Invalid product ID"));
    });

    // 5. Wishlist removal rejects invalid ObjectId format
    test("Wishlist removal rejects invalid ObjectId format with 400", async () => {
        const res = await request(app)
            .delete("/api/wishlist/invalid-object-id-123")
            .set("Authorization", `Bearer ${userToken}`);

        assert.equal(res.status, 400);
        assert.equal(res.body.success, false);
        assert.ok(res.body.message.includes("Invalid product ID"));
    });

    // 6. Review addition validates valid ObjectId and rounds rating
    test("Review creation rejects invalid product ObjectId with 400", async () => {
        const res = await request(app)
            .post("/api/reviews")
            .set("Authorization", `Bearer ${userToken}`)
            .send({
                productId: "invalid-product-id",
                rating: 5,
                comment: "Great quality audio gear"
            });

        assert.equal(res.status, 400);
        assert.equal(res.body.success, false);
        assert.ok(res.body.message.includes("Invalid product ID"));
    });

    // 7. Review addition creates review with rounded integer rating
    test("Review creation rounds decimal rating to nearest integer", async () => {
        let createdReview = null;
        Review.findOne = () => Promise.resolve(null);
        Review.create = (doc) => {
            createdReview = doc;
            return Promise.resolve({ ...doc, _id: "60d0fe4f5311236168a10999" });
        };
        Review.find = () => Promise.resolve([{ rating: 5 }]);
        Product.findByIdAndUpdate = () => Promise.resolve({});

        const res = await request(app)
            .post("/api/reviews")
            .set("Authorization", `Bearer ${userToken}`)
            .send({
                productId: validProductId,
                rating: 4.8,
                comment: "Excellent crystal clear sound"
            });

        assert.equal(res.status, 201);
        assert.equal(res.body.success, true);
        assert.equal(createdReview.rating, 5); // 4.8 rounded to 5
    });

    // 8. Admin cannot delete the sole remaining administrator account
    test("Admin cannot delete the sole remaining administrator account", async () => {
        User.countDocuments = () => Promise.resolve(1); // Only 1 admin exists

        const res = await request(app)
            .delete(`/api/admin/users/${otherAdminId}`)
            .set("Authorization", `Bearer ${adminToken}`);

        assert.equal(res.status, 400);
        assert.equal(res.body.success, false);
        assert.ok(res.body.message.includes("sole remaining administrator"));
    });

    // 9. Admin cannot demote the sole remaining administrator account
    test("Admin cannot demote the sole remaining administrator account", async () => {
        User.countDocuments = () => Promise.resolve(1); // Only 1 admin exists

        const res = await request(app)
            .put(`/api/admin/users/${otherAdminId}/role`)
            .set("Authorization", `Bearer ${adminToken}`)
            .send({ role: "user" });

        assert.equal(res.status, 400);
        assert.equal(res.body.success, false);
        assert.ok(res.body.message.includes("sole remaining administrator"));
    });

    // 10. Contact form rejects message exceeding 5000 characters
    test("POST /api/contact rejects messages longer than 5000 characters", async () => {
        const hugeMessage = "A".repeat(5050);

        const res = await request(app)
            .post("/api/contact")
            .send({
                name: "Test Customer",
                email: "customer@example.com",
                message: hugeMessage
            });

        assert.equal(res.status, 400);
        assert.equal(res.body.success, false);
        assert.ok(res.body.message.includes("cannot exceed 5000 characters"));
    });
});
