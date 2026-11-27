import React, { useState, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import "./Login.css";
import { authReturn } from "../utils/authReturn";

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, loading } = useAuth();

    const [form, setForm] = useState({
        email: "",
        password: ""
    });

    const [showPassword, setShowPassword] = useState(false);
    const [inlineError, setInlineError] = useState("");

    const emailRef = useRef(null);
    const passwordRef = useRef(null);
    const errorRef = useRef(null);

    const handleChange = (e) => {
        if (inlineError) setInlineError("");
        setForm((prev) => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const togglePasswordVisibility = () => {
        setShowPassword((prev) => !prev);
        requestAnimationFrame(() => {
            passwordRef.current?.focus();
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setInlineError("");

        if (!form.email.trim()) {
            setInlineError("Enter your email address to sign in.");
            requestAnimationFrame(() => emailRef.current?.focus());
            return;
        }
        if (!form.password) {
            setInlineError("Enter your password to continue.");
            requestAnimationFrame(() => passwordRef.current?.focus());
            return;
        }

        try {
            await login(form);
            toast.success("Signed in to ElectroNova.");
            navigate(authReturn(location, "/"), { replace: true });
        } catch (error) {
            const msg =
                error.response?.data?.message ||
                "We could not verify those credentials. Check your email and password and try again.";
            setInlineError(msg);
            requestAnimationFrame(() => errorRef.current?.focus());
        }
    };

    const fillDemo = (email, pass) => {
        setInlineError("");
        setForm({ email, password: pass });
    };

    return (
        <main className="auth-spread">
            <section className="auth-form-panel" aria-labelledby="login-heading">
                <div className="auth-form-inner">
                    <div className="auth-rise-1">
                        <span className="auth-kicker">ElectroNova Account</span>
                        <h1 id="login-heading" className="auth-heading">Sign in</h1>
                        <p className="auth-subheading">
                            Access your orders, saved addresses, and warranty records.
                        </p>
                    </div>

                    {inlineError && (
                        <div
                            ref={errorRef}
                            role="alert"
                            tabIndex={-1}
                            className="auth-inline-error"
                        >
                            {inlineError}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} noValidate className="auth-rise-2">
                        <div className="auth-field">
                            <label htmlFor="auth-email" className="auth-label">
                                Email address
                            </label>
                            <input
                                ref={emailRef}
                                id="auth-email"
                                type="email"
                                name="email"
                                className="auth-input"
                                placeholder="you@example.com"
                                value={form.email}
                                onChange={handleChange}
                                aria-invalid={Boolean(inlineError && !form.email.trim())}
                                autoComplete="email"
                                required
                            />
                        </div>

                        <div className="auth-field">
                            <div className="auth-field-header">
                                <label htmlFor="auth-password" className="auth-label">
                                    Password
                                </label>
                                <Link to="/forgot-password" className="auth-forgot-link">
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="auth-input-wrap">
                                <input
                                    ref={passwordRef}
                                    id="auth-password"
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    className="auth-input auth-input--with-toggle"
                                    placeholder="Enter password"
                                    value={form.password}
                                    onChange={handleChange}
                                    aria-invalid={Boolean(inlineError && !form.password)}
                                    autoComplete="current-password"
                                    required
                                />
                                <button
                                    type="button"
                                    className="auth-password-toggle"
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={togglePasswordVisibility}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                    aria-pressed={showPassword}
                                >
                                    {showPassword ? <FiEyeOff size={17} /> : <FiEye size={17} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="auth-submit-btn"
                            disabled={loading}
                        >
                            {loading ? "Signing in…" : "Sign in"}
                        </button>
                    </form>

                    <div className="auth-demo-bar auth-rise-2">
                        <span className="auth-demo-label">Demo accounts</span>
                        <div className="auth-demo-actions">
                            <button
                                type="button"
                                className="auth-demo-btn"
                                onClick={() => fillDemo("customer@electronova.com", "customer123")}
                            >
                                Customer
                            </button>
                            <button
                                type="button"
                                className="auth-demo-btn"
                                onClick={() => fillDemo("seller@electronova.com", "seller123")}
                            >
                                Seller
                            </button>
                            <button
                                type="button"
                                className="auth-demo-btn"
                                onClick={() => fillDemo("admin@electronova.com", "admin123")}
                            >
                                Admin
                            </button>
                        </div>
                    </div>

                    <div className="auth-switch-row auth-rise-2">
                        <span>New to ElectroNova?</span>
                        <Link to={{ pathname: "/register", search: location.search }} state={location.state} className="auth-switch-link">
                            Create an account
                        </Link>
                    </div>
                </div>
            </section>

            <aside className="auth-photo-panel auth-photo-wipe" aria-label="Hardware detail">
                <img
                    src="/media/design/auth-hardware-detail.webp"
                    alt="Close-up of machined aluminum camera aperture dial and mechanical keyboard switches"
                    className="auth-photo-img"
                />
                <span className="auth-photo-caption">Anodized Dial &amp; Tactile Switches</span>
            </aside>
        </main>
    );
};

export default Login;
