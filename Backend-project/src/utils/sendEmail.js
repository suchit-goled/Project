import nodemailer from "nodemailer";
import env from "../config/env.js";

let transporter = null;

const getTransporter = () => {
    if (!transporter) {
        transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: env.email_user || process.env.EMAIL_USER,
                pass: env.email_pass || process.env.EMAIL_PASS,
            },
        });
    }
    return transporter;
};

export const sendEmail = async ({ email, subject, html }) => {
    // In test environment, bypass external SMTP calls to run tests deterministically and swiftly
    if (process.env.NODE_ENV === "test" || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        return {
            success: true,
            messageId: `mock-email-${Date.now()}`
        };
    }

    const mailer = getTransporter();
    return await mailer.sendMail({
        from: env.email_user || process.env.EMAIL_USER,
        to: email,
        subject,
        html,
    });
};

export default sendEmail;
