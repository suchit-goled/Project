import React, { useState } from "react";
import "./ProfileForm.css";

const ProfileForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log(formData);

    // TODO:
    // Call API here
  };

  const handleCancel = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
    });
  };

  return (
    <div className="profile-form-card">

      <h2>Personal Information</h2>

      <form onSubmit={handleSubmit}>

        <div className="form-group">
          <label>Full Name</label>
          <input
            type="text"
            name="name"
            placeholder="Enter Full Name"
            value={formData.name}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Email Address</label>
          <input
            type="email"
            name="email"
            placeholder="Enter Email"
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Phone Number</label>
          <input
            type="text"
            name="phone"
            placeholder="Enter Phone Number"
            value={formData.phone}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Address</label>
          <textarea
            rows="4"
            name="address"
            placeholder="Enter Address"
            value={formData.address}
            onChange={handleChange}
          />
        </div>

        <div className="double-input">

          <div className="form-group">
            <label>City</label>
            <input
              type="text"
              name="city"
              placeholder="City"
              value={formData.city}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>State</label>
            <input
              type="text"
              name="state"
              placeholder="State"
              value={formData.state}
              onChange={handleChange}
            />
          </div>

        </div>

        <div className="form-group">
          <label>Pincode</label>
          <input
            type="text"
            name="pincode"
            placeholder="Pincode"
            value={formData.pincode}
            onChange={handleChange}
          />
        </div>

        <div className="button-group">

          <button
            type="button"
            className="cancel-btn"
            onClick={handleCancel}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="save-btn"
          >
            Save Changes
          </button>

        </div>

      </form>

    </div>
  );
};

export default ProfileForm;