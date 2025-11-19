"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import API from "../../../utils/axiosInstance";
import "./login.css";

// ✅ MUI Icons
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // ✅ Form Validation
  const validateForm = () => {
    if (!email || !password) {
      toast.error("All fields are required!");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Invalid email format!");
      return false;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters!");
      return false;
    }
    return true;
  };

  // ✅ Login Handler
  const loginHandler = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    console.clear();
    console.log("🚀 [LOGIN START]");
    console.log("📧", email, "🔑", password);

    try {
      const { data } = await API.post("/login", { email, password });

      localStorage.setItem("user", JSON.stringify(data.user));
      toast.success("✅ Logged in successfully!");
      router.push("/");
    } catch (error) {
      console.error("❌ Login Error:", error);
      toast.error(error.response?.data?.message || "Login failed!");
    } finally {
      setLoading(false);
      console.log("🔚 [LOGIN END]");
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={loginHandler}>
        <h2>Login</h2>

        {/* Email */}
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          placeholder="Enter your email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* Password */}
        <label htmlFor="password">Password</label>
        <div className="password-wrapper">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="password-toggle"
            aria-label="Toggle password visibility"
          >
            {showPassword ? (
              <VisibilityOffIcon fontSize="small" />
            ) : (
              <VisibilityIcon fontSize="small" />
            )}
          </button>
        </div>

        {/* Submit */}
        <button type="submit" disabled={loading} className="login-btn">
          {loading ? <span className="spinner"></span> : "Login"}
        </button>

        {/* Forgot Password */}
        <p
          className="forgot-password"
          onClick={() => router.push("/password/forgot")}
        >
          Forgot Password?
        </p>
      </form>
    </div>
  );
}

export default Login;
