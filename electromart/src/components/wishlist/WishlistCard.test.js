import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import WishlistCard from "./WishlistCard";
import * as CartContextModule from "../../context/CartContext";
import * as WishlistContextModule from "../../context/WishlistContext";

jest.mock("../../context/CartContext", () => ({
    ...jest.requireActual("../../context/CartContext"),
    useCart: jest.fn()
}));

jest.mock("../../context/WishlistContext", () => ({
    ...jest.requireActual("../../context/WishlistContext"),
    useWishlist: jest.fn()
}));

describe("WishlistCard Component Tests", () => {
    const mockAddToCart = jest.fn().mockResolvedValue(true);
    const mockRemoveFromWishlist = jest.fn().mockResolvedValue(true);

    const dummyProduct = {
        _id: "wish-202",
        product_title: "Apple MacBook Pro M3 Max",
        product_category: "Laptops",
        discounted_price: 299900,
        original_price: 349900,
        discount_percentage: 14,
        product_rating: 4.9,
        total_reviews: 420,
        product_image_url: "https://example.com/macbook.jpg"
    };

    beforeEach(() => {
        jest.clearAllMocks();
        CartContextModule.useCart.mockReturnValue({
            addToCart: mockAddToCart
        });
        WishlistContextModule.useWishlist.mockReturnValue({
            removeFromWishlist: mockRemoveFromWishlist
        });
    });

    test("renders wishlist product details: title, ratings, prices, and move to cart CTA", () => {
        render(
            <MemoryRouter>
                <WishlistCard product={dummyProduct} />
            </MemoryRouter>
        );

        expect(screen.getByText("Apple MacBook Pro M3 Max")).toBeInTheDocument();
        expect(screen.getByText("4.9")).toBeInTheDocument();
        expect(screen.getByText(/420 Reviews/i)).toBeInTheDocument();
        expect(screen.getByText("₹2,99,900")).toBeInTheDocument();
        expect(screen.getByText("₹3,49,900")).toBeInTheDocument();
        expect(screen.getByText("14% OFF")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /Move To Cart/i })).toBeInTheDocument();
    });

    test("clicking Move To Cart adds item to cart and removes from wishlist", async () => {
        render(
            <MemoryRouter>
                <WishlistCard product={dummyProduct} />
            </MemoryRouter>
        );

        const moveBtn = screen.getByRole("button", { name: /Move To Cart/i });
        fireEvent.click(moveBtn);

        await waitFor(() => {
            expect(mockAddToCart).toHaveBeenCalledWith("wish-202");
            expect(mockRemoveFromWishlist).toHaveBeenCalledWith("wish-202");
        });
    });

    test("clicking heart remove button triggers removeFromWishlist", () => {
        render(
            <MemoryRouter>
                <WishlistCard product={dummyProduct} />
            </MemoryRouter>
        );

        const buttons = screen.getAllByRole("button");
        const removeHeartBtn = buttons.find(b => b.classList.contains("wishlist-remove"));
        expect(removeHeartBtn).toBeInTheDocument();

        fireEvent.click(removeHeartBtn);
        expect(mockRemoveFromWishlist).toHaveBeenCalledWith("wish-202");
    });
});
