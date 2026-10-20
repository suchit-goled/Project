import { test, describe } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import app from "../src/app.js";
import Product from "../src/models/Product.js";

describe("Contact, Admin & Product Endpoint Tests", () => {
    const origDistinct = Product.distinct;
    const origCount = Product.countDocuments;
    const origFind = Product.find;

    test.before(() => {
        Product.distinct = () => Promise.resolve(["Laptops", "Audio", "Phones"]);
        Product.countDocuments = () => Promise.resolve(1);
        Product.find = () => ({
            sort: () => ({
                skip: () => ({
                    limit: () => Promise.resolve([{
                        _id: "60d0fe4f5311236168a109ca",
                        product_title: "Test Product",
                        discounted_price: 999,
                        product_category: "Audio"
                    }])
                })
            })
        });
    });

    test.after(() => {
        Product.distinct = origDistinct;
        Product.countDocuments = origCount;
        Product.find = origFind;
    });

    test("POST /api/contact rejects request with missing fields", async () => {
        const res = await request(app)
            .post("/api/contact")
            .send({});
        assert.equal(res.status, 400);
        assert.equal(res.body.success, false);
        assert.ok(res.body.message.includes("required"));
    });

    test("POST /api/contact rejects invalid email format", async () => {
        const res = await request(app)
            .post("/api/contact")
            .send({
                name: "Test User",
                email: "invalid-email-string",
                message: "Hello ElectroNova support team"
            });
        assert.equal(res.status, 400);
        assert.equal(res.body.success, false);
        assert.ok(res.body.message.includes("valid email"));
    });

    test("POST /api/contact rejects message shorter than 5 characters", async () => {
        const res = await request(app)
            .post("/api/contact")
            .send({
                name: "Test User",
                email: "test@example.com",
                message: "Hi"
            });
        assert.equal(res.status, 400);
        assert.equal(res.body.success, false);
        assert.ok(res.body.message.includes("at least 5 characters"));
    });

    test("POST /api/contact accepts valid submission", async () => {
        const res = await request(app)
            .post("/api/contact")
            .send({
                name: "Test User",
                email: "test@example.com",
                phone: "+91 9876543210",
                subject: "Inquiry about product warranty",
                message: "Could you please explain the warranty claim process for headphones?"
            });
        assert.equal(res.status, 200);
        assert.equal(res.body.success, true);
        assert.ok(res.body.message.includes("successfully"));
    });

    test("GET /api/admin/users blocked with 401 when no token is provided", async () => {
        const res = await request(app).get("/api/admin/users");
        assert.equal(res.status, 401);
        assert.equal(res.body.success, false);
    });

    test("GET /api/admin/carts blocked with 401 when no token is provided", async () => {
        const res = await request(app).get("/api/admin/carts");
        assert.equal(res.status, 401);
        assert.equal(res.body.success, false);
    });

    test("GET /api/products/categories returns 200 array", async () => {
        const res = await request(app).get("/api/products/categories");
        assert.equal(res.status, 200);
        assert.equal(res.body.success, true);
        assert.ok(Array.isArray(res.body.data));
        assert.equal(res.body.data.length, 3);
    });

    test("GET /api/products handles regex characters in search without server crash", async () => {
        const res = await request(app).get("/api/products?search=[unclosed-regex(*+?");
        assert.equal(res.status, 200);
        assert.equal(res.body.success, true);
    });

});
