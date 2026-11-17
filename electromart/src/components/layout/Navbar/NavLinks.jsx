import { NavLink } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";

const NavLinks = () => {
    const { user } = useAuth();
    const isSeller = user?.role === "seller";

    return (
        <nav className="nav-links">

            <NavLink to="/">
                Home
            </NavLink>

            <NavLink to="/products">
                Products
            </NavLink>

            <NavLink to="/deals">
                Deals
            </NavLink>

            {isSeller ? (
                <NavLink to="/seller/dashboard" className="seller-nav-link">
                    Seller Central
                </NavLink>
            ) : (
                <NavLink to="/seller/register" className="seller-nav-link">
                    Become a Seller
                </NavLink>
            )}

            <NavLink to="/contact">
                Contact
            </NavLink>

        </nav>
    );
};

export default NavLinks;