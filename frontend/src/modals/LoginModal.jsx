import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { login, signup } from "../utils/auth.js";

export default function LoginModal({ mode = "login", onAuth }) {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    try {
      let result;

      if (mode === "login") {
        result = await login(email, password);
      } else {
        result = await signup(username, email, password);
      }

      if (result.success) {
        onAuth?.(result);

        if (mode === "signup" || result.role !== "ADMIN") {
          navigate("/landing", { replace: true });
        } else {
          navigate("/admin", { replace: true });
        }
      } else {
        setError(result.error || "Authentication failed");
      }
    } catch (err) {
      console.error("Authentication error:", err);
      setError("Network error during authentication");
    }
  }

  return (
    <div className="max-w-md mx-auto rounded-2xl bg-smartie-light-blue p-8 border border-smart-light-blue">
      {/* Heading */}
      <h2 className="mb-6 text-center font-heading text-4xl text-white">
        {mode === "login" ? "LOGIN" : "SIGNUP"}
      </h2>

      {/* Error message */}
      {error && (
        <div className="mb-4 rounded-lg bg-red-600 px-4 py-2 text-white text-sm">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === "signup" && (
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            maxLength={20}

            required
            className="w-full rounded-lg bg-[#2d2d3a] px-4 py-2 text-smart-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-smart-light-blue"
          />
        )}

        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={mode === "login" ? "Username or Email" : "Email"}
          type={mode === "login" ? "text" : "email"}
          maxLength={20}
          required
          className="w-full rounded-lg bg-[#2d2d3a] px-4 py-2 text-smart-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-smart-light-blue"
        />

        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="Password"
          maxLength={20}
          required
          className="w-full rounded-lg bg-[#2d2d3a] px-4 py-2 text-smart-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-smart-green"
        />

        <button
          type="submit"
          className="w-full rounded-xl bg-smart-orange px-4 py-3 font-button text-black shadow-lg hover:bg-smart-yellow transition"
        >
          {mode === "login" ? "Login" : "Signup"}
        </button>
      </form>

      {/* Small footer */}
      <p className="mt-4 text-center text-sm text-gray-100 font-body">
        {mode === "login" ? (
          <>
            Don’t have an account?
            <button
              onClick={() => navigate("/signup")}
              className="text-smart-yellow hover:underline ml-1"
            >
              Sign up now!
            </button>
          </>
        ) : (
          <>
            Already have an account?
            <button
              onClick={() => navigate("/login")}
              className="text-smart-yellow hover:underline ml-1"
            >
              Log in instead!
            </button>
          </>
        )}
      </p>
    </div>
  );
}

