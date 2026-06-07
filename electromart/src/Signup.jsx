import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Signup() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleSignup = async () => {
        const res = await axios.post("http://localhost:8000/signup", {
            username,
            password
        });

        alert(res.data);

        if (res.data === "Signup successful") {
            navigate("/login");
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">

                <h2>Signup</h2>

                <input
                    placeholder="Username"
                    onChange={(e) => setUsername(e.target.value)}
                />

                <input
                    type="password"
                    placeholder="Password"
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button onClick={handleSignup}>Signup</button>

            </div>
        </div>
    );
}

export default Signup;