import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import CartSummary from "./CartSummary";
import * as CartContextModule from "../../context/CartContext";

jest.mock("../../context/CartContext", () => ({
    ...jest.requireActual("../../context/CartContext"),
    useCart: jest.fn()
}));

describe("CartSummary Component Tests", () => {
    const mockCartContextValue = {
        subtotal: 5000,
        shippingCharge: 0,
        taxAmount: 900,
        grandTotal: 5900,
        cart: [{ _id: "1", quantity: 2, price: 2500 }]
    };

    beforeEach(() => {
        CartContextModule.useCart.mockReturnValue(mockCartContextValue);
    });

    test("renders order summary details correctly", () => {
        render(
            <MemoryRouter>
                <CartSummary />
            </MemoryRouter>
        );

        expect(screen.getByText(/Order Summary/i)).toBeInTheDocument();
        expect(screen.getByText(/Subtotal/i)).toBeInTheDocument();
        expect(screen.getByText("FREE")).toBeInTheDocument();
        expect(screen.getByText("₹900")).toBeInTheDocument();
        expect(screen.getByText("₹5,900")).toBeInTheDocument();
    });

    test("applies promo code ELECTRO10 and shows 10% discount", () => {
        render(
            <MemoryRouter>
                <CartSummary />
            </MemoryRouter>
        );

        const input = screen.getByPlaceholderText(/Promo code/i);
        fireEvent.change(input, { target: { value: "ELECTRO10" } });

        const applyBtn = screen.getByRole("button", { name: /Apply/i });
        fireEvent.click(applyBtn);

        expect(screen.getByText(/Promo Discount \(10%\)/i)).toBeInTheDocument();
        expect(screen.getByText("-₹500")).toBeInTheDocument();
        expect(screen.getByText("₹5,400")).toBeInTheDocument();
    });

    test("renders checkout button with total amount", () => {
        render(
            <MemoryRouter>
                <CartSummary />
            </MemoryRouter>
        );

        const checkoutBtn = screen.getByRole("button", { name: /Proceed to Checkout/i });
        expect(checkoutBtn).toBeInTheDocument();
        expect(checkoutBtn).not.toBeDisabled();
    });
});
