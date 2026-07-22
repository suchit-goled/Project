import React from "react";
import { FaMapMarkerAlt, FaPhoneAlt, FaUser } from "react-icons/fa";
import "./ShippingAddressCard.css";

const ShippingAddressCard = ({ address }) => {

    if (!address) return null;

    return (
        <div className="shipping-card">

            <h2>
                <FaMapMarkerAlt />
                Shipping Address
            </h2>

            <div className="shipping-content">

                <div className="shipping-row">
                    <FaUser />
                    <span>{address.fullName}</span>
                </div>

                <div className="shipping-row">
                    <FaPhoneAlt />
                    <span>{address.phone}</span>
                </div>

                <div className="shipping-address">

                    <p>{address.address}</p>

                    <p>
                        {address.city}, {address.state}
                    </p>

                    <p>{address.pincode}</p>

                </div>

            </div>

        </div>
    );
};

export default ShippingAddressCard;