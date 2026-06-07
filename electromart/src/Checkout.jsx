import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Checkout() {

    const navigate = useNavigate();

    const [items, setItems] = useState([]);

    const userId = localStorage.getItem("userId");

    // FORM STATES

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");
    const [city, setCity] = useState("");
    const [state, setState] = useState("");
    const [pincode, setPincode] = useState("");

    // PAYMENT

    const [showPayment, setShowPayment] = useState(false);

    const [paymentMode, setPaymentMode] = useState("");

    // FETCH CART

    useEffect(() => {

        axios
            .get(`http://localhost:8000/cart/${userId}`)
            .then((res) => setItems(res.data))
            .catch((err) => console.log(err));

    }, []);

    // PLACE ORDER

    const placeOrder = async () => {

        if (
            !name ||
            !email ||
            !phone ||
            !address ||
            !city ||
            !state ||
            !pincode ||
            !paymentMode
        ) {

            alert("Fill all details");

            return;

        }

        try {

            await axios.post(
                "http://localhost:8000/place-order",
                {

                    userId,

                    items,

                    name,

                    email,

                    phone,

                    address,

                    city,

                    state,

                    pincode,

                    payment: paymentMode,

                    status: "Order Confirmed"

                }
            );

            alert("Order Placed Successfully");

            navigate("/orders");

        } catch (err) {

            console.log(err);

        }

    };

    return (

        <div className="checkout-page">

            {/* LEFT SECTION */}

            <div className="checkout-left">

                <h2>
                    📦 Delivery Details
                </h2>

                <div className="checkout-form">

                    <input
                        type="text"
                        placeholder="Full Name"
                        value={name}
                        onChange={(e) =>
                            setName(e.target.value)
                        }
                    />

                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) =>
                            setEmail(e.target.value)
                        }
                    />

                    <input
                        type="text"
                        placeholder="Phone Number"
                        value={phone}
                        onChange={(e) =>
                            setPhone(e.target.value)
                        }
                    />

                    <textarea
                        placeholder="Delivery Address"
                        value={address}
                        onChange={(e) =>
                            setAddress(e.target.value)
                        }
                    ></textarea>

                    <input
                        type="text"
                        placeholder="City"
                        value={city}
                        onChange={(e) =>
                            setCity(e.target.value)
                        }
                    />

                    <input
                        type="text"
                        placeholder="State"
                        value={state}
                        onChange={(e) =>
                            setState(e.target.value)
                        }
                    />

                    <input
                        type="text"
                        placeholder="Pincode"
                        value={pincode}
                        onChange={(e) =>
                            setPincode(e.target.value)
                        }
                    />

                </div>

            </div>

            {/* RIGHT SECTION */}

            <div className="checkout-right">

                <div className="summary-box">

                    <h2>
                        🧾 Order Summary
                    </h2>

                    {
                        items.map((item) => (

                            <div
                                className="summary-item"
                                key={item._id}
                            >

                                {/* IMAGE */}

                                <img
                                    src={item.image}
                                    alt=""
                                />

                                {/* DETAILS */}

                                <div className="summary-details">

                                    <h4>
                                        {item.title}
                                    </h4>

                                    <p className="summary-price">
                                        ₹{item.price}
                                    </p>

                                    {/* QUANTITY */}

                                    <div className="checkout-qty">

                                        {/* DECREASE */}

                                        <button
                                            onClick={() => {

                                                axios.put(
                                                    "http://localhost:8000/cart/decrease",
                                                    {
                                                        userId,
                                                        productId: item.productId
                                                    }
                                                )
                                                    .then(() =>
                                                        window.location.reload()
                                                    );

                                            }}
                                        >
                                            -
                                        </button>

                                        <span>
                                            {item.quantity}
                                        </span>

                                        {/* INCREASE */}

                                        <button
                                            onClick={() => {

                                                axios.put(
                                                    "http://localhost:8000/cart/increase",
                                                    {
                                                        userId,
                                                        productId: item.productId
                                                    }
                                                )
                                                    .then(() =>
                                                        window.location.reload()
                                                    );

                                            }}
                                        >
                                            +
                                        </button>

                                    </div>

                                    {/* REMOVE */}

                                    <button
                                        className="remove-checkout-btn"
                                        onClick={() => {

                                            axios.delete(
                                                "http://localhost:8000/cart/remove",
                                                {
                                                    data: {
                                                        userId,
                                                        productId: item.productId
                                                    }
                                                }
                                            )
                                                .then(() =>
                                                    window.location.reload()
                                                );

                                        }}
                                    >
                                        Remove Item
                                    </button>

                                </div>

                            </div>

                        ))
                    }

                    <hr />

                    {/* TOTAL */}

                    <div className="summary-total">

                        <h3>
                            Total
                        </h3>

                        <h3>

                            ₹
                            {
                                items.reduce(
                                    (sum, item) =>
                                        sum +
                                        item.price *
                                        item.quantity,
                                    0
                                )
                            }

                        </h3>

                    </div>

                    {/* PAYMENT BUTTON */}

                    <button
                        className="place-order-btn"
                        onClick={() =>
                            setShowPayment(true)
                        }
                    >
                        Continue To Payment
                    </button>

                </div>

            </div>

            {/* PAYMENT POPUP */}

            {
                showPayment && (

                    <div className="payment-overlay">

                        <div className="payment-popup">

                            <h2>
                                💳 Select Payment Method
                            </h2>

                            {/* OPTIONS */}

                            <div className="payment-options">

                                {/* GOOGLE PAY */}

                                <label className="payment-card">

                                    <input
                                        type="radio"
                                        name="payment"
                                        value="Google Pay"
                                        onChange={(e) =>
                                            setPaymentMode(
                                                e.target.value
                                            )
                                        }
                                    />

                                    <img
                                        src="https://cdn-icons-png.flaticon.com/512/6124/6124998.png"
                                        alt=""
                                    />

                                    <span>
                                        Google Pay
                                    </span>

                                </label>

                                {/* PHONEPE */}

                                <label className="payment-card">

                                    <input
                                        type="radio"
                                        name="payment"
                                        value="PhonePe"
                                        onChange={(e) =>
                                            setPaymentMode(
                                                e.target.value
                                            )
                                        }
                                    />

                                    <img
                                        src="https://download.logo.wine/logo/PhonePe/PhonePe-Logo.wine.png"
                                        alt=""
                                    />

                                    <span>
                                        PhonePe
                                    </span>

                                </label>

                                {/* PAYTM */}

                                <label className="payment-card">

                                    <input
                                        type="radio"
                                        name="payment"
                                        value="Paytm"
                                        onChange={(e) =>
                                            setPaymentMode(
                                                e.target.value
                                            )
                                        }
                                    />

                                    <img
                                        src="https://download.logo.wine/logo/Paytm/Paytm-Logo.wine.png"
                                        alt=""
                                    />

                                    <span>
                                        Paytm
                                    </span>

                                </label>

                                {/* RAZORPAY */}

                                <label className="payment-card">

                                    <input
                                        type="radio"
                                        name="payment"
                                        value="Razorpay"
                                        onChange={(e) =>
                                            setPaymentMode(
                                                e.target.value
                                            )
                                        }
                                    />

                                    <img
                                        src="https://razorpay.com/assets/razorpay-logo.svg"
                                        alt=""
                                    />

                                    <span>
                                        Razorpay
                                    </span>

                                </label>

                                {/* CARD */}

                                <label className="payment-card">

                                    <input
                                        type="radio"
                                        name="payment"
                                        value="Card"
                                        onChange={(e) =>
                                            setPaymentMode(
                                                e.target.value
                                            )
                                        }
                                    />

                                    <img
                                        src="https://cdn-icons-png.flaticon.com/512/179/179457.png"
                                        alt=""
                                    />

                                    <span>
                                        Credit / Debit Card
                                    </span>

                                </label>

                                {/* COD */}

                                <label className="payment-card">

                                    <input
                                        type="radio"
                                        name="payment"
                                        value="Cash On Delivery"
                                        onChange={(e) =>
                                            setPaymentMode(
                                                e.target.value
                                            )
                                        }
                                    />

                                    <img
                                        src="https://cdn-icons-png.flaticon.com/512/2489/2489756.png"
                                        alt=""
                                    />

                                    <span>
                                        Cash On Delivery
                                    </span>

                                </label>

                            </div>

                            {/* BUTTONS */}

                            <div className="payment-buttons">

                                <button
                                    className="cancel-payment"
                                    onClick={() =>
                                        setShowPayment(false)
                                    }
                                >
                                    Cancel
                                </button>

                                <button
                                    className="confirm-payment"
                                    onClick={() => {

                                        if (!paymentMode) {

                                            alert(
                                                "Select Payment Method"
                                            );

                                            return;

                                        }

                                        // FAKE PAYMENT SUCCESS

                                        alert(
                                            `${paymentMode} Payment Successful ✅`
                                        );

                                        setTimeout(() => {

                                            placeOrder();

                                        }, 1000);

                                    }}
                                >
                                    Confirm Payment
                                </button>

                            </div>

                        </div>

                    </div>

                )
            }

        </div>

    );

}

export default Checkout;