import mongoose from "mongoose";
import env from "./env.js";


const connectDatabase = async () => {
    try {
        if (!env.mongo_uri) {
            throw new Error("MONGO_URI environment variable is not defined");
        }
        await mongoose.connect(env.mongo_uri);
        console.log("MongoDB Connected:", mongoose.connection.name);
    } catch (error) {
        console.error("MongoDB Connection Error:", error.message);
        process.exit(1);
    }
};


export default connectDatabase;