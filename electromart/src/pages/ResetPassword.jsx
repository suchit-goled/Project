import React, { useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import api from "../api/axios";
import toast from "react-hot-toast";
import "./Login.css";

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();

    const [passwords, setPasswords] = useState({
        newPassword: "",
        confirmPassword: ""
    });

    const [showPass, setShowPass] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [inlineError, setInlineError] = useState("");

    const newPassRef = useRef(null);
    const confirmRef = useRef(null);
    const errorRef = useRef(null);

    const handleChange = (e) => {
        if (inlineError) setInlineError("");
        setPasswords((prev) => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const toggleNewPass = () => {
        setShowPass((prev) => !prev);
        requestAnimationFrame(() => newPassRef.current?.focus());
    };

    const toggleConfirmPass = () => {
        setShowConfirm((prev) => !prev);
        requestAnimationFrame(() => confirmRef.current?.focus());
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setInlineError("");

        if (passwords.newPassword.length < 6) {
            setInlineError("New password must be at least 6 characters.");
            requestAnimationFrame(() => newPassRef.current?.focus());
            return;
        }
        if (passwords.newPassword !== passwords.confirmPassword) {
            setInlineError("Passwords do not match.");
            requestAnimationFrame(() => confirmRef.current?.focus());
            return;
        }

        try {
            setLoading(true);
            await api.post(`/password/reset-password/${token}`, {
                token,
                newPassword: passwords.newPassword
            });
            toast.success("Password updated. You can now sign in.");
            navigate("/login");
        } catch (error) {
            const msg = error.response?.data?.message || "This reset link is invalid or has expired.";
            setInlineError(msg);
            requestAnimationFrame(() => errorRef.current?.focus());
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="auth-spread">
            <section className="auth-form-panel" aria-labelledby="reset-heading">
                <div className="auth-form-inner">
                    <div className="auth-rise-1">
                        <span className="auth-kicker">Password Recovery</span>
                        <h1 id="reset-heading" className="auth-heading">Choose a new password</h1>
                        <p className="auth-subheading">
                            Enter a new password of at least 6 characters for your account.
                        </p>
                    </div>

                    {inlineError && (
                        <div ref={errorRef} role="alert" tabIndex={-1} className="auth-inline-error">
                            {inlineError}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} noValidate className="auth-rise-2">
                        <div className="auth-field">
                            <label htmlFor="reset-password" className="auth-label">New password</label>
                            <div className="auth-input-wrap">
                                <input
                                    ref={newPassRef}
                                    id="reset-password"
                                    type={showPass ? "text" : "password"}
                                    name="newPassword"
                                    className="auth-input auth-input--with-toggle"
                                    placeholder="At least 6 characters"
                                    value={passwords.newPassword}
                                    onChange={handleChange}
                                    autoComplete="new-password"
                                    required
                                />
                                <button
                                    type="button"
                                    className="auth-password-toggle"
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={toggleNewPass}
                                    aria-label={showPass ? "Hide new password" : "Show new password"}
                                    aria-pressed={showPass}
                                >
                                    {showPass ? <FiEyeOff size={17} /> : <FiEye size={17} />}
                                </button>
                            </div>
                        </div>

                        <div className="auth-field">
                            <label htmlFor="reset-confirm" className="auth-label">Confirm new password</label>
                            <div className="auth-input-wrap">
                                <input
                                    ref={confirmRef}
                                    id="reset-confirm"
                                    type={showConfirm ? "text" : "password"}
                                    name="confirmPassword"
                                    className="auth-input auth-input--with-toggle"
                                    placeholder="Re-enter password"
                                    value={passwords.confirmPassword}
                                    onChange={handleChange}
                                    autoComplete="new-password"
                                    required
                                />
                                <button
                                    type="button"
                                    className="auth-password-toggle"
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={toggleConfirmPass}
                                    aria-label={showConfirm ? "Hide confirmation password" : "Show confirmation password"}
                                    aria-pressed={showConfirm}
                                >
                                    {showConfirm ? <FiEyeOff size={17} /> : <FiEye size={17} />}
                                </button>
                            </div>
                        </div>

                        <button type="submit" className="auth-submit-btn" disabled={loading}>
                            {loading ? "Updating password…" : "Update password"}
                        </button>
                    </form>

                    <div className="auth-switch-row auth-rise-2">
                        <span>Back to</span>
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

export default ResetPassword;
