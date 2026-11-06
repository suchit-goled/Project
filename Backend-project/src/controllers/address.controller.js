import Address from "../models/address.model.js";
import ApiResponse from "../utils/apiResponse.js";

// Helper to sanitize and bound string
const cleanString = (val, maxLen = 200) => {
    if (val === undefined || val === null) return "";
    return String(val).trim().slice(0, maxLen);
};

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

        const cleanFullName = cleanString(fullName, 100);
        const cleanAddressLine = cleanString(addressLine, 250);
        const cleanCity = cleanString(city, 100);
        const cleanPincode = cleanString(pincode, 20);

        if (!cleanFullName || !cleanAddressLine || !cleanCity || !cleanPincode) {
            return ApiResponse.error(res, "Full name, address, city, and pincode are required.", 400);
        }

        // Check if user already has a default address
        const existingDefault = await Address.findOne({
            userId: req.user._id,
            isDefault: true
        });

        const address = await Address.create({
            userId: req.user._id,
            fullName: cleanFullName,
            phone: cleanString(phone, 25),
            addressLine: cleanAddressLine,
            city: cleanCity,
            state: cleanString(state, 100),
            pincode: cleanPincode,
            country: cleanString(country, 100) || "India",
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
        const {
            fullName,
            phone,
            addressLine,
            city,
            state,
            pincode,
            country,
            isDefault
        } = req.body;

        const updateData = {};
        if (fullName !== undefined) updateData.fullName = cleanString(fullName, 100);
        if (phone !== undefined) updateData.phone = cleanString(phone, 25);
        if (addressLine !== undefined) updateData.addressLine = cleanString(addressLine, 250);
        if (city !== undefined) updateData.city = cleanString(city, 100);
        if (state !== undefined) updateData.state = cleanString(state, 100);
        if (pincode !== undefined) updateData.pincode = cleanString(pincode, 20);
        if (country !== undefined) updateData.country = cleanString(country, 100);
        if (isDefault !== undefined) {
            updateData.isDefault = Boolean(isDefault);
            if (updateData.isDefault) {
                // If setting this address to default, unset other defaults for this user
                await Address.updateMany(
                    { userId: req.user._id, _id: { $ne: req.params.id } },
                    { isDefault: false }
                );
            }
        }

        const address = await Address.findOneAndUpdate(
            {
                _id: req.params.id,
                userId: req.user._id
            },
            updateData,
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
