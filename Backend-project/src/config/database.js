import mongoose from "mongoose";
import env from "./env.js";

/**
 * Resilient Database Connection Manager for ElectroNova
 * 
 * Provides:
 * - High-throughput connection pooling (maxPoolSize: 50, minPoolSize: 10)
 * - Continuous auto-reconnection with exponential backoff & jitter
 * - Heartbeat health monitoring & live ping latency measurement
 * - Graceful shutdown and query buffering during transient failovers
 */

const DB_STATE = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
};

let isReconnecting = false;
let reconnectTimer = null;
let reconnectAttempts = 0;
let lastConnectedAt = null;
let lastDisconnectedAt = null;
let lastError = null;
let lastPingMs = 0;

const POOL_CONFIG = {
    maxPoolSize: parseInt(process.env.DB_MAX_POOL_SIZE || "50", 10),
    minPoolSize: parseInt(process.env.DB_MIN_POOL_SIZE || "10", 10),
    maxIdleTimeMS: 30000,
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    heartbeatFrequencyMS: 10000,
    retryWrites: true,
    retryReads: true,
};

// Configure Mongoose global buffering behavior: true in dev/prod for resilience, false in unit tests
mongoose.set("bufferCommands", process.env.NODE_ENV !== "test");

const registerLifecycleListeners = () => {
    // Avoid attaching duplicate listeners
    if (mongoose.connection._hasElectroNovaListeners) return;
    mongoose.connection._hasElectroNovaListeners = true;

    mongoose.connection.on("connected", () => {
        lastConnectedAt = new Date().toISOString();
        lastError = null;
        reconnectAttempts = 0;
        isReconnecting = false;
        if (reconnectTimer) {
            clearTimeout(reconnectTimer);
            reconnectTimer = null;
        }
        console.log(`[Database] MongoDB Connected: "${mongoose.connection.name}" on host "${mongoose.connection.host}"`);
    });

    mongoose.connection.on("open", () => {
        console.log("[Database] MongoDB Connection Stream Open & Ready for Traffic");
    });

    mongoose.connection.on("disconnected", () => {
        lastDisconnectedAt = new Date().toISOString();
        console.warn("[Database] MongoDB Disconnected! Triggering continuous resilience manager...");
        scheduleReconnect();
    });

    mongoose.connection.on("reconnected", () => {
        lastConnectedAt = new Date().toISOString();
        console.log("[Database] MongoDB Reconnected successfully!");
    });

    mongoose.connection.on("error", (err) => {
        lastError = err.message;
        console.error("[Database] MongoDB Error encountered:", err.message);
        // Do NOT process.exit(1) here — allow reconnect loop to handle transient Atlas network blips
    });

    mongoose.connection.on("close", () => {
        console.log("[Database] MongoDB connection closed.");
    });
};

/**
 * Calculates exponential backoff with randomized jitter
 */
const getBackoffDelay = (attempt) => {
    const base = Math.min(1000 * Math.pow(2, attempt), 30000); // 1s, 2s, 4s, 8s, 16s, max 30s
    const jitter = Math.floor(Math.random() * 1000); // 0-1000ms jitter
    return base + jitter;
};

/**
 * Continuous auto-reconnection loop
 */
const scheduleReconnect = () => {
    if (isReconnecting || mongoose.connection.readyState === 1) {
        return;
    }
    isReconnecting = true;
    reconnectAttempts++;

    const delay = getBackoffDelay(reconnectAttempts);
    console.log(`[Database] Scheduling reconnection attempt #${reconnectAttempts} in ${delay}ms...`);

    if (reconnectTimer) clearTimeout(reconnectTimer);

    reconnectTimer = setTimeout(async () => {
        try {
            if (mongoose.connection.readyState === 0 && env.mongo_uri) {
                console.log(`[Database] Reconnecting to MongoDB (attempt #${reconnectAttempts})...`);
                await mongoose.connect(env.mongo_uri, POOL_CONFIG);
            }
        } catch (err) {
            lastError = err.message;
            console.error(`[Database] Reconnection attempt #${reconnectAttempts} failed:`, err.message);
            isReconnecting = false;
            // Schedule next attempt continuously
            scheduleReconnect();
        }
    }, delay);
};

/**
 * Main Database Connection Initializer
 */
export const connectDatabase = async () => {
    registerLifecycleListeners();

    if (!env.mongo_uri) {
        const errorMsg = "MONGO_URI environment variable is not defined";
        console.error("[Database] Critical Error:", errorMsg);
        if (process.env.NODE_ENV === "production") {
            throw new Error(errorMsg);
        }
        return false;
    }

    if (mongoose.connection.readyState === 1) {
        return true;
    }

    try {
        await mongoose.connect(env.mongo_uri, POOL_CONFIG);
        return true;
    } catch (error) {
        lastError = error.message;
        console.error("[Database] Initial Connection Failure:", error.message);
        // In test mode or non-production, do not kill the process; trigger continuous reconnect
        if (process.env.NODE_ENV !== "test") {
            scheduleReconnect();
        }
        return false;
    }
};

/**
 * Checks whether the database is actively connected
 */
export const isDatabaseConnected = () => {
    return mongoose.connection.readyState === 1;
};

/**
 * Performs a live ping and returns detailed health telemetry
 */
export const checkDatabaseHealth = async () => {
    const readyState = mongoose.connection.readyState;
    const status = DB_STATE[readyState] || "unknown";
    const isConnected = readyState === 1;

    let pingMs = null;
    if (isConnected && mongoose.connection.db) {
        try {
            const start = Date.now();
            await mongoose.connection.db.admin().ping();
            pingMs = Date.now() - start;
            lastPingMs = pingMs;
        } catch (err) {
            pingMs = -1;
            lastError = err.message;
        }
    }

    return {
        status,
        isConnected,
        readyState,
        pingMs: pingMs !== null ? pingMs : lastPingMs,
        host: mongoose.connection.host || null,
        name: mongoose.connection.name || null,
        pool: {
            maxPoolSize: POOL_CONFIG.maxPoolSize,
            minPoolSize: POOL_CONFIG.minPoolSize,
        },
        reconnectAttempts,
        lastConnectedAt,
        lastDisconnectedAt,
        lastError,
        heartbeat: new Date().toISOString(),
    };
};

/**
 * Graceful connection close
 */
export const closeDatabaseConnection = async () => {
    if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
    }
    if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.close(false);
        console.log("[Database] Cleanly closed MongoDB connection.");
    }
};

export default connectDatabase;
