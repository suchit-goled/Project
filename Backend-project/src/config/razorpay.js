import Razorpay from "razorpay";
import env from "./env.js";

const razorpay = new Razorpay({
  key_id: env.razorpay_key_id,
  key_secret: env.razorpay_key_secret,
});

export default razorpay;