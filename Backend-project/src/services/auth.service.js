import bcrypt from "bcryptjs";
import validator from "validator";
import userRepository from "../repositories/user.repository.js";
import generateToken from "../utils/generateToken.js";
import { sendEmail } from "../utils/sendEmail.js";
import { welcomeEmailTemplate } from "../templates/welcomeEmail.js";
import AppError from "../utils/AppError.js";

class AuthService {
    async register({ name, email, password }) {
        if (!name || !email || !password) {
            throw new AppError("All fields (name, email, password) are required", 400);
        }

        const normalizedEmail = email.toLowerCase().trim();

        if (!validator.isEmail(normalizedEmail)) {
            throw new AppError("Invalid email address", 400);
        }

        if (password.length < 6) {
            throw new AppError("Password must be at least 6 characters long", 400);
        }

        const existingUser = await userRepository.findByEmail(normalizedEmail);
        if (existingUser) {
            throw new AppError("Email is already registered", 400);
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await userRepository.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword,
        });

        // Send welcome email asynchronously without blocking registration
        if (user.email) {
            sendEmail({
                email: user.email,
                subject: "Welcome to ElectroNova 🎉",
                html: welcomeEmailTemplate(user.name),
            }).catch(err => {
                console.error("Welcome email delivery failed:", err.message);
            });
        }

        const token = generateToken(user._id);

        return {
            token,
            user: {
                _id: user._id,
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            }
        };
    }

    async login({ email, password }) {
        if (!email || !password) {
            throw new AppError("Email and password are required", 400);
        }

        const normalizedEmail = email.toLowerCase().trim();
        const user = await userRepository.findByEmail(normalizedEmail);

        if (!user) {
            throw new AppError("Invalid email or password", 401);
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new AppError("Invalid email or password", 401);
        }

        const token = generateToken(user._id);

        return {
            token,
            user: {
                _id: user._id,
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            }
        };
    }

    async getProfile(userId) {
        const user = await userRepository.findById(userId);
        if (!user) {
            throw new AppError("User not found", 404);
        }
        return user;
    }
}

export default new AuthService();
