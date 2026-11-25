import messageQueue from "../queue/messageQueue.js";
import cacheService from "../cache/cacheService.js";
import nodemailer from "nodemailer";
import env from "../config/env.js";

/**
 * Background Job Worker Engine
 * 
 * Executes asynchronous tasks dispatched from App Servers:
 * - Email delivery (order confirmations, notifications, password resets)
 * - Cache invalidation and warming
 * - Order audit and notification processing
 */

let workerTransporter = null;

const getWorkerTransporter = () => {
    if (!workerTransporter) {
        if (env.smtp_host) {
            workerTransporter = nodemailer.createTransport({
                host: env.smtp_host,
                port: env.smtp_port,
                secure: env.smtp_secure,
                auth: {
                    user: env.email_user || process.env.EMAIL_USER,
                    pass: env.email_pass || process.env.EMAIL_PASS,
                },
            });
        } else {
            workerTransporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: env.email_user || process.env.EMAIL_USER,
                    pass: env.email_pass || process.env.EMAIL_PASS,
                },
            });
        }
    }
    return workerTransporter;
};

export const initBackgroundWorkers = () => {
    // 1. Asynchronous Email Processor
    messageQueue.registerProcessor("email:send", async (payload) => {
        const { email, subject, html } = payload;

        if (process.env.NODE_ENV === "test" || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            return {
                mocked: true,
                messageId: `mock-async-worker-${Date.now()}`,
                recipient: email,
            };
        }

        const mailer = getWorkerTransporter();
        const fromAddress = env.email_from || env.email_user || process.env.EMAIL_USER || "ElectroNova <support@electronova.tech>";

        const info = await mailer.sendMail({
            from: fromAddress,
            to: email,
            subject,
            html,
        });

        return { messageId: info.messageId, recipient: email };
    });

    // 2. Cache Invalidation Processor
    messageQueue.registerProcessor("cache:invalidate", async (payload) => {
        const { pattern } = payload;
        if (pattern) {
            const count = cacheService.delPattern(pattern);
            return { invalidatedCount: count, pattern };
        }
        return { invalidatedCount: 0 };
    });

    // 3. Post-Order Background Processing
    messageQueue.registerProcessor("order:process", async (payload) => {
        const { orderId, totalAmount, itemCount } = payload;
        console.log(`[Worker] Post-Order Background Processing for #${orderId} (Items: ${itemCount}, Total: ₹${totalAmount})`);
        // Invalidate deals, products, and analytics cache
        cacheService.delPattern("http:/api/products*");
        cacheService.delPattern("http:/api/home*");
        return { processed: true, orderId };
    });

    console.log("[Worker] Background Worker Engine initialized with processors: [email:send, cache:invalidate, order:process]");
};

export default initBackgroundWorkers;
