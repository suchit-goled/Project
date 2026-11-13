import React from "react";
import { render, screen } from "@testing-library/react";
import AnnouncementBar from "./AnnouncementBar";

describe("AnnouncementBar Component Tests", () => {
    test("renders shipping value proposition", () => {
        render(<AnnouncementBar />);
        expect(screen.getByText(/Free Express Shipping on Orders Over ₹1,000/i)).toBeInTheDocument();
    });

    test("renders genuine warranty promise", () => {
        render(<AnnouncementBar />);
        expect(screen.getByText(/100% Genuine Products with 1-Year Brand Warranty/i)).toBeInTheDocument();
    });

    test("renders SSL security trust badge", () => {
        render(<AnnouncementBar />);
        expect(screen.getByText(/256-Bit SSL Encrypted & Verified/i)).toBeInTheDocument();
    });

    test("renders customer support assurance", () => {
        render(<AnnouncementBar />);
        expect(screen.getByText(/24\/7 Premium Customer Support/i)).toBeInTheDocument();
    });
});
