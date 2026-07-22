import bcrypt from "bcryptjs";
import validator from "validator";

import User from "../models/user.model.js";
import generateToken from "../utils/generateToken.js";

import { sendEmail } from "../utils/sendEmail.js";
import { welcomeEmailTemplate } from "../templates/welcomeEmail.js";


// -------------------------
// Signup
// -------------------------

export const signup = async (req, res) => {

    try {

        const { name, email, password } = req.body;

        if (!name || !email || !password) {

            return res.status(400).json({
                success: false,
                message: "All fields are required."
            });

        }

        if (!validator.isEmail(email)) {

            return res.status(400).json({
                success: false,
                message: "Invalid email address."
            });

        }

        if (password.length < 6) {

            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters."
            });

        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {

            return res.status(400).json({
                success: false,
                message: "Email already exists."
            });

        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({

            name,

            email,

            password: hashedPassword

        });

        const token = generateToken(user._id);

        res.status(201).json({

            success: true,

            message: "Signup successful.",

            token,

            user: {

                _id: user._id,

                name: user.name,

                email: user.email,

                role: user.role

            }

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            message: "Server Error"

        });

    }

};

// -------------------------
// Login
// -------------------------
export const loginUser = async (req, res) => {
    try {

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const isPasswordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

export const registerUser = async (req, res) => {

    try {

        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Email already exists",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
        });
        try {
    console.log("📧 Sending welcome email to:", user.email);

    await sendEmail({
        email: user.email,
        subject: "Welcome to ElectroNova 🎉",
        html: welcomeEmailTemplate(user.name),
    });

    console.log("✅ Welcome email sent successfully");
} catch (err) {
    console.error("❌ Welcome email error:");
    console.error(err);
}

        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }

};


export const getProfile = async (req, res) => {
    res.status(200).json({
        success: true,
        user: req.user
    });
};