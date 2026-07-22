import { FiUser, FiEdit2 } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

import "./ProfileCard.css";

const ProfileCard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="profile-card">
      <div className="avatar">
        <FiUser />
      </div>

      <h2>{user?.name}</h2>

      <p>{user?.email}</p>

      <span>Member Since 2026</span>

      <button
        className="edit-profile-btn"
        onClick={() => navigate("/profile/edit")}
      >
        <FiEdit2 />
        Edit Profile
      </button>
    </div>
  );
};

export default ProfileCard;