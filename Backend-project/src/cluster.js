import cluster from "node:cluster";
import os from "node:os";

/**
 * Multi-Core App Server Cluster Manager
 * 
 * Implements the "App servers (Stateless API, auth)" compute layer from the
 * architecture diagram. Spreads incoming client traffic evenly across CPU cores,
 * provides zero-downtime worker restarts on failure, and manages worker lifecycles.
 */

if (cluster.isPrimary) {
    const numCPUs = parseInt(process.env.WEB_CONCURRENCY || process.env.WORKERS || os.cpus().length, 10);
    const workerCount = Math.max(1, Math.min(numCPUs, 8)); // sensible cap for dev & production

    console.log("═══════════════════════════════════════════════════════════════");
    console.log(`🌐 Primary Cluster Master [PID: ${process.pid}] online`);
    console.log(`🚀 Spawning ${workerCount} stateless App Server workers...`);
    console.log("═══════════════════════════════════════════════════════════════");

    for (let i = 0; i < workerCount; i++) {
        cluster.fork();
    }

    cluster.on("online", (worker) => {
        console.log(`[Cluster] Worker ${worker.id} [PID: ${worker.process.pid}] is online`);
    });

    cluster.on("exit", (worker, code, signal) => {
        console.warn(`[Cluster] Worker ${worker.id} [PID: ${worker.process.pid}] died (code: ${code}, signal: ${signal}). Auto-respawning replacement worker...`);
        cluster.fork();
    });

    const shutdownCluster = (signal) => {
        console.log(`\n[Cluster] Primary received ${signal}. Gracefully terminating all workers...`);
        for (const id in cluster.workers) {
            cluster.workers[id].process.kill(signal);
        }
        setTimeout(() => {
            console.log("[Cluster] All workers shutdown. Exiting master.");
            process.exit(0);
        }, 3000);
    };

    process.on("SIGINT", () => shutdownCluster("SIGINT"));
    process.on("SIGTERM", () => shutdownCluster("SIGTERM"));

} else {
    // Child worker runs the standard stateless app server
    import("./server.js");
}
