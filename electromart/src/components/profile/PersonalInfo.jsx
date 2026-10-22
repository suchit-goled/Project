import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

import "./PersonalInfo.css";

const PersonalInfo = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    return (
        <div className="personal-info">
            <h2>Personal Information</h2>

            <div className="info-row">
                <span>Name</span>
                <span>{user?.name || "Not provided"}</span>
            </div>

            <div className="info-row">
                <span>Email</span>
                <span>{user?.email || "Not provided"}</span>
            </div>

            <div className="info-row">
                <span>Phone</span>
                <span>{user?.phone || "Not set"}</span>
            </div>

            <button onClick={() => navigate("/profile/edit")}>
                Edit Profile
            </button>
        </div>
    );
};

export default PersonalInfo;
