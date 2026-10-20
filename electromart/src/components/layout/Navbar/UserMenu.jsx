import { useState, useRef, useEffect } from "react";
import { FiUser, FiChevronDown, FiPackage, FiHeart, FiShield, FiLogOut, FiSliders } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import toast from "react-hot-toast";
import "./UserMenu.css";

const UserMenu = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOpen(false);
            }
        };

        if (open) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [open]);

    if (!user) {
        return (
            <button
                className="user-login-btn"
                onClick={() => navigate("/login")}
                title="Login / Register"
            >
                <FiUser />
                <span className="user-login-text">Sign In</span>
            </button>
        );
    }

    const isAdmin = user.role === "admin";

    const handleNavigate = (path) => {
        setOpen(false);
        navigate(path);
    };

    const handleLogout = () => {
        setOpen(false);
        logout();
        toast.success("Signed out successfully");
        navigate("/");
    };

    return (
        <div className="user-menu" ref={dropdownRef}>
            <button
                className="user-btn"
                onClick={() => setOpen(!open)}
                aria-expanded={open}
            >
                <div className="user-avatar">
                    {user.profileImage ? (
                        <img src={user.profileImage} alt={user.name} />
                    ) : (
                        <span>{user.name ? user.name[0].toUpperCase() : "U"}</span>
                    )}
                </div>
                <span className="user-name">{user.name}</span>
                {isAdmin && <span className="admin-chip">Admin</span>}
                <FiChevronDown className={`chevron-icon ${open ? "rotate" : ""}`} />
            </button>

            {open && (
                <div className="dropdown animate-scale-in">
                    <div className="dropdown-header">
                        <strong>{user.name}</strong>
                        <span className="dropdown-email">{user.email}</span>
                    </div>

                    <div className="dropdown-divider" />

                    {isAdmin && (
                        <>
                            <button onClick={() => handleNavigate("/admin")} className="dropdown-item admin-item">
                                <FiShield />
                                <span>Admin Dashboard</span>
                            </button>
                            <button onClick={() => handleNavigate("/admin-orders")} className="dropdown-item admin-item">
                                <FiSliders />
                                <span>Manage All Orders</span>
                            </button>
                            <div className="dropdown-divider" />
                        </>
                    )}

                    <button onClick={() => handleNavigate("/profile")} className="dropdown-item">
                        <FiUser />
                        <span>My Profile</span>
                    </button>

                    <button onClick={() => handleNavigate("/orders")} className="dropdown-item">
                        <FiPackage />
                        <span>My Orders</span>
                    </button>

                    <button onClick={() => handleNavigate("/wishlist")} className="dropdown-item">
                        <FiHeart />
                        <span>Wishlist</span>
                    </button>

                    <div className="dropdown-divider" />

                    <button onClick={handleLogout} className="dropdown-item logout-item">
                        <FiLogOut />
                        <span>Sign Out</span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default UserMenu;
