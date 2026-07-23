import mongoose from "mongoose";
import env from "./env.js";


const connectDatabase = async () => {
    console.log(mongoose.connection.host);
console.log(mongoose.connection.name);

    try {
         console.log("Mongo URI:", env.mongo_uri);
        await mongoose.connect(env.mongo_uri);

        console.log("✅ MongoDB Connected");
        console.log("Database:", mongoose.connection.name);

    } catch (error) {
        console.error("MongoDB Error:", error.message);
        process.exit(1);
    }
};


export default connectDatabase;