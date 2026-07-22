import "./Navbar.css";

import Logo from "./Logo";
import NavLinks from "./NavLinks";
import SearchBar from "./SearchBar";
import ActionButtons from "./ActionButtons";




const Navbar = () => {
    

    return (
        <header className="navbar">
            <div className="container navbar__container">

                <Logo />

                <NavLinks />

                <SearchBar />
                
                

                <ActionButtons />

            </div>
        </header>
    );
};

export default Navbar;