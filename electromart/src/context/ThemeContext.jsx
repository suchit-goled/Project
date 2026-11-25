import React, { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => {
        return "light";
    });

    useEffect(() => {
        try {
            document.documentElement.setAttribute("data-theme", theme);
            document.body.setAttribute("data-theme", theme);
            localStorage.setItem("electronova_theme", theme);
        } catch {
            // Ignore storage errors
        }
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prev) => (prev === "light" ? "dark" : "light"));
    };

    const isDark = theme === "dark";

    return (
        <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, isDark }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        return {
            theme: "light",
            setTheme: () => {},
            toggleTheme: () => {},
            isDark: false,
        };
    }
    return context;
};

export default ThemeContext;
