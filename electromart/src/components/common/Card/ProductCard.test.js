import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ProductCard from "./ProductCard";
import * as CartContextModule from "../../../context/CartContext";
import * as WishlistContextModule from "../../../context/WishlistContext";

jest.mock("../../../context/CartContext", () => ({
    ...jest.requireActual("../../../context/CartContext"),
    useCart: jest.fn()
}));

jest.mock("../../../context/WishlistContext", () => ({
    ...jest.requireActual("../../../context/WishlistContext"),
    useWishlist: jest.fn()
}));

describe("ProductCard Component Tests", () => {
    const mockAddToCart = jest.fn();
    const mockAddToWishlist = jest.fn();
    const mockRemoveFromWishlist = jest.fn();
    const mockIsWishlisted = jest.fn().mockReturnValue(false);

    const dummyProduct = {
        _id: "prod-101",
        product_title: "Sony WH-1000XM5 Wireless Headphones",
        product_category: "Headphones",
        discounted_price: 24999,
        original_price: 29999,
        discount_percentage: 17,
        product_rating: 4.8,
        total_reviews: 1250,
        product_image_url: "https://example.com/sony-xm5.jpg"
    };

    beforeEach(() => {
        jest.clearAllMocks();
        CartContextModule.useCart.mockReturnValue({
            addToCart: mockAddToCart
        });
        WishlistContextModule.useWishlist.mockReturnValue({
            addToWishlist: mockAddToWishlist,
            removeFromWishlist: mockRemoveFromWishlist,
            isWishlisted: mockIsWishlisted
        });
    });

    test("renders product details: title, category, badge, prices, and reviews", () => {
        render(
            <MemoryRouter>
                <ProductCard product={dummyProduct} />
            </MemoryRouter>
        );

        expect(screen.getByText("Sony WH-1000XM5 Wireless Headphones")).toBeInTheDocument();
        expect(screen.getByText("Headphones")).toBeInTheDocument();
        expect(screen.getByText("17% OFF")).toBeInTheDocument();
        expect(screen.getByText("₹24,999")).toBeInTheDocument();
        expect(screen.getByText("₹29,999")).toBeInTheDocument();
        expect(screen.getByText(/1,250 Reviews/i)).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /Add To Cart/i })).toBeInTheDocument();
    });

    test("clicking Add To Cart invokes addToCart handler", () => {
        render(
            <MemoryRouter>
                <ProductCard product={dummyProduct} />
            </MemoryRouter>
        );

        const addBtn = screen.getByRole("button", { name: /Add To Cart/i });
        fireEvent.click(addBtn);

        expect(mockAddToCart).toHaveBeenCalledTimes(1);
        expect(mockAddToCart).toHaveBeenCalledWith("prod-101");
    });

    test("clicking wishlist button invokes addToWishlist when not wishlisted", async () => {
        render(
            <MemoryRouter>
                <ProductCard product={dummyProduct} />
            </MemoryRouter>
        );

        const buttons = screen.getAllByRole("button");
        const wishlistBtn = buttons.find(b => b.classList.contains("wishlist-btn"));
        expect(wishlistBtn).toBeInTheDocument();

        fireEvent.click(wishlistBtn);
        expect(mockAddToWishlist).toHaveBeenCalledTimes(1);
        expect(mockAddToWishlist).toHaveBeenCalledWith("prod-101");
    });
});
