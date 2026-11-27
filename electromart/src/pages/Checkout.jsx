import "./Checkout.css";
import { useState } from "react";
import AddressForm from "../components/checkout/AddressForm";
import OrderSummary from "../components/checkout/OrderSummary";
import CheckoutSteps from "../components/checkout/CheckoutSteps";
import CheckoutItemsReview from "../components/checkout/CheckoutItemsReview";

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
                <h1 className="checkout-page-title">Checkout</h1>
                <CheckoutSteps addressComplete={["fullName", "phone", "address", "city", "state", "pincode"]
                    .every(field => String(address[field] || "").trim())} />

                <div className="checkout-layout">
                    <div className="checkout-left">
                        <AddressForm onAddressChange={setAddress} />
                        <CheckoutItemsReview />
                    </div>

                    <div className="checkout-right">
                        <OrderSummary address={address} />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Checkout;
