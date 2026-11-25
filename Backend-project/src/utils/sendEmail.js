import nodemailer from "nodemailer";
import env from "../config/env.js";
import messageQueue from "../queue/messageQueue.js";

let transporter = null;

const getTransporter = () => {
    if (!transporter) {
        if (env.smtp_host) {
            // Custom domain SMTP (e.g. Zoho, Google Workspace, AWS SES, SendGrid, Hostinger)
            transporter = nodemailer.createTransport({
                host: env.smtp_host,
                port: env.smtp_port,
                secure: env.smtp_secure,
                auth: {
                    user: env.email_user || process.env.EMAIL_USER,
                    pass: env.email_pass || process.env.EMAIL_PASS,
                },
            });
        } else {
            // Default service provider (e.g. Gmail)
            transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: env.email_user || process.env.EMAIL_USER,
                    pass: env.email_pass || process.env.EMAIL_PASS,
                },
            });
        }
    }
    return transporter;
};

/**
 * Enqueues an email into the background Message Queue for non-blocking worker delivery
 */
export const queueEmail = ({ email, subject, html, priority = false }) => {
    return messageQueue.enqueue("email:send", { email, subject, html }, { priority });
};

/**
 * Direct SMTP mail sender (with fallback handling and test mocking)
 */
export const sendEmail = async ({ email, subject, html }) => {
    // In test environment, bypass external SMTP calls to run tests deterministically and swiftly
    if (process.env.NODE_ENV === "test" || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        return {
            success: true,
            messageId: `mock-email-${Date.now()}`
        };
    }

    const mailer = getTransporter();
    const fromAddress = env.email_from || env.email_user || process.env.EMAIL_USER || "ElectroNova <support@electronova.tech>";

    return await mailer.sendMail({
        from: fromAddress,
        to: email,
        subject,
        html,
    });
};

export default sendEmail;
