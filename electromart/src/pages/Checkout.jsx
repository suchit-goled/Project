import "./Checkout.css";

import { useState } from "react";

import AddressForm from "../components/checkout/AddressForm";
import OrderSummary from "../components/checkout/OrderSummary";
import CheckoutSteps from "../components/checkout/CheckoutSteps";

const Checkout = () => {

    const [address, setAddress] = useState({
        fullName: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        pincode: ""
    });

    return (

        <section className="checkout-page">

            <div className="container">

                <CheckoutSteps />

                <div className="checkout-layout">

                    <div className="checkout-left">

                        <AddressForm
                            onAddressChange={setAddress}
                        />

                    </div>

                    <div className="checkout-right">

                        <OrderSummary
                            address={address}
                        />

                    </div>

                </div>

            </div>

        </section>

    );

};

export default Checkout;