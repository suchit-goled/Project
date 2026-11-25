import { useState, useEffect } from "react";
import { FiMenu } from "react-icons/fi";
import "./Navbar.css";

import Logo from "./Logo";
import NavLinks from "./NavLinks";
import SearchBar from "./SearchBar";
import ActionButtons from "./ActionButtons";
import AnnouncementBar from "./AnnouncementBar";
import MobileMenu from "./MobileMenu";
import DeliverySelector from "./DeliverySelector";
import CategoryStrip from "./CategoryStrip";
import PincodeModal from "../../common/PincodeModal/PincodeModal";

const Navbar = () => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 25) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <>
            <AnnouncementBar />
            <header className={`navbar ${scrolled ? "navbar--scrolled" : ""}`}>
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
                        <DeliverySelector />
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

            {/* Marketplace Category Navigation Sub-bar */}
            <CategoryStrip />

            {/* PIN Code Delivery Selector Modal */}
            <PincodeModal />

            <MobileMenu
                isOpen={mobileOpen}
                onClose={() => setMobileOpen(false)}
            />
        </>
    );
};

export default Navbar;
