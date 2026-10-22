import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

import "./Login.css";

const Login = () => {
    const navigate = useNavigate();
    const { login, loading } = useAuth();

    const [form, setForm] = useState({
        email: "",
        password: ""
    });

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await login(form);
            toast.success("Welcome back to ElectroNova!");
            navigate("/");
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                "Login Failed. Please check your credentials."
            );
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h1>Welcome Back 👋</h1>
                <p>Login to continue shopping.</p>

                <form onSubmit={handleSubmit}>
                    <input
                        type="email"
                        name="email"
                        placeholder="Email Address"
                        value={form.email}
                        onChange={handleChange}
                        required
                    />

                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={form.password}
                        onChange={handleChange}
                        required
                    />

                    <div style={{ display: "flex", justifyContent: "flex-end", margin: "-6px 0 16px 0" }}>
                        <Link
                            to="/forgot-password"
                            style={{
                                color: "#ff6e26",
                                fontSize: "0.85rem",
                                textDecoration: "none",
                                fontWeight: 500,
                                transition: "color 0.2s"
                            }}
                        >
                            Forgot Password?
                        </Link>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>

                <p className="auth-link">
                    Don't have an account? <Link to="/register">Sign Up</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
