import React from "react";
import { render, screen } from "@testing-library/react";
import WhatsAppButton from "./WhatsAppButton";

describe("WhatsAppButton Component Tests", () => {
    test("renders WhatsApp float button with default link attributes", () => {
        render(<WhatsAppButton />);

        const linkElement = screen.getByRole("link", {
            name: /chat with electronova customer support on whatsapp/i
        });

        expect(linkElement).toBeInTheDocument();
        expect(linkElement).toHaveAttribute("target", "_blank");
        expect(linkElement).toHaveAttribute("rel", "noopener noreferrer");
        expect(linkElement).toHaveAttribute(
            "href",
            expect.stringContaining("https://wa.me/919876543210")
        );
    });

    test("renders tooltip text correctly", () => {
        render(<WhatsAppButton />);
        expect(screen.getByText(/chat with support/i)).toBeInTheDocument();
    });

    test("supports custom phone number and message", () => {
        const customPhone = "919999999999";
        const customMsg = "Hello! I need assistance with my order.";

        render(<WhatsAppButton phoneNumber={customPhone} defaultMessage={customMsg} />);

        const linkElement = screen.getByRole("link", {
            name: /chat with electronova customer support on whatsapp/i
        });

        expect(linkElement).toHaveAttribute(
            "href",
            `https://wa.me/${customPhone}?text=${encodeURIComponent(customMsg)}`
        );
    });
});
