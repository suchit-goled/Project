import "./AddressForm.css";
import { useState } from "react";

const AddressForm = ({ onAddressChange }) => {

    const [address, setAddress] = useState({
        fullName: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        pincode: ""
    });

    const handleChange = (e) => {

        const { name, value } = e.target;

        const updated = {
            ...address,
            [name]: value
        };

        setAddress(updated);

        if (onAddressChange) {
            onAddressChange(updated);
        }

    };

    return (

        <div className="address-card">

            <h2>Delivery Address</h2>

            <div className="address-grid">

                <input
                    type="text"
                    name="fullName"
                    placeholder="Full Name"
                    value={address.fullName}
                    onChange={handleChange}
                />

                <input
                    type="tel"
                    name="phone"
                    placeholder="Phone Number"
                    value={address.phone}
                    onChange={handleChange}
                />

                <textarea
                    name="address"
                    placeholder="House No, Street, Area"
                    value={address.address}
                    onChange={handleChange}
                />

                <input
                    type="text"
                    name="city"
                    placeholder="City"
                    value={address.city}
                    onChange={handleChange}
                />

                <input
                    type="text"
                    name="state"
                    placeholder="State"
                    value={address.state}
                    onChange={handleChange}
                />

                <input
                    type="text"
                    name="pincode"
                    placeholder="PIN Code"
                    value={address.pincode}
                    onChange={handleChange}
                />

            </div>

        </div>

    );

};

export default AddressForm;