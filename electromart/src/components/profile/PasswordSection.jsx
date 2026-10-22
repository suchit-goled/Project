import React, { useState } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import "./PasswordSection.css";

const PasswordSection = () => {
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const handleChange = (e) => {
    setPasswords({
      ...passwords,
      [e.target.name]: e.target.value,
    });
  };

  const togglePassword = (field) => {
    setShowPassword({
      ...showPassword,
      [field]: !showPassword[field],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!passwords.currentPassword) {
      toast.error("Please enter your current password");
      return;
    }

    if (passwords.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long");
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    try {
      setLoading(true);
      await api.put("/users/change-password", {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });

      toast.success("Password updated successfully!");
      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update password. Please check your current password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="password-card">
      <h2>Change Password</h2>

      <form onSubmit={handleSubmit}>
        <div className="password-group">
          <label>Current Password</label>

          <div className="password-input">
            <input
              type={showPassword.current ? "text" : "password"}
              name="currentPassword"
              value={passwords.currentPassword}
              onChange={handleChange}
              placeholder="Enter current password"
              required
            />

            <button
              type="button"
              onClick={() => togglePassword("current")}
            >
              {showPassword.current ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        <div className="password-group">
          <label>New Password</label>

          <div className="password-input">
            <input
              type={showPassword.new ? "text" : "password"}
              name="newPassword"
              value={passwords.newPassword}
              onChange={handleChange}
              placeholder="Enter new password (min. 6 characters)"
              required
            />

            <button
              type="button"
              onClick={() => togglePassword("new")}
            >
              {showPassword.new ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        <div className="password-group">
          <label>Confirm Password</label>

          <div className="password-input">
            <input
              type={showPassword.confirm ? "text" : "password"}
              name="confirmPassword"
              value={passwords.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm new password"
              required
            />

            <button
              type="button"
              onClick={() => togglePassword("confirm")}
            >
              {showPassword.confirm ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="change-password-btn"
          disabled={loading}
        >
          {loading ? "Updating..." : "Update Password"}
        </button>
      </form>
    </div>
  );
};

export default PasswordSection;
