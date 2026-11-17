import React from "react";
import { FiMapPin, FiChevronDown } from "react-icons/fi";
import { useDelivery } from "../../../context/DeliveryContext";
import "./DeliverySelector.css";

const DeliverySelector = () => {
    const { pincode, deliveryInfo, openPincodeModal } = useDelivery();

    const displayCity = deliveryInfo?.city || "India";
    const displayPin = pincode || "Select";

    return (
        <button
            type="button"
            className="navbar-delivery-selector"
            onClick={openPincodeModal}
            aria-label="Select delivery location"
            title="Choose your delivery location PIN code"
        >
            <FiMapPin className="delivery-pin-icon" />
            <div className="delivery-text-wrap">
                <span className="delivery-label">Deliver to</span>
                <span className="delivery-city">
                    {displayCity} {displayPin} <FiChevronDown className="chevron-icon" />
                </span>
            </div>
        </button>
    );
};

export default DeliverySelector;
