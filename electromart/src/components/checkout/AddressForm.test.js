import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import AddressForm from "./AddressForm";
import * as AuthContextModule from "../../context/AuthContext";

jest.mock("../../context/AuthContext", () => ({
    useAuth: jest.fn()
}));

describe("AddressForm Component Tests", () => {
    beforeEach(() => {
        AuthContextModule.useAuth.mockReturnValue({
            user: {
                name: "Suchit Goled",
                phone: "9876543210",
                address: "42 Tech Boulevard, Indiranagar",
                city: "Bengaluru",
                state: "Karnataka",
                pincode: "560038"
            }
        });
    });

    test("renders all address fields with labels and inputs", () => {
        render(<AddressForm onAddressChange={jest.fn()} />);

        expect(screen.getByText(/Shipping & Delivery Address/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Phone Number/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Street Address/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/City/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/State/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Postal PIN Code/i)).toBeInTheDocument();
    });

    test("prefills inputs from user context profile", () => {
        render(<AddressForm onAddressChange={jest.fn()} />);

        expect(screen.getByLabelText(/Full Name/i).value).toBe("Suchit Goled");
        expect(screen.getByLabelText(/Phone Number/i).value).toBe("9876543210");
        expect(screen.getByLabelText(/Street Address/i).value).toBe("42 Tech Boulevard, Indiranagar");
        expect(screen.getByLabelText(/City/i).value).toBe("Bengaluru");
        expect(screen.getByLabelText(/State/i).value).toBe("Karnataka");
        expect(screen.getByLabelText(/Postal PIN Code/i).value).toBe("560038");
        expect(screen.getByText(/Prefilled from Profile/i)).toBeInTheDocument();
    });

    test("calls onAddressChange callback when an input is modified", () => {
        const onAddressChangeMock = jest.fn();
        render(<AddressForm onAddressChange={onAddressChangeMock} />);

        const cityInput = screen.getByLabelText(/City/i);
        fireEvent.change(cityInput, { target: { value: "Mysuru" } });

        expect(cityInput.value).toBe("Mysuru");
        expect(onAddressChangeMock).toHaveBeenCalled();
    });
});
