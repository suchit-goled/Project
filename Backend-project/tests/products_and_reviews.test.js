import { test, describe } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../src/app.js";
import env from "../src/config/env.js";
import Product from "../src/models/Product.js";
import Review from "../src/models/review.model.js";
import Wishlist from "../src/models/wishlist.model.js";
import User from "../src/models/user.model.js";
import HomeSettings from "../src/models/HomeSettings.js";

describe("Product, Review & Catalog Deep Tests", () => {
    const testUserId = "60d0fe4f5311236168a109ca";
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

    const mockProduct = {
        _id: "60d0fe4f5311236168a109aa",
        product_title: "ElectroNova Quantum 4K OLED Monitor",
        product_category: "Monitors",
        discounted_price: 38999,
        original_price: 49999,
        discount_percentage: 22,
        product_rating: 4.9,
        total_reviews: 140,
        product_image_url: "https://example.com/oled.jpg",
        isFeatured: true
    };

    const origProductFind = Product.find;
    const origProductFindById = Product.findById;
    const origProductDistinct = Product.distinct;
    const origProductCount = Product.countDocuments;
    const origReviewFind = Review.find;
    const origReviewFindOne = Review.findOne;
    const origReviewCreate = Review.create;
    const origWishlistFind = Wishlist.find;
    const origWishlistCreate = Wishlist.create;
    const origUserFindById = User.findById;
    const origHomeSettingsFindOne = HomeSettings.findOne;

    test.before(() => {
        User.findById = (id) => ({
            select: () => Promise.resolve({
                _id: id || testUserId,
                name: "Test User",
                email: "test@example.com",
                role: id === "60d0fe4f5311236168a109cc" ? "admin" : "user"
            })
        });

        Product.find = (query) => ({
            sort: () => ({
                skip: () => ({
                    limit: () => Promise.resolve([mockProduct])
                }),
                limit: () => Promise.resolve([mockProduct])
            }),
            limit: () => Promise.resolve([mockProduct]),
            populate: () => Promise.resolve([mockProduct])
        });

        Product.findById = (id) => {
            if (id === "60d0fe4f5311236168a109aa") {
                return Promise.resolve(mockProduct);
            }
            return Promise.resolve(null);
        };

        Product.distinct = () => Promise.resolve(["Monitors", "Audio", "Laptops"]);
        Product.countDocuments = () => Promise.resolve(1);

        Review.find = () => ({
            populate: () => ({
                sort: () => Promise.resolve([
                    {
                        _id: "rev-1",
                        userId: { name: "Tester" },
                        rating: 5,
                        comment: "Exceptional visual clarity!"
                    }
                ])
            })
        });

        Review.findOne = () => Promise.resolve(null);
        Review.create = (doc) => Promise.resolve({ _id: "rev-new", ...doc });

        Wishlist.find = () => ({
            populate: () => ({
                sort: () => Promise.resolve([
                    {
                        _id: "wish-1",
                        userId: testUserId,
                        productId: mockProduct
                    }
                ])
            })
        });

        Wishlist.create = (doc) => Promise.resolve({ _id: "wish-new", ...doc });

        HomeSettings.findOne = () => ({
            populate: () => ({
                populate: () => Promise.resolve({
                    hero: {
                        badge: "PREMIUM ELECTRONICS",
                        title: "Experience Technology",
                        highlight: "Without Limits.",
                        description: "Discover premium electronics.",
                        primaryButton: "Shop Collection",
                        secondaryButton: "Explore Deals"
                    },
                    featuredProducts: [mockProduct],
                    trendingProducts: [mockProduct]
                })
            })
        });
    });

    test.after(() => {
        Product.find = origProductFind;
        Product.findById = origProductFindById;
        Product.distinct = origProductDistinct;
        Product.countDocuments = origProductCount;
        Review.find = origReviewFind;
        Review.findOne = origReviewFindOne;
        Review.create = origReviewCreate;
        Wishlist.find = origWishlistFind;
        Wishlist.create = origWishlistCreate;
        User.findById = origUserFindById;
        HomeSettings.findOne = origHomeSettingsFindOne;
    });

    test("GET /api/products returns 200 with list and pagination metadata", async () => {
        const res = await request(app).get("/api/products?page=1&limit=10");
        assert.equal(res.status, 200);
        assert.equal(res.body.success, true);
        assert.ok(Array.isArray(res.body.data.products));
        assert.equal(res.body.data.products.length, 1);
        assert.equal(res.body.data.products[0].product_title, "ElectroNova Quantum 4K OLED Monitor");
    });

    test("GET /api/products/:id returns 200 for valid existing product", async () => {
        const res = await request(app).get("/api/products/60d0fe4f5311236168a109aa");
        assert.equal(res.status, 200);
        assert.equal(res.body.success, true);
        assert.equal(res.body.data.product_title, "ElectroNova Quantum 4K OLED Monitor");
    });

    test("GET /api/products/:id returns 404 for non-existent product", async () => {
        const res = await request(app).get("/api/products/000000000000000000000000");
        assert.equal(res.status, 404);
        assert.equal(res.body.success, false);
        assert.ok(res.body.message.includes("Product not found"));
    });

    test("GET /api/products/featured returns 200 array of featured products", async () => {
        const res = await request(app).get("/api/products/featured");
        assert.equal(res.status, 200);
        assert.equal(res.body.success, true);
        assert.ok(Array.isArray(res.body.data));
    });

    test("GET /api/products/:id/related returns related products array", async () => {
        const res = await request(app).get("/api/products/60d0fe4f5311236168a109aa/related");
        assert.equal(res.status, 200);
        assert.equal(res.body.success, true);
        assert.ok(Array.isArray(res.body.data));
    });

    test("GET /api/reviews/:productId returns 200 with reviews array", async () => {
        const res = await request(app).get("/api/reviews/60d0fe4f5311236168a109aa");
        assert.equal(res.status, 200);
        assert.equal(res.body.success, true);
        assert.ok(Array.isArray(res.body.data.reviews));
        assert.equal(res.body.data.count, 1);
    });

    test("POST /api/reviews rejects unauthenticated requests with 401", async () => {
        const res = await request(app)
            .post("/api/reviews")
            .send({
                productId: "60d0fe4f5311236168a109aa",
                rating: 5,
                comment: "Superb display"
            });
        assert.equal(res.status, 401);
        assert.equal(res.body.success, false);
    });

    test("POST /api/reviews rejects missing rating with 400", async () => {
        const res = await request(app)
            .post("/api/reviews")
            .set("Authorization", `Bearer ${userToken}`)
            .send({
                productId: "60d0fe4f5311236168a109aa",
                comment: "Great quality"
            });
        assert.equal(res.status, 400);
        assert.equal(res.body.success, false);
        assert.ok(res.body.message.includes("Rating must be a number"));
    });

    test("POST /api/reviews rejects rating out of bounds (> 5) with 400", async () => {
        const res = await request(app)
            .post("/api/reviews")
            .set("Authorization", `Bearer ${userToken}`)
            .send({
                productId: "60d0fe4f5311236168a109aa",
                rating: 6,
                comment: "Over 5"
            });
        assert.equal(res.status, 400);
        assert.equal(res.body.success, false);
        assert.ok(res.body.message.includes("between 1 and 5"));
    });

    test("GET /api/home returns 200 with home layout and settings", async () => {
        const res = await request(app).get("/api/home");
        assert.equal(res.status, 200);
        assert.equal(res.body.success, true);
        assert.ok(res.body.data);
    });

    test("Admin product image upload rejects non-image mime types with 400", async () => {
        const res = await request(app)
            .post("/api/admin/products")
            .set("Authorization", `Bearer ${adminToken}`)
            .attach("image", Buffer.from("malicious executable content"), "exploit.exe");

        assert.equal(res.status, 400);
        assert.equal(res.body.success, false);
        assert.ok(res.body.message.includes("Only image files"));
    });
});
