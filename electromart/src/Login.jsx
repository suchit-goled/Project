import React, { useState } from "react";
import axios from "axios";
import { Navigate, useNavigate} from "react-router-dom";

function Login() {

  const [type, setType] = useState("user");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

    const navigate = useNavigate();
  const handleLogin = async () => {

    try {

      const res = await axios.post(
        "http://localhost:8000/login",
        {
          username,
          password
        }
      );

      console.log(res.data);

      if (!res.data.success) {

        alert("Invalid credentials");
        return;

      }

      // ADMIN VALIDATION
      if (
        type === "admin" &&
        res.data.role !== "admin"
      ) {

        alert("Not admin account");
        return;

      }

      localStorage.setItem(
        "userId",
        res.data.userId
      );

      localStorage.setItem(
        "username",
        res.data.username
      );

      localStorage.setItem(
        "role",
        res.data.role
      );

      // REDIRECT
      if (res.data.role === "admin") {

        window.location.href = "/admin";

      } else {

        window.location.href = "/";

      }

    } catch (err) {

      console.log(err);

    }

  };

  return (

    <div className="login-container">

      <div className="login-card">

        <h2>Login</h2>

        {/* LOGIN TYPE */}
        <div className="login-type">

          <button
            type="button"
            className={
              type === "user"
                ? "active-btn"
                : ""
            }
            onClick={() => setType("user")}
          >
            👤 User Login
          </button>

          <button
            type="button"
            className={
              type === "admin"
                ? "active-btn"
                : ""
            }
            onClick={() => setType("admin")}
          >
            🛠 Admin Login
          </button>

        </div>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) =>
            setUsername(e.target.value)
          }
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
        />

        <button
          className="login-btn-main"
          onClick={handleLogin}
        >
          Login
        </button>
        <p
          className="signup-text"
          onClick={() => navigate("/signup")}
        >
          Don't have an account?
          <span> Signup</span>
        </p>
      </div>

    </div>

  );

}

export default Login;