import mongoose from "mongoose";
import env from "./env.js";

const connectDatabase = async () => {
    try {
        await mongoose.connect(env.mongo_uri);

        console.log("✅ MongoDB Connected");
        console.log("Database:", mongoose.connection.name);

    } catch (error) {
        console.error("MongoDB Error:", error.message);
        process.exit(1);
    }
};

export default connectDatabase;