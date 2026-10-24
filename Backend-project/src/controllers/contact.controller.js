import validator from "validator";
import ApiResponse from "../utils/apiResponse.js";
import { sendEmail } from "../utils/sendEmail.js";
import env from "../config/env.js";

const escapeHtml = (str) => {
    if (!str || typeof str !== "string") return "";
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
};

export const handleContactMessage = async (req, res, next) => {
    try {
        const { name, email, phone, subject, message } = req.body;

        if (!name || !email || !message) {
            return ApiResponse.error(res, "Name, email, and message are required fields.", 400);
        }

        const normalizedEmail = String(email).trim().toLowerCase();
        if (!validator.isEmail(normalizedEmail)) {
            return ApiResponse.error(res, "Please provide a valid email address.", 400);
        }

        const trimmedName = String(name).trim();
        const trimmedSubject = subject ? String(subject).trim() : "New Inquiry";
        const trimmedMessage = String(message).trim();
        const trimmedPhone = phone ? String(phone).trim() : "Not provided";

        if (trimmedMessage.length < 5) {
            return ApiResponse.error(res, "Message must be at least 5 characters long.", 400);
        }

        // Try to dispatch an admin notification email if configured
        if (env.email_user && env.email_pass) {
            try {
                const safeName = escapeHtml(trimmedName);
                const safeSubject = escapeHtml(trimmedSubject);
                const safePhone = escapeHtml(trimmedPhone);
                const safeMessage = escapeHtml(trimmedMessage).replace(/\n/g, "<br/>");

                await sendEmail({
                    email: env.email_user,
                    subject: `[ElectroNova Contact] ${safeSubject} - ${safeName}`,
                    html: `
                        <h2>New Customer Contact Message</h2>
                        <p><strong>Name:</strong> ${safeName}</p>
                        <p><strong>Email:</strong> ${escapeHtml(normalizedEmail)}</p>
                        <p><strong>Phone:</strong> ${safePhone}</p>
                        <p><strong>Subject:</strong> ${safeSubject}</p>
                        <hr />
                        <p><strong>Message:</strong></p>
                        <p>${safeMessage}</p>
                    `
                });
            } catch (emailErr) {
                console.error("Failed to deliver contact notification email:", emailErr.message);
            }
        }

        return ApiResponse.success(
            res,
            { received: true },
            "Message sent successfully! We will get back to you soon.",
            200
        );
    } catch (error) {
        next(error);
    }
};

export default { handleContactMessage };
