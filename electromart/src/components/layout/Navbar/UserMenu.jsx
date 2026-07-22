import { useState } from "react";
import { FiUser, FiChevronDown } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";

import "./UserMenu.css";

const UserMenu = () => {

    const { user, logout } = useAuth();

    const navigate = useNavigate();

    const [open, setOpen] = useState(false);

    if (!user) {

        return (

            <button
                onClick={() => navigate("/login")}
            >
                <FiUser />
            </button>

        );

    }

    return (

        <div className="user-menu">

            <button
                className="user-btn"
                onClick={() => setOpen(!open)}
            >

                <FiUser />

                <span>{user.name}</span>

                <FiChevronDown />

            </button>

            {open && (

                <div className="dropdown">

                    <button onClick={() => navigate("/profile")}>

                        My Profile

                    </button>

                    <button onClick={() => navigate("/orders")}>

                        My Orders

                    </button>

                    <button onClick={() => navigate("/wishlist")}>

                        Wishlist

                    </button>

                    <button
                        onClick={() => {

                            logout();

                            navigate("/");

                        }}
                    >

                        Logout

                    </button>

                </div>

            )}

        </div>

    );

};

export default UserMenu;