import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import PublicOnlyRoute from "./PublicOnlyRoute";
import { AuthContext } from "../../context/AuthContext";

describe("PublicOnlyRoute Guard Tests", () => {
    beforeEach(() => {
        localStorage.clear();
    });

    test("renders public guest content when visitor is not authenticated", () => {
        const mockAuthValue = {
            token: null,
            user: null,
            loading: false
        };

        render(
            <AuthContext.Provider value={mockAuthValue}>
                <MemoryRouter initialEntries={["/login"]}>
                    <Routes>
                        <Route
                            path="/login"
                            element={
                                <PublicOnlyRoute>
                                    <div>Login Form For Guests</div>
                                </PublicOnlyRoute>
                            }
                        />
                        <Route path="/profile" element={<div>Profile Target</div>} />
                    </Routes>
                </MemoryRouter>
            </AuthContext.Provider>
        );

        expect(screen.getByText(/Login Form For Guests/i)).toBeInTheDocument();
        expect(screen.queryByText(/Profile Target/i)).not.toBeInTheDocument();
    });

    test("redirects authenticated user to /profile when token exists in context", () => {
        const mockAuthValue = {
            token: "active-auth-token-123",
            user: { _id: "u1", name: "Alice" },
            loading: false
        };

        render(
            <AuthContext.Provider value={mockAuthValue}>
                <MemoryRouter initialEntries={["/login"]}>
                    <Routes>
                        <Route
                            path="/login"
                            element={
                                <PublicOnlyRoute>
                                    <div>Login Form For Guests</div>
                                </PublicOnlyRoute>
                            }
                        />
                        <Route path="/profile" element={<div>Profile Target</div>} />
                    </Routes>
                </MemoryRouter>
            </AuthContext.Provider>
        );

        expect(screen.queryByText(/Login Form For Guests/i)).not.toBeInTheDocument();
        expect(screen.getByText(/Profile Target/i)).toBeInTheDocument();
    });

    test("redirects authenticated user to /profile when token exists in localStorage", () => {
        localStorage.setItem("token", "stored-token-456");
        const mockAuthValue = {
            token: null,
            user: null,
            loading: false
        };

        render(
            <AuthContext.Provider value={mockAuthValue}>
                <MemoryRouter initialEntries={["/signup"]}>
                    <Routes>
                        <Route
                            path="/signup"
                            element={
                                <PublicOnlyRoute>
                                    <div>Signup Form For Guests</div>
                                </PublicOnlyRoute>
                            }
                        />
                        <Route path="/profile" element={<div>Profile Target</div>} />
                    </Routes>
                </MemoryRouter>
            </AuthContext.Provider>
        );

        expect(screen.queryByText(/Signup Form For Guests/i)).not.toBeInTheDocument();
        expect(screen.getByText(/Profile Target/i)).toBeInTheDocument();
    });
});
