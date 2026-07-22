import dotenv from "dotenv";

dotenv.config();
console.log(process.env.MONGO_URI);

export default {
  port: process.env.PORT,
  mongo_uri: process.env.MONGO_URI,
  jwt_secret: process.env.JWT_SECRET,
  jwt_expires_in: process.env.JWT_EXPIRES_IN,
};