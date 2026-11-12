import React from "react";
import { FaWhatsapp } from "react-icons/fa";
import "./WhatsAppButton.css";

const WhatsAppButton = ({ phoneNumber = "919876543210", defaultMessage = "Hello ElectroNova! I have an inquiry regarding products and order delivery." }) => {
    const encodedMessage = encodeURIComponent(defaultMessage);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

    return (
        <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="whatsapp-float-btn"
            aria-label="Chat with ElectroNova Customer Support on WhatsApp"
            title="Chat with Us on WhatsApp"
        >
            <FaWhatsapp className="whatsapp-icon" />
            <span className="whatsapp-tooltip">Chat with Support</span>
        </a>
    );
};

export default WhatsAppButton;
