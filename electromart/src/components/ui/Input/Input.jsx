import React from "react";
import "./Input.css";

const Input = ({
    label,
    error,
    id,
    type = "text",
    className = "",
    ...props
}) => {
    return (
        <div className={`ui-input-group ${className}`}>
            {label && (
                <label htmlFor={id} className="ui-input-label">
                    {label}
                </label>
            )}
            <input
                id={id}
                type={type}
                className="ui-input"
                {...props}
            />
            {error && <span className="ui-input-error-text">{error}</span>}
        </div>
    );
};

export default Input;
