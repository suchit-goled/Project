import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import ProductService from "../services/product.service";

const DeliveryContext = createContext();

const STORAGE_KEY_PINCODE = "electronova_delivery_pincode";
const STORAGE_KEY_INFO = "electronova_delivery_info";

export const DeliveryProvider = ({ children }) => {
    const [pincode, setPincode] = useState(() => {
        return localStorage.getItem(STORAGE_KEY_PINCODE) || "560038"; // Default to Bengaluru
    });

    const [deliveryInfo, setDeliveryInfo] = useState(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY_INFO);
            return saved ? JSON.parse(saved) : {
                pincode: "560038",
                city: "Bengaluru",
                state: "Karnataka",
                estimatedDays: 2,
                estimatedDeliveryDate: "Thursday, 20 Nov",
                serviceable: true,
                freeDeliveryEligible: true,
            };
        } catch {
            return null;
        }
    });

    const [isPincodeModalOpen, setIsPincodeModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const openPincodeModal = () => setIsPincodeModalOpen(true);
    const closePincodeModal = () => setIsPincodeModalOpen(false);

    const checkAndSetPincode = useCallback(async (newPincode) => {
        if (!newPincode || !/^[1-9][0-9]{5}$/.test(String(newPincode).trim())) {
            toast.error("Please enter a valid 6-digit Indian PIN code.");
            return false;
        }

        try {
            setLoading(true);
            const data = await ProductService.checkDeliveryPincode(newPincode.trim());
            if (data && data.serviceable) {
                setPincode(data.pincode);
                setDeliveryInfo(data);
                localStorage.setItem(STORAGE_KEY_PINCODE, data.pincode);
                localStorage.setItem(STORAGE_KEY_INFO, JSON.stringify(data));
                toast.success(`Delivering to ${data.city}, ${data.state} (${data.pincode})`);
                setIsPincodeModalOpen(false);
                return true;
            } else {
                toast.error("Sorry, this PIN code is currently unserviceable.");
                return false;
            }
        } catch (err) {
            const msg = err.response?.data?.message || "Failed to verify PIN code.";
            toast.error(msg);
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    // Sync on mount
    useEffect(() => {
        if (!deliveryInfo && pincode) {
            checkAndSetPincode(pincode);
        }
    }, [pincode, deliveryInfo, checkAndSetPincode]);

    return (
        <DeliveryContext.Provider
            value={{
                pincode,
                deliveryInfo,
                isPincodeModalOpen,
                openPincodeModal,
                closePincodeModal,
                checkAndSetPincode,
                loading,
            }}
        >
            {children}
        </DeliveryContext.Provider>
    );
};

export const useDelivery = () => {
    const context = useContext(DeliveryContext);
    if (!context) {
        return {
            pincode: "560038",
            deliveryInfo: {
                pincode: "560038",
                city: "Bengaluru",
                state: "Karnataka",
                serviceable: true,
                estimatedDays: 2,
                estimatedDeliveryDate: "2–3 business days",
                freeDeliveryEligible: true,
            },
            isPincodeModalOpen: false,
            openPincodeModal: () => {},
            closePincodeModal: () => {},
            checkAndSetPincode: async () => true,
            loading: false,
        };
    }
    return context;
};

export default DeliveryContext;
