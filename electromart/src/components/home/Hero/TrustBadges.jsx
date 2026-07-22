import { FiTruck } from "react-icons/fi";
import { FiShield } from "react-icons/fi";
import { FiStar } from "react-icons/fi";
import { FiRefreshCcw } from "react-icons/fi";

const TrustBadges = () => {

    return (

        <div className="trust">

            <div>

                <FiStar />

                <span>4.9 Rating</span>

            </div>

            <div>

                <FiTruck />

                <span>Free Shipping</span>

            </div>

            <div>

                <FiShield />

                <span>Secure Payment</span>

            </div>

            <div>

                <FiRefreshCcw />

                <span>Easy Returns</span>

            </div>

        </div>

    );

};

export default TrustBadges;