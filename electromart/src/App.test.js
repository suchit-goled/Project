import React from "react";
import { render, screen, act, waitFor } from "@testing-library/react";
import App from "./App";
import { SearchProvider } from "./context/SearchContext";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";

const renderWithProviders = async (ui) => {
    let result;
    await act(async () => {
        result = render(
            <SearchProvider>
                <AuthProvider>
                    <WishlistProvider>
                        <CartProvider>
                            {ui}
                        </CartProvider>
                    </WishlistProvider>
                </AuthProvider>
            </SearchProvider>
        );
    });
    return result;
};

test("renders ElectroNova brand header logo", async () => {
    await renderWithProviders(<App />);
    await waitFor(() => {
        const brandElements = screen.getAllByText(/ElectroNova/i);
        expect(brandElements.length).toBeGreaterThan(0);
    });
});

test("renders navigation links", async () => {
    await renderWithProviders(<App />);
    await waitFor(() => {
        const homeLinks = screen.getAllByText(/Home/i);
        expect(homeLinks.length).toBeGreaterThan(0);
    });
});
