import { useAuth } from "../../context/AuthContext";

import "./PersonalInfo.css";

const PersonalInfo = () => {

    const { user } = useAuth();

    return (

        <div className="personal-info">

            <h2>

                Personal Information

            </h2>

            <div className="info-row">

                <span>Name</span>

                <span>{user?.name}</span>

            </div>

            <div className="info-row">

                <span>Email</span>

                <span>{user?.email}</span>

            </div>

            <div className="info-row">

                <span>Phone</span>

                <span>+91 **********</span>

            </div>

            <button>

                Edit Profile

            </button>

        </div>

    );

};

export default PersonalInfo;