import React from "react";
import { render, screen } from "@testing-library/react";
import Badge from "./Badge";

describe("Badge UI Component Tests", () => {
    test("renders children text content", () => {
        render(<Badge>Verified Buyer</Badge>);
        expect(screen.getByText("Verified Buyer")).toBeInTheDocument();
    });

    test("applies default primary badge variant class", () => {
        render(<Badge>Default Badge</Badge>);
        const badgeElement = screen.getByText("Default Badge");

        expect(badgeElement).toHaveClass("ui-badge");
        expect(badgeElement).toHaveClass("ui-badge-primary");
    });

    test("applies custom variant and additional class names", () => {
        render(<Badge variant="success" className="custom-elevation">In Stock</Badge>);
        const badgeElement = screen.getByText("In Stock");

        expect(badgeElement).toHaveClass("ui-badge");
        expect(badgeElement).toHaveClass("ui-badge-success");
        expect(badgeElement).toHaveClass("custom-elevation");
    });
});
