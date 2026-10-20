import { useState } from "react";
import { FiMenu } from "react-icons/fi";
import "./Navbar.css";

import Logo from "./Logo";
import NavLinks from "./NavLinks";
import SearchBar from "./SearchBar";
import ActionButtons from "./ActionButtons";
import AnnouncementBar from "./AnnouncementBar";
import MobileMenu from "./MobileMenu";

const Navbar = () => {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <>
            <AnnouncementBar />
            <header className="navbar">
                <div className="container navbar__container">
                    <div className="navbar__left">
                        <button
                            className="mobile-hamburger-btn"
                            onClick={() => setMobileOpen(true)}
                            aria-label="Open mobile navigation"
                        >
                            <FiMenu />
                        </button>
                        <Logo />
                    </div>

                    <div className="navbar__center">
                        <NavLinks />
                    </div>

                    <div className="navbar__search">
                        <SearchBar />
                    </div>

                    <div className="navbar__right">
                        <ActionButtons />
                    </div>
                </div>
            </header>

            <MobileMenu
                isOpen={mobileOpen}
                onClose={() => setMobileOpen(false)}
            />
        </>
    );
};

export default Navbar;
