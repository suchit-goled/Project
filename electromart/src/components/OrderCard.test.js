import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import OrderCard from "./OrderCard";

describe("OrderCard Component", () => {
    const mockOrder = {
        _id: "60d0fe4f5311236168a109ca",
        createdAt: "2026-10-19T10:00:00Z",
        paymentStatus: "Pending",
        orderStatus: "Pending",
        total: 2499,
        products: [
            {
                productId: "prod_001",
                title: "ElectroNova Wireless Headphones",
                image: "https://example.com/headphones.jpg",
                price: 2499,
                quantity: 1
            }
        ]
    };

    test("renders order details, items and price correctly", () => {
        render(
            <BrowserRouter>
                <OrderCard order={mockOrder} />
            </BrowserRouter>
        );

        expect(screen.getByText(/Order #68A109CA/i)).toBeInTheDocument();
        expect(screen.getByText(/ElectroNova Wireless Headphones/i)).toBeInTheDocument();
        const priceMatches = screen.getAllByText(/₹2,499/i);
        expect(priceMatches.length).toBeGreaterThan(0);
    });

    test("displays Cancel button for Pending orders and handles cancel click", async () => {
        const handleCancel = jest.fn().mockResolvedValue(true);
        window.confirm = jest.fn(() => true);

        render(
            <BrowserRouter>
                <OrderCard order={mockOrder} onCancel={handleCancel} />
            </BrowserRouter>
        );

        const cancelBtn = screen.getByRole("button", { name: /cancel/i });
        expect(cancelBtn).toBeInTheDocument();

        await act(async () => {
            fireEvent.click(cancelBtn);
        });

        expect(window.confirm).toHaveBeenCalled();
        expect(handleCancel).toHaveBeenCalledWith("60d0fe4f5311236168a109ca");
    });
});
