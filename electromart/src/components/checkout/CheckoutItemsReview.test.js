import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import CheckoutItemsReview from "./CheckoutItemsReview";
import * as CartContextModule from "../../context/CartContext";

jest.mock("../../context/CartContext", () => ({
    useCart: jest.fn()
}));

describe("CheckoutItemsReview Component Tests", () => {
    const mockCart = [
        {
            productId: {
                _id: "p1",
                product_title: "Sony WH-1000XM5 Wireless Headphones",
                product_image_url: "https://example.com/sony.jpg",
                discounted_price: 26990,
                category: "Headphones"
            },
            quantity: 2,
            price: 26990
        },
        {
            productId: {
                _id: "p2",
                product_title: "Logitech MX Master 3S Mouse",
                product_image_url: "https://example.com/mouse.jpg",
                discounted_price: 8995,
                category: "Accessories"
            },
            quantity: 1,
            price: 8995
        }
    ];

    test("renders all items with title, quantity and subtotal correctly", () => {
        CartContextModule.useCart.mockReturnValue({
            cart: mockCart,
            cartCount: 3,
            subtotal: 62975,
            shippingCharge: 0
        });

        render(
            <MemoryRouter>
                <CheckoutItemsReview />
            </MemoryRouter>
        );

        expect(screen.getByText(/Review Order Items/i)).toBeInTheDocument();
        expect(screen.getByText(/3 items ready for dispatch/i)).toBeInTheDocument();
        expect(screen.getByText("Sony WH-1000XM5 Wireless Headphones")).toBeInTheDocument();
        expect(screen.getByText("Logitech MX Master 3S Mouse")).toBeInTheDocument();
        expect(screen.getByText("₹53,980")).toBeInTheDocument(); // 26990 * 2
        expect(screen.getByText("₹8,995")).toBeInTheDocument();  // 8995 * 1
        expect(screen.getByText("Free Express Delivery")).toBeInTheDocument();
        expect(screen.getByText("Modify Cart")).toBeInTheDocument();
    });

    test("returns null if cart is empty", () => {
        CartContextModule.useCart.mockReturnValue({
            cart: [],
            cartCount: 0,
            subtotal: 0,
            shippingCharge: 0
        });

        const { container } = render(
            <MemoryRouter>
                <CheckoutItemsReview />
            </MemoryRouter>
        );

        expect(container.firstChild).toBeNull();
    });
});
