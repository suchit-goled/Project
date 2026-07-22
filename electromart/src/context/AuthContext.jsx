import { createContext, useContext, useEffect, useState } from "react";

import AuthService from "../services/auth.service";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

    const [user, setUser] = useState(null);

    const [token, setToken] = useState(
        localStorage.getItem("token")
    );

    const [loading, setLoading] = useState(false);

    useEffect(() => {

        const savedUser = localStorage.getItem("user");

        if (savedUser) {

            setUser(JSON.parse(savedUser));

        }

    }, []);

    const signup = async (userData) => {

        setLoading(true);

        try {

            const data = await AuthService.signup(userData);

            localStorage.setItem(
                "token",
                data.token
            );

            localStorage.setItem(
                "user",
                JSON.stringify(data.user)
            );

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

            localStorage.setItem(
                "token",
                data.token
            );

            localStorage.setItem(
                "user",
                JSON.stringify(data.user)
            );

            setToken(data.token);

            setUser(data.user);

            return data;

        } finally {

            setLoading(false);

        }

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
                logout
            }}
        >

            {children}

        </AuthContext.Provider>

    );

};

export const useAuth = () => useContext(AuthContext);