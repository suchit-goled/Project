import React from "react";
import "./OrderSummaryCard.css";

const OrderSummaryCard = ({ order }) => {
    return (
        <div className="summary-card">

            <h2>Order Summary</h2>

            <div className="product-list">

                {order.products?.map((item) => (

                    <div
                        key={item.productId}
                        className="summary-product"
                    >

                        <img
                            src={item.image}
                            alt={item.title}
                        />

                        <div className="summary-details">

                            <h3>{item.title}</h3>

                            <p>Quantity : {item.quantity}</p>

                            <p>₹{item.price.toLocaleString()}</p>

                        </div>

                        <div className="summary-total">

                            ₹{(item.price * item.quantity).toLocaleString()}

                        </div>

                    </div>

                ))}

            </div>

            <hr />

            <div className="price-row">
                <span>Subtotal</span>
                <span>₹{order.subtotal.toLocaleString()}</span>
            </div>

            <div className="price-row">
                <span>Shipping</span>
                <span>₹{order.shippingCharge.toLocaleString()}</span>
            </div>

            <div className="price-row">
                <span>GST</span>
                <span>₹{order.tax.toLocaleString()}</span>
            </div>

            <div className="price-row total">
                <span>Total</span>
                <span>₹{order.total.toLocaleString()}</span>
            </div>

        </div>
    );
};

export default OrderSummaryCard;