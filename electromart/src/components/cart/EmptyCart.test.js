import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import EmptyCart from "./EmptyCart";

describe("EmptyCart Component Tests", () => {
    test("renders empty cart illustration text and action button", () => {
        render(
            <MemoryRouter>
                <EmptyCart />
            </MemoryRouter>
        );

        expect(screen.getByText(/Your Cart is Empty/i)).toBeInTheDocument();
        expect(screen.getByText(/Explore our latest gadgets/i)).toBeInTheDocument();

        const continueBtn = screen.getByRole("link", { name: /Continue Shopping/i });
        expect(continueBtn).toBeInTheDocument();
        expect(continueBtn).toHaveAttribute("href", "/products");
    });
});
