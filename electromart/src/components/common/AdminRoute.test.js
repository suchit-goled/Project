import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import AdminRoute from "./AdminRoute";
import { AuthContext } from "../../context/AuthContext";

describe("AdminRoute Guard Tests", () => {
    afterEach(() => {
        localStorage.clear();
    });

    test("redirects unauthenticated visitor to /login", () => {
        const mockAuthValue = {
            token: null,
            user: null,
            loading: false
        };

        render(
            <AuthContext.Provider value={mockAuthValue}>
                <MemoryRouter initialEntries={["/admin"]}>
                    <Routes>
                        <Route
                            path="/admin"
                            element={
                                <AdminRoute>
                                    <div>Admin Control Center Content</div>
                                </AdminRoute>
                            }
                        />
                        <Route path="/login" element={<div>Login Page Target</div>} />
                    </Routes>
                </MemoryRouter>
            </AuthContext.Provider>
        );

        expect(screen.queryByText(/Admin Control Center Content/i)).not.toBeInTheDocument();
        expect(screen.getByText(/Login Page Target/i)).toBeInTheDocument();
    });

    test("displays 403 Forbidden when visitor is logged in as regular customer", () => {
        const regularUser = { _id: "u123", name: "Alice", role: "user" };
        const mockAuthValue = {
            token: "valid-user-token",
            user: regularUser,
            loading: false
        };
        localStorage.setItem("token", "valid-user-token");
        localStorage.setItem("user", JSON.stringify(regularUser));

        render(
            <AuthContext.Provider value={mockAuthValue}>
                <MemoryRouter initialEntries={["/admin"]}>
                    <Routes>
                        <Route
                            path="/admin"
                            element={
                                <AdminRoute>
                                    <div>Admin Control Center Content</div>
                                </AdminRoute>
                            }
                        />
                    </Routes>
                </MemoryRouter>
            </AuthContext.Provider>
        );

        expect(screen.queryByText(/Admin Control Center Content/i)).not.toBeInTheDocument();
        expect(screen.getByText(/403 — Administrator Access Required/i)).toBeInTheDocument();
        expect(screen.getByText(/Return to Storefront/i)).toBeInTheDocument();
    });

    test("renders admin content when user has administrator role", () => {
        const adminUser = { _id: "a123", name: "SuperAdmin", role: "admin" };
        const mockAuthValue = {
            token: "valid-admin-token",
            user: adminUser,
            loading: false
        };
        localStorage.setItem("token", "valid-admin-token");
        localStorage.setItem("user", JSON.stringify(adminUser));

        render(
            <AuthContext.Provider value={mockAuthValue}>
                <MemoryRouter initialEntries={["/admin"]}>
                    <Routes>
                        <Route
                            path="/admin"
                            element={
                                <AdminRoute>
                                    <div>Admin Control Center Content</div>
                                </AdminRoute>
                            }
                        />
                    </Routes>
                </MemoryRouter>
            </AuthContext.Provider>
        );

        expect(screen.getByText(/Admin Control Center Content/i)).toBeInTheDocument();
    });
});
