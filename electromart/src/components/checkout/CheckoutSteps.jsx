import "./CheckoutSteps.css";

import {
    FiShoppingCart,
    FiMapPin,
    FiCreditCard,
    FiCheckCircle
} from "react-icons/fi";

const CheckoutSteps = () => {

    return (

        <div className="checkout-steps">

            <div className="step active">

                <FiShoppingCart />

                <span>Cart</span>

            </div>

            <div className="line"></div>

            <div className="step active">

                <FiMapPin />

                <span>Address</span>

            </div>

            <div className="line"></div>

            <div className="step">

                <FiCreditCard />

                <span>Payment</span>

            </div>

            <div className="line"></div>

            <div className="step">

                <FiCheckCircle />

                <span>Success</span>

            </div>

        </div>

    );

};

export default CheckoutSteps;