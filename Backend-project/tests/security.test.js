import { test, describe } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../src/app.js";
import env from "../src/config/env.js";

describe("Backend Security & Authorization Gate Tests", () => {

    test("Unauthenticated request to /api/cart should be blocked with 401", async () => {
        const res = await request(app).get("/api/cart/any-user-id");
        assert.equal(res.status, 401);
        assert.equal(res.body.success, false);
        assert.ok(res.body.message.includes("Token missing"));
    });

    test("Unauthenticated request to /api/orders should be blocked with 401", async () => {
        const res = await request(app).get("/api/orders/any-user-id");
        assert.equal(res.status, 401);
        assert.equal(res.body.success, false);
        assert.ok(res.body.message.includes("Token missing"));
    });

    test("Unauthenticated request to /api/wishlist should be blocked with 401", async () => {
        const res = await request(app).get("/api/wishlist");
        assert.equal(res.status, 401);
        assert.equal(res.body.success, false);
    });

    test("Unauthenticated request to /api/admin/dashboard should be blocked with 401", async () => {
        const res = await request(app).get("/api/admin/dashboard");
        assert.equal(res.status, 401);
        assert.equal(res.body.success, false);
    });

    test("Forged or invalid JWT token is rejected with 401", async () => {
        const res = await request(app)
            .get("/api/users/profile")
            .set("Authorization", "Bearer invalid.jwt.token12345");
        assert.equal(res.status, 401);
        assert.equal(res.body.success, false);
        assert.ok(res.body.message.includes("Invalid token"));
    });

    test("Expired JWT token is rejected with 401 and specific expiry message", async () => {
        const expiredToken = jwt.sign(
            { id: "60d0fe4f5311236168a109ca" },
            env.jwt_secret,
            { expiresIn: -10 }
        );

        const res = await request(app)
            .get("/api/users/profile")
            .set("Authorization", `Bearer ${expiredToken}`);
        assert.equal(res.status, 401);
        assert.equal(res.body.success, false);
        assert.ok(res.body.message.includes("expired"));
    });

    test("Auth rate limiting headers are mounted on /api/auth and /api/password", async () => {
        const res = await request(app)
            .post("/api/auth/login")
            .send({});
        assert.equal(res.status, 400); // Validation catches missing fields
        assert.ok(res.headers["ratelimit-limit"] || res.headers["x-ratelimit-limit"] || res.headers["ratelimit-remaining"]);
    });

    test("Auth registration input validation rejects missing fields", async () => {
        const res = await request(app)
            .post("/api/auth/register")
            .send({ name: "", email: "bad-email", password: "123" });
        assert.equal(res.status, 400);
        assert.equal(res.body.success, false);
    });

    test("Password reset input validation rejects empty body", async () => {
        const res = await request(app)
            .post("/api/password/forgot-password")
            .send({});
        assert.equal(res.status, 400);
        assert.equal(res.body.success, false);
    });

});
