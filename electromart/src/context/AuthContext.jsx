import { createContext, useContext, useEffect, useState } from "react";
import AuthService from "../services/auth.service";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(
        localStorage.getItem("token")
    );
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        try {
            const savedUser = localStorage.getItem("user");
            if (savedUser) {
                setUser(JSON.parse(savedUser));
            }
        } catch (error) {
            console.error("Failed to parse cached user credentials:", error);
            localStorage.removeItem("user");
            localStorage.removeItem("token");
            setUser(null);
            setToken(null);
        }
    }, []);

    const signup = async (userData) => {
        setLoading(true);
        try {
            const data = await AuthService.signup(userData);
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));
            setToken(data.token);
            setUser(data.user);
            return data;
        } finally {
            setLoading(false);
        }
    };

    const login = async (credentials) => {
        setLoading(true);
        try {
            const data = await AuthService.login(credentials);
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));
            setToken(data.token);
            setUser(data.user);
            return data;
        } finally {
            setLoading(false);
        }
    };

    const updateUser = (updatedUserData) => {
        const nextUser = typeof updatedUserData === "function" ? updatedUserData(user) : updatedUserData;
        localStorage.setItem("user", JSON.stringify(nextUser));
        setUser(nextUser);
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
        setToken(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                loading,
                login,
                signup,
                logout,
                updateUser
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
