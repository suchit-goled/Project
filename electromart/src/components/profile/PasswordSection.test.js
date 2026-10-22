import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import PasswordSection from "./PasswordSection";

jest.mock("../../api/axios", () => ({
    put: jest.fn(() => Promise.resolve({ data: { success: true } }))
}));

describe("PasswordSection Component Tests", () => {
    test("renders change password form elements", () => {
        render(<PasswordSection />);

        expect(screen.getByText(/Change Password/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Enter current password/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Enter new password/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Confirm new password/i)).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /Update Password/i })).toBeInTheDocument();
    });

    test("toggles password visibility when Show/Hide button is clicked", () => {
        render(<PasswordSection />);

        const currentInput = screen.getByPlaceholderText(/Enter current password/i);
        expect(currentInput).toHaveAttribute("type", "password");

        const showButtons = screen.getAllByRole("button", { name: /Show/i });
        fireEvent.click(showButtons[0]);

        expect(currentInput).toHaveAttribute("type", "text");

        const hideButton = screen.getByRole("button", { name: /Hide/i });
        fireEvent.click(hideButton);

        expect(currentInput).toHaveAttribute("type", "password");
    });
});
