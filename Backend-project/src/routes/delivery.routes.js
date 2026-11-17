import express from "express";
import ApiResponse from "../utils/apiResponse.js";

const router = express.Router();

const PINCODE_MAP = {
    "11": { city: "New Delhi", state: "Delhi", days: 2 },
    "12": { city: "Gurugram", state: "Haryana", days: 2 },
    "13": { city: "Ambala", state: "Haryana", days: 3 },
    "14": { city: "Ludhiana", state: "Punjab", days: 3 },
    "16": { city: "Chandigarh", state: "Punjab", days: 2 },
    "20": { city: "Noida / Ghaziabad", state: "Uttar Pradesh", days: 2 },
    "22": { city: "Lucknow", state: "Uttar Pradesh", days: 3 },
    "28": { city: "Agra", state: "Uttar Pradesh", days: 3 },
    "30": { city: "Jaipur", state: "Rajasthan", days: 2 },
    "38": { city: "Ahmedabad", state: "Gujarat", days: 2 },
    "39": { city: "Surat", state: "Gujarat", days: 2 },
    "40": { city: "Mumbai", state: "Maharashtra", days: 2 },
    "41": { city: "Pune", state: "Maharashtra", days: 2 },
    "42": { city: "Nashik", state: "Maharashtra", days: 3 },
    "50": { city: "Hyderabad", state: "Telangana", days: 2 },
    "56": { city: "Bengaluru", state: "Karnataka", days: 2 },
    "57": { city: "Mangaluru", state: "Karnataka", days: 3 },
    "58": { city: "Hubballi", state: "Karnataka", days: 3 },
    "60": { city: "Chennai", state: "Tamil Nadu", days: 2 },
    "62": { city: "Madurai", state: "Tamil Nadu", days: 3 },
    "64": { city: "Coimbatore", state: "Tamil Nadu", days: 3 },
    "68": { city: "Kochi", state: "Kerala", days: 2 },
    "69": { city: "Thiruvananthapuram", state: "Kerala", days: 3 },
    "70": { city: "Kolkata", state: "West Bengal", days: 2 },
    "75": { city: "Bhubaneswar", state: "Odisha", days: 3 },
    "80": { city: "Patna", state: "Bihar", days: 3 },
    "78": { city: "Guwahati", state: "Assam", days: 4 },
};

router.post("/check", (req, res) => {
    const { pincode } = req.body;

    if (!pincode || !/^[1-9][0-9]{5}$/.test(String(pincode).trim())) {
        return ApiResponse.error(res, "Please enter a valid 6-digit Indian PIN code.", 400);
    }

    const cleanPin = String(pincode).trim();
    const prefix = cleanPin.substring(0, 2);
    const region = PINCODE_MAP[prefix] || { city: "India Destination", state: "India", days: 4 };

    // Format estimated delivery date (e.g., "Thursday, 20 Nov")
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + region.days);
    const options = { weekday: "short", month: "short", day: "numeric" };
    const formattedDate = deliveryDate.toLocaleDateString("en-IN", options);

    return ApiResponse.success(res, {
        pincode: cleanPin,
        serviceable: true,
        city: region.city,
        state: region.state,
        estimatedDays: region.days,
        estimatedDeliveryDate: formattedDate,
        shippingFee: 0,
        freeDeliveryEligible: true,
        supportsCashOnDelivery: true,
    }, "Delivery location checked successfully.");
});

export default router;
