import React from "react";
import { render, screen } from "@testing-library/react";
import CheckoutSteps from "./CheckoutSteps";

describe("CheckoutSteps Component Tests", () => {
    test("renders all 4 checkout progression steps", () => {
        render(<CheckoutSteps />);

        expect(screen.getByText("Cart")).toBeInTheDocument();
        expect(screen.getByText("Address")).toBeInTheDocument();
        expect(screen.getByText("Payment")).toBeInTheDocument();
        expect(screen.getByText("Success")).toBeInTheDocument();
    });

    test("advances to payment when the delivery details are supplied", () => {
        const { container, rerender } = render(<CheckoutSteps />);
        expect(container.querySelector("[aria-current=step]")).toHaveTextContent("Address");
        rerender(<CheckoutSteps addressComplete />);
        expect(container.querySelector("[aria-current=step]")).toHaveTextContent("Payment");
        rerender(<CheckoutSteps addressComplete={false} />);
        expect(container.querySelector("[aria-current=step]")).toHaveTextContent("Address");
    });

    test("applies active class to completed and current steps", () => {
        const { container } = render(<CheckoutSteps />);
        const activeSteps = container.querySelectorAll(".step.active");

        expect(activeSteps.length).toBe(2);
        expect(activeSteps[0]).toHaveTextContent("Cart");
        expect(activeSteps[1]).toHaveTextContent("Address");
    });
});
