import { Link } from "react-router-dom";

const Logo = () => {
    return (
        <Link to="/" className="logo">

            <span className="logo__icon">⚡</span>

            <span className="logo__text">
                ElectroNova
            </span>

        </Link>
    );
};

export default Logo;