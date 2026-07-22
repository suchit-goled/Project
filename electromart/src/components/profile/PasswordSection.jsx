import React, { useState } from "react";
import "./PasswordSection.css";

const PasswordSection = () => {
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

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

  const handleSubmit = (e) => {
    e.preventDefault();

    if (passwords.newPassword !== passwords.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    console.log(passwords);

    // Call Change Password API
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
              placeholder="Current Password"
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
              placeholder="New Password"
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
              placeholder="Confirm Password"
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
        >
          Update Password
        </button>

      </form>

    </div>
  );
};

export default PasswordSection;