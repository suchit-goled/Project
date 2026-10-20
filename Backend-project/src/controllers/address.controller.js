import Address from "../models/address.model.js";
import ApiResponse from "../utils/apiResponse.js";

// Add Address
export const addAddress = async (req, res, next) => {
    try {
        const {
            fullName,
            phone,
            addressLine,
            city,
            state,
            pincode,
            country
        } = req.body;

        if (!fullName || !addressLine || !city || !pincode) {
            return ApiResponse.error(res, "Full name, address, city, and pincode are required.", 400);
        }

        // Check if user already has a default address
        const existingDefault = await Address.findOne({
            userId: req.user._id,
            isDefault: true
        });

        const address = await Address.create({
            userId: req.user._id,
            fullName,
            phone,
            addressLine,
            city,
            state,
            pincode,
            country,
            isDefault: existingDefault ? false : true
        });

        return ApiResponse.success(res, address, "Address added successfully", 201);
    } catch (error) {
        next(error);
    }
};

// Get All Addresses
export const getAddresses = async (req, res, next) => {
    try {
        const addresses = await Address.find({
            userId: req.user._id
        }).sort({
            isDefault: -1,
            createdAt: -1
        });

        return ApiResponse.success(res, { addresses, count: addresses.length }, "Addresses retrieved successfully");
    } catch (error) {
        next(error);
    }
};

// Update Address
export const updateAddress = async (req, res, next) => {
    try {
        const address = await Address.findOneAndUpdate(
            {
                _id: req.params.id,
                userId: req.user._id
            },
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!address) {
            return ApiResponse.error(res, "Address not found or unauthorized", 404);
        }

        return ApiResponse.success(res, address, "Address updated successfully");
    } catch (error) {
        next(error);
    }
};

// Delete Address
export const deleteAddress = async (req, res, next) => {
    try {
        const address = await Address.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!address) {
            return ApiResponse.error(res, "Address not found or unauthorized", 404);
        }

        const wasDefault = address.isDefault;
        await address.deleteOne();

        // If deleted address was default, make another one default
        if (wasDefault) {
            const anotherAddress = await Address.findOne({
                userId: req.user._id
            }).sort({ createdAt: 1 });

            if (anotherAddress) {
                anotherAddress.isDefault = true;
                await anotherAddress.save();
            }
        }

        return ApiResponse.success(res, null, "Address deleted successfully");
    } catch (error) {
        next(error);
    }
};

// Set Default Address
export const setDefaultAddress = async (req, res, next) => {
    try {
        const address = await Address.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!address) {
            return ApiResponse.error(res, "Address not found or unauthorized", 404);
        }

        // Remove default from all user's addresses
        await Address.updateMany(
            { userId: req.user._id },
            { isDefault: false }
        );

        // Set selected address as default
        address.isDefault = true;
        await address.save();

        return ApiResponse.success(res, address, "Default address updated");
    } catch (error) {
        next(error);
    }
};
