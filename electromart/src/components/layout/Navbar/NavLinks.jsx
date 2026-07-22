import { NavLink } from "react-router-dom";

const NavLinks = () => {
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

            <NavLink to="/contact">
                Contact
            </NavLink>

        </nav>
    );
};

export default NavLinks;