import { FiLogOut } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const AccountMenu = () => {

    const navigate = useNavigate();

    const { logout } = useAuth();

    return (

        <div className="account-menu">

            <button onClick={() => navigate("/orders")}>
                My Orders
            </button>

            <button onClick={() => navigate("/wishlist")}>
                Wishlist
            </button>

            <button onClick={() => navigate("/settings")}>
                Settings
            </button>

            <button
                className="logout-btn"
                onClick={() => {

                    logout();

                    navigate("/");

                }}
            >
                <FiLogOut />

                Logout
            </button>

        </div>

    );

};

export default AccountMenu;