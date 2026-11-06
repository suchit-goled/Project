import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Hero from "./Hero";

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useNavigate: () => mockNavigate
}));

describe("Hero Component Tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("renders authoritative hero heading, badge, and value pillars", () => {
        render(
            <MemoryRouter>
                <Hero />
            </MemoryRouter>
        );

        expect(screen.getByText(/Authorised Consumer Electronics Retailer/i)).toBeInTheDocument();
        expect(screen.getByText(/Delivered to Your Door/i)).toBeInTheDocument();
        expect(screen.getByText("8,800+")).toBeInTheDocument();
        expect(screen.getByText("Verified Products")).toBeInTheDocument();
        expect(screen.getByText("100%")).toBeInTheDocument();
        expect(screen.getByText("Brand Warranty")).toBeInTheDocument();
        expect(screen.getByText("Free 48h")).toBeInTheDocument();
    });

    test("renders device switcher tabs and switches spotlight display on click", () => {
        render(
            <MemoryRouter>
                <Hero />
            </MemoryRouter>
        );

        // Default tab is Laptops (MacBook)
        expect(screen.getByText("Apple MacBook Pro 16\"")).toBeInTheDocument();
        expect(screen.getByText("Apple M3 Max Chip")).toBeInTheDocument();

        // Switch to Phones tab
        const phonesTab = screen.getByRole("button", { name: /^Phones$/i });
        fireEvent.click(phonesTab);

        expect(screen.getByText("iPhone 16 Pro Max")).toBeInTheDocument();
        expect(screen.getByText("A18 Pro Bionic")).toBeInTheDocument();

        // Switch to Wearables tab
        const wearablesTab = screen.getByRole("button", { name: /^Wearables$/i });
        fireEvent.click(wearablesTab);

        expect(screen.getByText("Apple Watch Ultra 2")).toBeInTheDocument();
        expect(screen.getByText("Precision Dual GPS")).toBeInTheDocument();
    });

    test("clicking Explore Products routes to /products", () => {
        render(
            <MemoryRouter>
                <Hero />
            </MemoryRouter>
        );

        const exploreBtn = screen.getByRole("button", { name: /Explore 8,800\+ Products/i });
        fireEvent.click(exploreBtn);

        expect(mockNavigate).toHaveBeenCalledWith("/products");
    });

    test("clicking Festive Flash Deals routes to /deals", () => {
        render(
            <MemoryRouter>
                <Hero />
            </MemoryRouter>
        );

        const dealsBtn = screen.getByRole("button", { name: /Festive Flash Deals/i });
        fireEvent.click(dealsBtn);

        expect(mockNavigate).toHaveBeenCalledWith("/deals");
    });
});
