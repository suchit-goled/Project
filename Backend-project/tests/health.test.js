import { test, describe } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import app from "../src/app.js";

describe("Backend Health & Security Baseline Tests", () => {

    test("GET / should return 200 with service status and metadata", async () => {
        const res = await request(app).get("/");
        assert.equal(res.status, 200);
        assert.equal(res.body.success, true);
        assert.equal(res.body.version, "2.0.0");
    });

    test("GET /api/health should return healthy status", async () => {
        const res = await request(app).get("/api/health");
        assert.equal(res.status, 200);
        assert.equal(res.body.status, "healthy");
        assert.ok(typeof res.body.uptime === "number");
    });

    test("Helmet security headers should be set on responses", async () => {
        const res = await request(app).get("/");
        assert.equal(res.headers["x-content-type-options"], "nosniff");
        assert.ok(res.headers["x-frame-options"] || res.headers["content-security-policy"]);
    });

    test("Unmatched API route should return 404 JSON response instead of HTML", async () => {
        const res = await request(app).get("/api/non-existent-endpoint-test");
        assert.equal(res.status, 404);
        assert.equal(res.body.success, false);
        assert.ok(res.body.message.includes("Route Not Found"));
    });

});
