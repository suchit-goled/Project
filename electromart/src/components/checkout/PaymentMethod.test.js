import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import PaymentMethod from "./PaymentMethod";

describe("PaymentMethod Component Tests", () => {
    test("renders payment method options with titles and descriptions", () => {
        render(<PaymentMethod selectedMethod="Cash On Delivery" onChange={() => {}} />);

        expect(screen.getByText(/Cash on Delivery/i)).toBeInTheDocument();
        expect(screen.getByText(/Pay with cash or UPI on doorstep delivery/i)).toBeInTheDocument();
        expect(screen.getByText(/Instant Online Payment \(Razorpay\)/i)).toBeInTheDocument();
        expect(screen.getByText(/Zero fees via UPI, GPay, PhonePe, Cards & NetBanking/i)).toBeInTheDocument();
    });

    test("marks selected payment radio button as checked", () => {
        render(<PaymentMethod selectedMethod="Razorpay" onChange={() => {}} />);

        const codRadio = screen.getByRole("radio", { name: /Cash on Delivery/i });
        const razorpayRadio = screen.getByRole("radio", { name: /Instant Online Payment/i });

        expect(codRadio).not.toBeChecked();
        expect(razorpayRadio).toBeChecked();
    });

    test("fires onChange callback with method ID when user selects an option", () => {
        const handleSelect = jest.fn();
        render(<PaymentMethod selectedMethod="Cash On Delivery" onChange={handleSelect} />);

        const razorpayRadio = screen.getByRole("radio", { name: /Instant Online Payment/i });
        fireEvent.click(razorpayRadio);

        expect(handleSelect).toHaveBeenCalledWith("Razorpay");
    });
});
