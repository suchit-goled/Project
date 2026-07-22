import Address from "../models/address.model.js";

// Add Address
export const addAddress = async (req, res) => {
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

        res.status(201).json({
            success: true,
            message: "Address added successfully",
            address
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};


// Get All Addresses
export const getAddresses = async (req, res) => {

    try {

        const addresses = await Address.find({
            userId: req.user._id
        }).sort({
            isDefault: -1,
            createdAt: -1
        });

        res.status(200).json({
            success: true,
            count: addresses.length,
            addresses
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};


//update address 
// Update Address
export const updateAddress = async (req, res) => {
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
            return res.status(404).json({
                success: false,
                message: "Address not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Address updated successfully",
            address
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};


// deleting address 
// Delete Address
export const deleteAddress = async (req, res) => {
    try {

        const address = await Address.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!address) {
            return res.status(404).json({
                success: false,
                message: "Address not found"
            });
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

        res.status(200).json({
            success: true,
            message: "Address deleted successfully"
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};



//default address
// Set Default Address
export const setDefaultAddress = async (req, res) => {
    try {

        const address = await Address.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!address) {
            return res.status(404).json({
                success: false,
                message: "Address not found"
            });
        }

        // Remove default from all addresses
        await Address.updateMany(
            { userId: req.user._id },
            { isDefault: false }
        );

        // Set selected address as default
        address.isDefault = true;
        await address.save();

        res.status(200).json({
            success: true,
            message: "Default address updated",
            address
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};