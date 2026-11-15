import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import SortDropdown from "./SortDropdown";

describe("SortDropdown Component Tests", () => {
    test("renders label and all 5 sort options", () => {
        render(<SortDropdown value="newest" onChange={() => {}} />);

        expect(screen.getByText("Sort By:")).toBeInTheDocument();
        const select = screen.getByRole("combobox", { name: /Sort products/i });
        expect(select).toBeInTheDocument();

        expect(screen.getByRole("option", { name: /Featured \/ Newest/i })).toBeInTheDocument();
        expect(screen.getByRole("option", { name: /Price: Low to High/i })).toBeInTheDocument();
        expect(screen.getByRole("option", { name: /Price: High to Low/i })).toBeInTheDocument();
        expect(screen.getByRole("option", { name: /Highest Rated/i })).toBeInTheDocument();
        expect(screen.getByRole("option", { name: /Biggest Discount/i })).toBeInTheDocument();
    });

    test("reflects the current sort value correctly", () => {
        render(<SortDropdown value="priceLow" onChange={() => {}} />);

        const select = screen.getByRole("combobox", { name: /Sort products/i });
        expect(select.value).toBe("priceLow");
    });

    test("fires onChange and setSort when user changes selection", () => {
        const handleChange = jest.fn();
        const handleSetSort = jest.fn();

        render(<SortDropdown value="newest" onChange={handleChange} setSort={handleSetSort} />);

        const select = screen.getByRole("combobox", { name: /Sort products/i });
        fireEvent.change(select, { target: { value: "rating" } });

        expect(handleChange).toHaveBeenCalled();
        expect(handleSetSort).toHaveBeenCalledWith("rating");
    });
});
