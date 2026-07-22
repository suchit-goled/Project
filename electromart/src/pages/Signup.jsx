import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import "./Login.css";

const Signup = () => {

    const navigate = useNavigate();

    const { signup, loading } = useAuth();

    const [form, setForm] = useState({

        name: "",

        email: "",

        password: "",

        confirmPassword: ""

    });

    const handleChange = (e) => {

        setForm({

            ...form,

            [e.target.name]: e.target.value

        });

    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        if (form.password !== form.confirmPassword) {

            alert("Passwords do not match.");

            return;

        }

        try {

            await signup({

                name: form.name,

                email: form.email,

                password: form.password

            });

            navigate("/");

        } catch (error) {

            alert(

                error.response?.data?.message ||

                "Signup Failed"

            );

        }

    };

    return (

        <div className="auth-page">

            <div className="auth-card">

                <h1>Create Account 🚀</h1>

                <p>Join ElectroNova today.</p>

                <form onSubmit={handleSubmit}>

                    <input
                        type="text"
                        name="name"
                        placeholder="Full Name"
                        value={form.name}
                        onChange={handleChange}
                        required
                    />

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

                    <input
                        type="password"
                        name="confirmPassword"
                        placeholder="Confirm Password"
                        value={form.confirmPassword}
                        onChange={handleChange}
                        required
                    />

                    <button
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? "Creating..." : "Create Account"}
                    </button>

                </form>

                <p className="auth-link">

                    Already have an account?

                    <Link to="/login">

                        Login

                    </Link>

                </p>

            </div>

        </div>

    );

};

export default Signup;