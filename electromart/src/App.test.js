import React from "react";
import { render, screen } from "@testing-library/react";
import App from "./App";
import { SearchProvider } from "./context/SearchContext";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";

const renderWithProviders = (ui) => {
    return render(
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
};

test("renders ElectroNova brand header logo", () => {
    renderWithProviders(<App />);
    const brandElements = screen.getAllByText(/ElectroNova/i);
    expect(brandElements.length).toBeGreaterThan(0);
});

test("renders navigation links", () => {
    renderWithProviders(<App />);
    const homeLinks = screen.getAllByText(/Home/i);
    expect(homeLinks.length).toBeGreaterThan(0);
});
