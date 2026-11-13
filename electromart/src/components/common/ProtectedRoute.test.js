import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import { AuthContext } from "../../context/AuthContext";

describe("ProtectedRoute Guard Tests", () => {
    test("redirects unauthenticated visitor to /login", () => {
        const mockAuthValue = {
            token: null,
            user: null,
            loading: false
        };
        localStorage.removeItem("token");

        render(
            <AuthContext.Provider value={mockAuthValue}>
                <MemoryRouter initialEntries={["/profile"]}>
                    <Routes>
                        <Route
                            path="/profile"
                            element={
                                <ProtectedRoute>
                                    <div>Protected Profile Content</div>
                                </ProtectedRoute>
                            }
                        />
                        <Route path="/login" element={<div>Login Page Target</div>} />
                    </Routes>
                </MemoryRouter>
            </AuthContext.Provider>
        );

        expect(screen.queryByText(/Protected Profile Content/i)).not.toBeInTheDocument();
        expect(screen.getByText(/Login Page Target/i)).toBeInTheDocument();
    });

    test("renders protected content when user has active session", () => {
        const mockAuthValue = {
            token: "valid-jwt-token-xyz",
            user: { _id: "u123", name: "John Doe", email: "john@example.com" },
            loading: false
        };

        render(
            <AuthContext.Provider value={mockAuthValue}>
                <MemoryRouter initialEntries={["/profile"]}>
                    <Routes>
                        <Route
                            path="/profile"
                            element={
                                <ProtectedRoute>
                                    <div>Protected Profile Content</div>
                                </ProtectedRoute>
                            }
                        />
                    </Routes>
                </MemoryRouter>
            </AuthContext.Provider>
        );

        expect(screen.getByText(/Protected Profile Content/i)).toBeInTheDocument();
    });
});
