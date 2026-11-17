import React, { useState } from "react";
import { FiMapPin, FiX, FiCheckCircle } from "react-icons/fi";
import { useDelivery } from "../../../context/DeliveryContext";
import "./PincodeModal.css";

const POPULAR_LOCATIONS = [
    { city: "Bengaluru", pincode: "560038", state: "Karnataka" },
    { city: "Mumbai", pincode: "400001", state: "Maharashtra" },
    { city: "New Delhi", pincode: "110001", state: "Delhi" },
    { city: "Hyderabad", pincode: "500081", state: "Telangana" },
    { city: "Chennai", pincode: "600002", state: "Tamil Nadu" },
    { city: "Pune", pincode: "411004", state: "Maharashtra" },
];

const PincodeModal = () => {
    const {
        pincode,
        deliveryInfo,
        isPincodeModalOpen,
        closePincodeModal,
        checkAndSetPincode,
        loading,
    } = useDelivery();

    const [inputPin, setInputPin] = useState(pincode || "");

    if (!isPincodeModalOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (inputPin.trim().length === 6) {
            await checkAndSetPincode(inputPin.trim());
        }
    };

    const handleSelectQuick = async (pin) => {
        setInputPin(pin);
        await checkAndSetPincode(pin);
    };

    return (
        <div className="pincode-modal-overlay" onClick={closePincodeModal}>
            <div className="pincode-modal-card" onClick={(e) => e.stopPropagation()}>
                <div className="pincode-modal-header">
                    <div className="pincode-modal-title">
                        <FiMapPin className="pin-icon" />
                        <div>
                            <h3>Select Delivery Location</h3>
                            <p>Enter your Indian PIN code to view seller delivery availability and shipping timelines.</p>
                        </div>
                    </div>
                    <button className="close-btn" onClick={closePincodeModal} aria-label="Close modal">
                        <FiX />
                    </button>
                </div>

                <form className="pincode-form" onSubmit={handleSubmit}>
                    <div className="pincode-input-group">
                        <input
                            type="text"
                            maxLength="6"
                            placeholder="Enter 6-digit PIN code (e.g. 560038)"
                            value={inputPin}
                            onChange={(e) => setInputPin(e.target.value.replace(/\D/g, ""))}
                            autoFocus
                        />
                        <button
                            type="submit"
                            className="apply-pin-btn"
                            disabled={loading || inputPin.length !== 6}
                        >
                            {loading ? "Checking..." : "Apply PIN"}
                        </button>
                    </div>
                </form>

                {deliveryInfo && deliveryInfo.serviceable && (
                    <div className="current-location-status">
                        <FiCheckCircle className="check-icon" />
                        <div>
                            <strong>Currently delivering to: </strong>
                            <span>{deliveryInfo.city}, {deliveryInfo.state} - {deliveryInfo.pincode}</span>
                            <div className="delivery-time-note">
                                Estimated delivery: <strong>{deliveryInfo.estimatedDeliveryDate}</strong> (Free delivery eligible)
                            </div>
                        </div>
                    </div>
                )}

                <div className="quick-locations-section">
                    <span className="quick-label">Or choose popular city:</span>
                    <div className="quick-locations-grid">
                        {POPULAR_LOCATIONS.map((loc) => (
                            <button
                                key={loc.pincode}
                                type="button"
                                className={`quick-loc-btn ${pincode === loc.pincode ? "active" : ""}`}
                                onClick={() => handleSelectQuick(loc.pincode)}
                            >
                                <span className="city-name">{loc.city}</span>
                                <span className="city-pin">{loc.pincode}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PincodeModal;
