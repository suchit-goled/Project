#!/usr/bin/env node
/**
 * ElectroNova Automated Database Backup Utility
 * Cross-platform JSON + GZIP collection exporter with 7-day retention
 */

import fs from "fs";
import path from "path";
import zlib from "zlib";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load backend .env from parent dir (Project/Backend-project/.env)
const envPath = path.resolve(__dirname, "../.env");
if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
} else {
    dotenv.config();
}

const mongoUri = process.env.MONGO_URI;

if (!mongoUri) {
    console.error("❌ Error: MONGO_URI is not set in environment or Project/Backend-project/.env");
    process.exit(1);
}

const RETENTION_DAYS = 7;
// Backups stored at repo root /backups
const BACKUP_ROOT = path.resolve(__dirname, "../../../backups");

async function runBackup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const targetDir = path.join(BACKUP_ROOT, `backup-${timestamp}`);

    if (!fs.existsSync(BACKUP_ROOT)) {
        fs.mkdirSync(BACKUP_ROOT, { recursive: true });
    }
    fs.mkdirSync(targetDir, { recursive: true });

    console.log(`🚀 Starting ElectroNova database backup to: ${targetDir}`);

    try {
        await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 15000 });
        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();

        console.log(`📦 Found ${collections.length} collections to back up...`);

        let totalDocs = 0;

        for (const colInfo of collections) {
            const colName = colInfo.name;
            const collection = db.collection(colName);
            const docs = await collection.find({}).toArray();
            totalDocs += docs.length;

            const jsonStr = JSON.stringify(docs, null, 2);
            const compressed = zlib.gzipSync(Buffer.from(jsonStr, "utf-8"));

            const outFile = path.join(targetDir, `${colName}.json.gz`);
            fs.writeFileSync(outFile, compressed);

            console.log(`  ✓ ${colName.padEnd(20)}: ${docs.length} documents (${(compressed.length / 1024).toFixed(1)} KB gzipped)`);
        }

        // Write backup metadata manifest
        const manifest = {
            timestamp: new Date().toISOString(),
            collectionsCount: collections.length,
            totalDocuments: totalDocs,
            version: "2.3.0",
            retentionDays: RETENTION_DAYS
        };
        fs.writeFileSync(path.join(targetDir, "manifest.json"), JSON.stringify(manifest, null, 2));

        console.log(`✅ Backup successfully completed! Total documents: ${totalDocs}`);

        // Retention pruning
        pruneOldBackups();
    } catch (err) {
        console.error("❌ Backup failed:", err.message);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
    }
}

function pruneOldBackups() {
    try {
        const entries = fs.readdirSync(BACKUP_ROOT, { withFileTypes: true });
        const now = Date.now();
        const maxAgeMs = RETENTION_DAYS * 24 * 60 * 60 * 1000;

        let prunedCount = 0;

        for (const entry of entries) {
            if (entry.isDirectory() && entry.name.startsWith("backup-")) {
                const dirPath = path.join(BACKUP_ROOT, entry.name);
                const stats = fs.statSync(dirPath);
                if (now - stats.mtimeMs > maxAgeMs) {
                    fs.rmSync(dirPath, { recursive: true, force: true });
                    prunedCount++;
                    console.log(`🧹 Pruned expired backup: ${entry.name}`);
                }
            }
        }

        if (prunedCount === 0) {
            console.log(`ℹ️  No backups exceeded the ${RETENTION_DAYS}-day retention threshold.`);
        }
    } catch (pruneErr) {
        console.warn("⚠️ Warning: Retention pruning encountered an issue:", pruneErr.message);
    }
}

runBackup();
