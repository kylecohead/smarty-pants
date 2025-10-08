import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { login, signup } from "../utils/auth.js";

export default function LoginModal({ mode = "login", onAuth }) {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      let data;
      
      console.log(`${mode} attempt with:`, { email, password: '***', rememberMe });
      
      if (mode === "login") {
        data = await login(email, password, rememberMe);
      } else {
        data = await signup(username, email, password);
      }

      console.log(`${mode} response:`, data);

      if (data && data.success) {
        onAuth?.(data);

        if (mode === "signup") {
          navigate("/landing", { replace: true }); // new users
        } else {
          if (data.user && data.user.role === "ADMIN") {
            navigate("/admin", { replace: true }); // admins
          } else {
            navigate("/landing", { replace: true }); // normal users
          }
        }
      } else {
        const errorMessage = data?.error || "Authentication failed";
        console.error(`${mode} failed:`, errorMessage);
        alert(errorMessage);
      }
    } catch (error) {
      console.error("Authentication error:", error);
      alert(`Authentication failed: ${error.message}`);
    }
  }

  return (
    <div className="max-w-md mx-auto rounded-2xl bg-[#0c1b2a] p-6 shadow-lg border border-smart-light-blue">
      {/* Heading */}
      <h2 className="mb-6 text-center font-heading text-3xl text-smart-orange drop-shadow-[0_0_10px_#FF6700]">
        {mode === "login" ? "Login" : "Signup"}
      </h2>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === "signup" && (
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            required
            className="w-full rounded-lg bg-[#2d2d3a] px-4 py-2 text-smart-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-smart-pink"
          />
        )}

        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={mode === "login" ? "Username or Email" : "Email"}
          type={mode === "login" ? "text" : "email"}
          required
          className="w-full rounded-lg bg-[#2d2d3a] px-4 py-2 text-smart-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-smart-light-blue"
        />

        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="Password"
          required
          className="w-full rounded-lg bg-[#2d2d3a] px-4 py-2 text-smart-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-smart-green"
        />

        {mode === "login" && (
          <div className="flex items-center space-x-3">
            <input
              id="rememberMe"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 text-smart-green bg-[#2d2d3a] border-2 border-smart-light-blue rounded focus:ring-smart-green focus:ring-2 accent-smart-green"
            />
            <label htmlFor="rememberMe" className="text-sm font-body text-smart-white cursor-pointer">
              Remember me for 30 days
            </label>
          </div>
        )}

        <button
          type="submit"
          className="w-full rounded-xl bg-smart-green px-4 py-3 font-button text-black shadow-lg hover:bg-smart-light-blue transition"
        >
          {mode === "login" ? "Login" : "Signup"}
        </button>
      </form>

      {/* Navigation between login/signup */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-300 font-body mb-3">
          {mode === "login"
            ? "Don't have an account?"
            : "Already have an account?"}
        </p>
        {mode === "login" ? (
          <button
            type="button"
            onClick={() => navigate("/signup")}
            className="w-full rounded-xl bg-smart-purple px-4 py-3 font-button text-white shadow-lg hover:bg-smart-pink transition"
          >
            Create New Account
          </button>
        ) : (
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="w-full rounded-xl bg-smart-light-blue px-4 py-3 font-button text-black shadow-lg hover:bg-smart-green transition"
          >
            Sign In to Existing Account
          </button>
        )}
      </div>
    </div>
  );
}
