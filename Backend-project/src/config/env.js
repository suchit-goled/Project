import dotenv from "dotenv";

dotenv.config();



export default {
  node_env: process.env.NODE_ENV || "development",
  port: process.env.PORT || 8000,
  mongo_uri: process.env.MONGO_URI,
  jwt_secret: process.env.JWT_SECRET || "default_jwt_secret_change_in_production",
  jwt_expires_in: process.env.JWT_EXPIRES_IN || "7d",

  razorpay_key_id: process.env.RAZORPAY_KEY_ID || "",
  razorpay_key_secret: process.env.RAZORPAY_KEY_SECRET || "",

  cloudinary_cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "",
  cloudinary_api_key: process.env.CLOUDINARY_API_KEY || "",
  cloudinary_api_secret: process.env.CLOUDINARY_API_SECRET || "",

  email_user: process.env.EMAIL_USER || "",
  email_pass: process.env.EMAIL_PASS || "",

  frontend_url: process.env.FRONTEND_URL || "http://localhost:3000",
};