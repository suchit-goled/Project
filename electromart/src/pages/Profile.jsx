import ProfileCard from "../components/profile/ProfileCard";
import PersonalInfo from "../components/profile/PersonalInfo";
import AccountStats from "../components/profile/AccountStats";
import AccountMenu from "../components/profile/AccountMenu";

import "./Profile.css";

const Profile = () => {

    return (

        <div className="profile-page container">

            <ProfileCard />

            <div className="profile-right">

                <PersonalInfo />

                <AccountStats />

                <AccountMenu />

            </div>

        </div>

    );

};

export default Profile;