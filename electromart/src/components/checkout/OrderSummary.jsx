import "./OrderSummary.css";

import { useNavigate } from "react-router-dom";

import { useCart } from "../../context/CartContext";

import { useState } from "react";

import OrderService from "../../services/order.service";
import PaymentService from "../../services/payment.service";

const OrderSummary = ({ address }) => {

    const navigate = useNavigate();

    
    const [paymentMethod, setPaymentMethod] = useState("Cash On Delivery");

    const { cart, clearCart } = useCart();
    

    const subtotal = cart.reduce(
        (total, item) => total + item.price * item.quantity,
        0
    );

    const shipping = subtotal > 1000 ? 0 : 99;

    const tax = Math.round(subtotal * 0.18);

    const total = subtotal + shipping + tax;

    const handleOnlinePayment = async (order) => {
    try {
        console.log("1. Starting payment");

        const razorpayOrder = await PaymentService.createOrder(order._id);
        console.log("2. Razorpay Order:", razorpayOrder);

        const options = {
            key: process.env.REACT_APP_RAZORPAY_KEY_ID,
            amount: razorpayOrder.data.amount,
            currency: razorpayOrder.data.currency,
            order_id: razorpayOrder.data.id,
            name: "ElectroNova",
            description: "Order Payment",

            handler: async function (response) {
                console.log("3. Payment Success:", response);
            }
        };

        console.log("4. Options:", options);

        const razorpay = new window.Razorpay(options);
        console.log("5. Razorpay instance created");

        razorpay.open();
        console.log("6. Popup opened");

    } catch (error) {

    console.error("Payment Error:", error);

    console.log("Response:", error.response);

    console.log("Response Data:", error.response?.data);

    console.log("Message:", error.message);

    alert(error.response?.data?.message || error.message);

}
};
    const handleCheckout = async () => {

    if (
        !address.fullName ||
        !address.phone ||
        !address.address ||
        !address.city ||
        !address.state ||
        !address.pincode
    ) {
        alert("Please fill all address fields.");
        return;
    }

    try {

        const response = await OrderService.createOrder({
            shippingAddress: address,
            paymentMethod
        });

        if (response.success) {

            const order = response.data;

            if (paymentMethod === "Cash On Delivery") {

    await clearCart();

    navigate("/order-success", {
        state: { order }
    });

} else {

    await handleOnlinePayment(order);

}

        }

    } catch (error) {

        console.log(error);
        console.log(error.response);
        console.log(error.response?.data);

        alert(
            error.response?.data?.message ||
            error.message
        );

    }

};

    return (

        <div className="order-summary">

            <h2>Order Summary</h2>

            <div className="summary-items">

                {cart.map(item => (

                    <div
                        className="summary-item"
                        key={item.productId}
                    >

                        <img
                            src={item.image}
                            alt={item.title}
                        />

                        <div>

                            <h4>{item.title}</h4>

                            <p>Qty : {item.quantity}</p>

                        </div>

                        <span>

                            ₹{(item.price * item.quantity).toLocaleString()}

                        </span>

                    </div>

                ))}

            </div>

            <hr />

            <div className="summary-row">

                <span>Subtotal</span>

                <span>₹{subtotal.toLocaleString()}</span>

            </div>

            <div className="summary-row">

                <span>Shipping</span>

                <span>

                    {shipping === 0 ? "FREE" : `₹${shipping}`}

                </span>

            </div>

            <div className="summary-row">

                <span>GST (18%)</span>

                <span>₹{tax.toLocaleString()}</span>

            </div>

            <hr />

            <div className="summary-total">

                <span>Total</span>

                <span>₹{total.toLocaleString()}</span>

            </div>
            <div className="payment-method">

    <h3>Payment Method</h3>

    <label>
        <input
            type="radio"
            value="Cash On Delivery"
            checked={paymentMethod === "Cash On Delivery"}
            onChange={(e) => setPaymentMethod(e.target.value)}
        />
        Cash On Delivery
    </label>

    <label>
        <input
            type="radio"
            value="Razorpay"
            checked={paymentMethod === "Razorpay"}
            onChange={(e) => setPaymentMethod(e.target.value)}
        />
        Pay Online (Razorpay)
    </label>

</div>

            <button
                className="payment-btn"
                onClick={handleCheckout}
            >

                Place Order

            </button>

        </div>

    );

};

export default OrderSummary;