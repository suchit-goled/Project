import ProfileImage from "../components/profile/ProfileImage";
import ProfileForm from "../components/profile/ProfileForm";
import PasswordSection from "../components/profile/PasswordSection";

import "./EditProfile.css";

const EditProfile = () => {
    return (
        <div className="edit-profile-page container">

            <div className="edit-profile-header">
                <h1>Edit Profile</h1>
                <p>Manage your personal information</p>
            </div>

            <ProfileImage />

            <ProfileForm />

            <PasswordSection />

        </div>
    );
};

export default EditProfile;