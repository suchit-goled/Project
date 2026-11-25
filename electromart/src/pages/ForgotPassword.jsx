import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import "./Login.css";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [inlineError, setInlineError] = useState("");

    const emailRef = useRef(null);
    const errorRef = useRef(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setInlineError("");

        if (!email.trim()) {
            setInlineError("Enter your registered email address.");
            requestAnimationFrame(() => emailRef.current?.focus());
            return;
        }

        try {
            setLoading(true);
            await api.post("/password/forgot-password", {
                email: email.trim()
            });
            setSubmitted(true);
        } catch (error) {
            const msg = error.response?.data?.message || "Unable to send reset link. Verify your email address and try again.";
            setInlineError(msg);
            requestAnimationFrame(() => errorRef.current?.focus());
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="auth-spread">
            <section className="auth-form-panel" aria-labelledby="forgot-heading">
                <div className="auth-form-inner">
                    <div className="auth-rise-1">
                        <span className="auth-kicker">Password Recovery</span>
                        <h1 id="forgot-heading" className="auth-heading">Reset your password</h1>
                        <p className="auth-subheading">
                            {submitted
                                ? "Check your inbox for a password reset link."
                                : "Enter the email address linked to your account and we will send a reset link."}
                        </p>
                    </div>

                    {inlineError && (
                        <div ref={errorRef} role="alert" tabIndex={-1} className="auth-inline-error">
                            {inlineError}
                        </div>
                    )}

                    {submitted ? (
                        <div className="auth-rise-2">
                            <div className="auth-inline-success" role="status">
                                A reset link has been sent to <strong>{email}</strong> if an account exists with that address.
                            </div>
                            <Link to="/login" className="auth-submit-btn">
                                Return to sign in
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} noValidate className="auth-rise-2">
                            <div className="auth-field">
                                <label htmlFor="forgot-email" className="auth-label">
                                    Email address
                                </label>
                                <input
                                    ref={emailRef}
                                    id="forgot-email"
                                    type="email"
                                    name="email"
                                    className="auth-input"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => {
                                        if (inlineError) setInlineError("");
                                        setEmail(e.target.value);
                                    }}
                                    autoComplete="email"
                                    required
                                />
                            </div>

                            <button type="submit" className="auth-submit-btn" disabled={loading}>
                                {loading ? "Sending link…" : "Send reset link"}
                            </button>
                        </form>
                    )}

                    <div className="auth-switch-row auth-rise-2">
                        <span>Remembered your password?</span>
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

export default ForgotPassword;
