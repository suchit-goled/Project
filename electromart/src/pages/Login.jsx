import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

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

            navigate("/");

        } catch (error) {

            alert(
                error.response?.data?.message ||
                "Login Failed"
            );

        }

    };

    return (

        <div className="auth-page">

            <div className="auth-card">

                <h1>

                    Welcome Back 👋

                </h1>

                <p>

                    Login to continue shopping.

                </p>

                <form onSubmit={handleSubmit}>

                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
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

                    <button
                        type="submit"
                        disabled={loading}
                    >

                        {loading ? "Logging in..." : "Login"}

                    </button>

                </form>

                <p className="auth-link">

                    Don't have an account?

                    <Link to="/signup">

                        Sign Up

                    </Link>

                </p>

            </div>

        </div>

    );

};

export default Login;