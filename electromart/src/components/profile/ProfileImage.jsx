import React, { useRef, useState } from "react";
import "./ProfileImage.css";

const ProfileImage = () => {
  const [image, setImage] = useState(
    "https://cdn-icons-png.flaticon.com/512/149/149071.png"
  );

  const fileInputRef = useRef();

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const imageUrl = URL.createObjectURL(file);
    setImage(imageUrl);
  };

  return (
    <div className="profile-image-card">

      <div className="profile-image-wrapper">
        <img src={image} alt="Profile" className="profile-image" />
      </div>

      <h3>Profile Photo</h3>

      <p>
        Upload a profile picture to personalize your ElectroNova account.
      </p>

      <input
        type="file"
        accept="image/*"
        hidden
        ref={fileInputRef}
        onChange={handleImageChange}
      />

      <button
        className="change-photo-btn"
        onClick={() => fileInputRef.current.click()}
      >
        Change Photo
      </button>

    </div>
  );
};

export default ProfileImage;