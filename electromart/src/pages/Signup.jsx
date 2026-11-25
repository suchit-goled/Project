import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
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

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [inlineError, setInlineError] = useState("");

    const nameRef = useRef(null);
    const emailRef = useRef(null);
    const passwordRef = useRef(null);
    const confirmRef = useRef(null);
    const errorRef = useRef(null);

    const handleChange = (e) => {
        if (inlineError) setInlineError("");
        setForm((prev) => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const togglePassword = () => {
        setShowPassword((prev) => !prev);
        requestAnimationFrame(() => passwordRef.current?.focus());
    };

    const toggleConfirmPassword = () => {
        setShowConfirmPassword((prev) => !prev);
        requestAnimationFrame(() => confirmRef.current?.focus());
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setInlineError("");

        if (!form.name.trim()) {
            setInlineError("Enter your full name.");
            requestAnimationFrame(() => nameRef.current?.focus());
            return;
        }
        if (!form.email.trim()) {
            setInlineError("Enter a valid email address.");
            requestAnimationFrame(() => emailRef.current?.focus());
            return;
        }
        if (form.password.length < 6) {
            setInlineError("Password must be at least 6 characters.");
            requestAnimationFrame(() => passwordRef.current?.focus());
            return;
        }
        if (form.password !== form.confirmPassword) {
            setInlineError("Passwords do not match.");
            requestAnimationFrame(() => confirmRef.current?.focus());
            return;
        }

        try {
            await signup({
                name: form.name.trim(),
                email: form.email.trim(),
                password: form.password
            });
            toast.success("Account created. Welcome to ElectroNova.");
            navigate("/");
        } catch (error) {
            const msg = error.response?.data?.message || "Could not create account. Please try again.";
            setInlineError(msg);
            requestAnimationFrame(() => errorRef.current?.focus());
        }
    };

    return (
        <main className="auth-spread">
            <section className="auth-form-panel" aria-labelledby="signup-heading">
                <div className="auth-form-inner">
                    <div className="auth-rise-1">
                        <span className="auth-kicker">ElectroNova Account</span>
                        <h1 id="signup-heading" className="auth-heading">Create account</h1>
                        <p className="auth-subheading">
                            Register for order tracking, saved addresses, and warranty support.
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
                            <label htmlFor="signup-name" className="auth-label">Full name</label>
                            <input
                                ref={nameRef}
                                id="signup-name"
                                type="text"
                                name="name"
                                className="auth-input"
                                placeholder="Aarav Mehta"
                                value={form.name}
                                onChange={handleChange}
                                autoComplete="name"
                                required
                            />
                        </div>

                        <div className="auth-field">
                            <label htmlFor="signup-email" className="auth-label">Email address</label>
                            <input
                                ref={emailRef}
                                id="signup-email"
                                type="email"
                                name="email"
                                className="auth-input"
                                placeholder="you@example.com"
                                value={form.email}
                                onChange={handleChange}
                                autoComplete="email"
                                required
                            />
                        </div>

                        <div className="auth-field">
                            <label htmlFor="signup-password" className="auth-label">Password</label>
                            <div className="auth-input-wrap">
                                <input
                                    ref={passwordRef}
                                    id="signup-password"
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    className="auth-input auth-input--with-toggle"
                                    placeholder="At least 6 characters"
                                    value={form.password}
                                    onChange={handleChange}
                                    autoComplete="new-password"
                                    required
                                />
                                <button
                                    type="button"
                                    className="auth-password-toggle"
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={togglePassword}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                    aria-pressed={showPassword}
                                >
                                    {showPassword ? <FiEyeOff size={17} /> : <FiEye size={17} />}
                                </button>
                            </div>
                        </div>

                        <div className="auth-field">
                            <label htmlFor="signup-confirm" className="auth-label">Confirm password</label>
                            <div className="auth-input-wrap">
                                <input
                                    ref={confirmRef}
                                    id="signup-confirm"
                                    type={showConfirmPassword ? "text" : "password"}
                                    name="confirmPassword"
                                    className="auth-input auth-input--with-toggle"
                                    placeholder="Re-enter password"
                                    value={form.confirmPassword}
                                    onChange={handleChange}
                                    autoComplete="new-password"
                                    required
                                />
                                <button
                                    type="button"
                                    className="auth-password-toggle"
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={toggleConfirmPassword}
                                    aria-label={showConfirmPassword ? "Hide password confirmation" : "Show password confirmation"}
                                    aria-pressed={showConfirmPassword}
                                >
                                    {showConfirmPassword ? <FiEyeOff size={17} /> : <FiEye size={17} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="auth-submit-btn"
                            disabled={loading}
                        >
                            {loading ? "Creating account…" : "Create account"}
                        </button>
                    </form>

                    <div className="auth-switch-row auth-rise-2">
                        <span>Already have an account?</span>
                        <Link to="/login" className="auth-switch-link">
                            Sign in
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

export default Signup;
