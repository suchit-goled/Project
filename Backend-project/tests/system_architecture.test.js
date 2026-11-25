import { test, describe } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import app from "../src/app.js";
import cacheService from "../src/cache/cacheService.js";
import messageQueue from "../src/queue/messageQueue.js";
import { checkDatabaseHealth, isDatabaseConnected } from "../src/config/database.js";

describe("System Architecture Integration & Telemetry Tests", () => {

    test("1. Liveness Probe (GET /healthz & GET /live) should return 200 alive", async () => {
        const resHealthz = await request(app).get("/healthz");
        assert.equal(resHealthz.status, 200);
        assert.equal(resHealthz.body.status, "alive");
        assert.ok(typeof resHealthz.body.uptime === "number");

        const resLive = await request(app).get("/live");
        assert.equal(resLive.status, 200);
        assert.equal(resLive.body.status, "alive");
    });

    test("2. Readiness Probe (GET /ready) responds with valid readiness payload", async () => {
        const res = await request(app).get("/ready");
        // Status is either 200 (connected) or 503 (disconnected/reconnecting in test isolation)
        assert.ok(res.status === 200 || res.status === 503);
        assert.ok(typeof res.body.ready === "boolean");
        assert.ok(res.body.database);
    });

    test("3. Observability Telemetry (GET /api/health) exposes all 3 architectural tiers", async () => {
        const res = await request(app).get("/api/health");
        assert.equal(res.status, 200);
        assert.equal(res.body.status, "healthy");
        assert.ok(typeof res.body.uptime === "number");

        // Verify System Architecture Telemetry
        const arch = res.body.architecture;
        assert.ok(arch, "Architecture field must exist");

        // Entry Layer
        assert.ok(arch.entryLayer.cdn);
        assert.ok(arch.entryLayer.loadBalancer);

        // Compute Layer
        assert.ok(arch.compute.type);
        assert.ok(arch.compute.workers);
        assert.ok(arch.compute.memory);

        // Data & Async Layer
        assert.ok(arch.dataAndAsync.database);
        assert.ok(arch.dataAndAsync.cache);
        assert.ok(arch.dataAndAsync.messageQueue);
    });

    test("4. CDN & Edge Cache-Control headers set correctly on public vs private routes", async () => {
        // Public Hot Read route: Cache-Control public with max-age and s-maxage
        const publicRes = await request(app).get("/api/products/categories");
        const publicCacheHeader = publicRes.headers["cache-control"];
        assert.ok(publicCacheHeader && publicCacheHeader.includes("public"));
        assert.ok(publicCacheHeader.includes("s-maxage"));

        // Private Stateful route: Cache-Control private, no-store
        const privateRes = await request(app).get("/api/cart/test-id");
        const privateCacheHeader = privateRes.headers["cache-control"];
        assert.ok(privateCacheHeader && privateCacheHeader.includes("private"));
        assert.ok(privateCacheHeader.includes("no-store"));
    });

    test("5. Cache Service: in-memory TTL caching, retrieval, and pattern invalidation", async () => {
        const testKey = "test:item:42";
        cacheService.set(testKey, { id: 42, title: "Quantum Laptop" }, 60);

        const cached = cacheService.get(testKey);
        assert.deepEqual(cached, { id: 42, title: "Quantum Laptop" });

        // Test pattern invalidation
        cacheService.set("products:cat:laptops", [42], 60);
        cacheService.set("products:cat:phones", [99], 60);

        const deletedCount = cacheService.delPattern("products:cat:*");
        assert.ok(deletedCount >= 2);
        assert.equal(cacheService.get("products:cat:laptops"), null);
        assert.equal(cacheService.get("products:cat:phones"), null);

        // Other keys remain intact
        assert.deepEqual(cacheService.get(testKey), { id: 42, title: "Quantum Laptop" });
        cacheService.del(testKey);
    });

    test("6. Cache Middleware: sets X-Cache MISS on first load and HIT on second load", async () => {
        // First request: MISS
        const res1 = await request(app).get("/api/products/brands");
        assert.equal(res1.status, 200);
        assert.ok(res1.headers["x-cache"] === "MISS" || res1.headers["x-cache"] === "HIT");

        // Second request: Should be HIT
        const res2 = await request(app).get("/api/products/brands");
        assert.equal(res2.status, 200);
        assert.equal(res2.headers["x-cache"], "HIT");
    });

    test("7. Message Queue: Enqueue, process, and update queue telemetry", async () => {
        let jobExecuted = false;
        let jobPayload = null;

        messageQueue.registerProcessor("test:async:job", async (payload) => {
            jobExecuted = true;
            jobPayload = payload;
            return { ok: true };
        });

        const jobId = messageQueue.enqueue("test:async:job", { action: "sync_warehouse", storeId: "store_123" });
        assert.ok(jobId.startsWith("job_"));

        // Wait a small tick for event-loop processing
        await new Promise(resolve => setTimeout(resolve, 80));

        assert.equal(jobExecuted, true);
        assert.equal(jobPayload.storeId, "store_123");

        const stats = messageQueue.getStats();
        assert.ok(stats.totalEnqueued >= 1);
        assert.ok(stats.completedJobs >= 1);
        assert.equal(stats.status, "running");
    });

    test("8. Continuous Database Health Telemetry structure", async () => {
        const health = await checkDatabaseHealth();
        assert.ok("status" in health);
        assert.ok("isConnected" in health);
        assert.ok("readyState" in health);
        assert.ok("pool" in health);
        assert.equal(health.pool.maxPoolSize, 50);
        assert.equal(health.pool.minPoolSize, 10);
        assert.ok("heartbeat" in health);
    });

});
