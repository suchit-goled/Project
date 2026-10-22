import React, { useState, useEffect } from "react";
import ProfileService from "../../services/Profile.service";
import toast from "react-hot-toast";
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

  const [initialData, setInitialData] = useState({ ...formData });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setFetching(true);
        const res = await ProfileService.getProfile();
        const user = res?.data?.user || res?.user || {};
        const profile = {
          name: user.name || "",
          email: user.email || "",
          phone: user.phone || "",
          address: user.address || "",
          city: user.city || "",
          state: user.state || "",
          pincode: user.pincode || "",
        };
        setFormData(profile);
        setInitialData(profile);
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setFetching(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Full Name cannot be empty");
      return;
    }

    try {
      setLoading(true);
      const res = await ProfileService.updateProfile({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        pincode: formData.pincode.trim(),
      });

      const updatedUser = res?.data?.user || res?.user;
      if (updatedUser) {
        const stored = JSON.parse(localStorage.getItem("user") || "{}");
        localStorage.setItem(
          "user",
          JSON.stringify({ ...stored, ...updatedUser })
        );
      }

      setInitialData({ ...formData });
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to update profile. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({ ...initialData });
  };

  if (fetching) {
    return (
      <div className="profile-form-card" style={{ textAlign: "center", padding: "40px" }}>
        <p style={{ color: "var(--text-secondary, #94a3b8)" }}>Loading profile details...</p>
      </div>
    );
  }

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
            required
          />
        </div>

        <div className="form-group">
          <label>Email Address</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            disabled
            title="Email cannot be changed"
            style={{ opacity: 0.7, cursor: "not-allowed" }}
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
            rows="3"
            name="address"
            placeholder="Enter Delivery Address"
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
            disabled={loading}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="save-btn"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileForm;
