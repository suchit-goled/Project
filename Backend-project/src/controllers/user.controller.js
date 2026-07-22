import User from "../models/user.model.js";

export const getProfile = async (req, res) => {
    try {

        const user = await User.findById(req.user._id).select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        res.status(200).json({
            success: true,
            user,
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            message: err.message,
        });

    }
};

export const updateProfile = async (req, res) => {
    try {

        const {
            name,
            phone,
            address,
            city,
            state,
            pincode,
        } = req.body;

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        user.name = name;
        user.phone = phone;
        user.address = address;
        user.city = city;
        user.state = state;
        user.pincode = pincode;

        await user.save();

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user,
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            message: err.message,
        });

    }
};