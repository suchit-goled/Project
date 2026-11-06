import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import CartItem from "./CartItem";
import * as CartContextModule from "../../context/CartContext";

jest.mock("../../context/CartContext", () => ({
    ...jest.requireActual("../../context/CartContext"),
    useCart: jest.fn()
}));

describe("CartItem Component Tests", () => {
    const mockUpdateQuantity = jest.fn();
    const mockRemoveItem = jest.fn();

    const sampleItem = {
        productId: {
            _id: "prod-item-101",
            product_title: "Sony WH-1000XM5 Wireless Headphones",
            product_category: "Headphones",
            discounted_price: 24990,
            original_price: 34990,
            discount_percentage: 29,
            product_image_url: "https://example.com/sony-xm5.jpg"
        },
        quantity: 2
    };

    beforeEach(() => {
        jest.clearAllMocks();
        CartContextModule.useCart.mockReturnValue({
            updateQuantity: mockUpdateQuantity,
            removeItem: mockRemoveItem
        });
    });

    test("renders item title, category, formatted prices, and quantity", () => {
        render(
            <MemoryRouter>
                <CartItem item={sampleItem} />
            </MemoryRouter>
        );

        expect(screen.getByText("Sony WH-1000XM5 Wireless Headphones")).toBeInTheDocument();
        expect(screen.getByText("Headphones")).toBeInTheDocument();
        expect(screen.getByText("₹24,990")).toBeInTheDocument();
        expect(screen.getByText("₹34,990")).toBeInTheDocument();
        expect(screen.getByText("29% OFF")).toBeInTheDocument();
        expect(screen.getByText("2")).toBeInTheDocument();
    });

    test("clicking increase quantity calls updateQuantity with quantity + 1", () => {
        render(
            <MemoryRouter>
                <CartItem item={sampleItem} />
            </MemoryRouter>
        );

        const increaseBtn = screen.getByRole("button", { name: /Increase quantity/i });
        fireEvent.click(increaseBtn);

        expect(mockUpdateQuantity).toHaveBeenCalledWith("prod-item-101", 3);
    });

    test("clicking decrease quantity calls updateQuantity with quantity - 1", () => {
        render(
            <MemoryRouter>
                <CartItem item={sampleItem} />
            </MemoryRouter>
        );

        const decreaseBtn = screen.getByRole("button", { name: /Decrease quantity/i });
        fireEvent.click(decreaseBtn);

        expect(mockUpdateQuantity).toHaveBeenCalledWith("prod-item-101", 1);
    });

    test("decrease quantity button is disabled when quantity is 1", () => {
        const singleQtyItem = {
            ...sampleItem,
            quantity: 1
        };

        render(
            <MemoryRouter>
                <CartItem item={singleQtyItem} />
            </MemoryRouter>
        );

        const decreaseBtn = screen.getByRole("button", { name: /Decrease quantity/i });
        expect(decreaseBtn).toBeDisabled();
    });

    test("clicking remove button calls removeItem with product ID", () => {
        render(
            <MemoryRouter>
                <CartItem item={sampleItem} />
            </MemoryRouter>
        );

        const removeBtn = screen.getByRole("button", { name: /Remove item/i });
        fireEvent.click(removeBtn);

        expect(mockRemoveItem).toHaveBeenCalledWith("prod-item-101");
    });
});
