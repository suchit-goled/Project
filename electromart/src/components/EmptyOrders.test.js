import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, useNavigate } from "react-router-dom";
import EmptyOrders from "./EmptyOrders";

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useNavigate: () => mockNavigate,
}));

describe("EmptyOrders Component Tests", () => {
    beforeEach(() => {
        mockNavigate.mockClear();
    });

    test("renders no orders headline, subtitle and navigates on button click", () => {
        render(
            <MemoryRouter>
                <EmptyOrders />
            </MemoryRouter>
        );

        expect(screen.getByText(/No Orders Yet/i)).toBeInTheDocument();
        expect(screen.getByText(/Looks like you haven't placed any orders/i)).toBeInTheDocument();

        const startShoppingBtn = screen.getByRole("button", { name: /Start Shopping/i });
        expect(startShoppingBtn).toBeInTheDocument();

        fireEvent.click(startShoppingBtn);
        expect(mockNavigate).toHaveBeenCalledWith("/products");
    });
});
