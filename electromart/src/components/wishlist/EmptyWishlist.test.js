import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import EmptyWishlist from "./EmptyWishlist";

describe("EmptyWishlist Component Tests", () => {
    test("renders empty wishlist title and explore products link", () => {
        render(
            <MemoryRouter>
                <EmptyWishlist />
            </MemoryRouter>
        );

        expect(screen.getByText(/Your Wishlist is Empty/i)).toBeInTheDocument();
        expect(screen.getByText(/Save products you love and buy them later/i)).toBeInTheDocument();

        const exploreBtn = screen.getByRole("link", { name: /Explore Products/i });
        expect(exploreBtn).toBeInTheDocument();
        expect(exploreBtn).toHaveAttribute("href", "/products");
    });
});
