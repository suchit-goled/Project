import app from "./app.js";
import connectDatabase, { closeDatabaseConnection } from "./config/database.js";
import env from "./config/env.js";

const startServer = async () => {
    try {
        console.log("═══════════════════════════════════════════════════════════════");
        console.log("⚡ ElectroNova Enterprise High-Availability Server Starting... ");
        console.log("   • Architecture: CDN -> Load Balancer -> Stateless App Server");
        console.log("   • Data & Async: Distributed Cache + Continuous DB + Queue   ");
        console.log("   • Workers: In-Process Asynchronous Job Engine               ");
        console.log("═══════════════════════════════════════════════════════════════");

        // 1. Establish continuous, resilient database connection
        await connectDatabase();

        // 2. Start HTTP App Server
        const server = app.listen(env.port, () => {
            console.log(`🚀 ElectroNova Server listening on port ${env.port} [PID: ${process.pid}]`);
            console.log(`   - Readiness Probe: http://localhost:${env.port}/ready`);
            console.log(`   - Liveness Probe:  http://localhost:${env.port}/healthz`);
            console.log(`   - Telemetry API:   http://localhost:${env.port}/api/health`);
        });

        // 3. Graceful Shutdown Handlers (Kubernetes, Docker, PM2, ALB)
        const shutdown = async (signal) => {
            console.log(`\n🛑 Received ${signal}. Initiating graceful shutdown...`);
            server.close(async () => {
                console.log("[Server] Closed pending HTTP connections.");
                await closeDatabaseConnection();
                console.log("✅ Graceful shutdown completed. Exiting.");
                process.exit(0);
            });

            // Force termination if operations fail to drain within 10s
            setTimeout(() => {
                console.error("⚠️ Forcefully terminating after 10s timeout.");
                process.exit(1);
            }, 10000).unref();
        };

        process.on("SIGINT", () => shutdown("SIGINT"));
        process.on("SIGTERM", () => shutdown("SIGTERM"));

    } catch (error) {
        console.error("❌ Critical error during server bootstrap:", error);
        // Do not immediately kill process unless in test; give connection retry loop time to recover
        if (process.env.NODE_ENV === "test") {
            process.exit(1);
        }
    }
};

// Global unhandled error mitigation to prevent sudden server crashes
process.on("unhandledRejection", (reason, promise) => {
    console.error("[System] Unhandled Promise Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (error) => {
    console.error("[System] Uncaught Exception caught:", error.message, error.stack);
});

startServer();
