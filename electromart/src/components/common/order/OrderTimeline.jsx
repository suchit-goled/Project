import React from "react";
import {
    FaCheckCircle,
    FaBoxOpen,
    FaShippingFast,
    FaHome,
} from "react-icons/fa";

import "./DeliveryTimeline.css";

const OrderTimeline = ({ status = "Pending" }) => {

    const steps = [
        {
            title: "Order Confirmed",
            icon: <FaCheckCircle />,
        },
        {
            title: "Packed",
            icon: <FaBoxOpen />,
        },
        {
            title: "Shipped",
            icon: <FaShippingFast />,
        },
        {
            title: "Delivered",
            icon: <FaHome />,
        },
    ];

    const statusIndex = {
        Pending: 0,
        Confirmed: 0,
        Packed: 1,
        Shipped: 2,
        Delivered: 3,
    };

    const currentStep = statusIndex[status] ?? 0;

    return (
        <div className="timeline-card">

            <h2>Delivery Timeline</h2>

            <div className="timeline">

                {steps.map((step, index) => (

                    <React.Fragment key={step.title}>

                        <div
                            className={`timeline-step ${
                                index <= currentStep ? "active" : ""
                            }`}
                        >
                            <div className="timeline-icon">
                                {step.icon}
                            </div>

                            <p>{step.title}</p>
                        </div>

                        {index !== steps.length - 1 && (
                            <div
                                className={`timeline-line ${
                                    index < currentStep ? "active" : ""
                                }`}
                            />
                        )}

                    </React.Fragment>

                ))}

            </div>

        </div>
    );
};

export default OrderTimeline;