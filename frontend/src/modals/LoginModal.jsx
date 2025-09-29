import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function LoginModal({ mode = "login", onAuth }) {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    // const API_URL = "http://localhost:3000";
    const API_URL = "/api";

    const url =
      mode === "login"
        ? `${API_URL}/api/auth/login`
        : `${API_URL}/api/auth/signup`;

    const body =
      mode === "signup"
        ? { username, email, password }
        : { identifier: email, password };

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (data.accessToken) {
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      onAuth?.(data);

      if (mode === "signup") {
        navigate("/landing", { replace: true }); // new users
      } else {
        if (data.role === "ADMIN") {
          navigate("/admin", { replace: true }); // admins
        } else {
          navigate("/landing", { replace: true }); // normal users
        }
      }
    } else {
      alert(data.error || "Auth failed");
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

        <button
          type="submit"
          className="w-full rounded-xl bg-smart-green px-4 py-3 font-button text-black shadow-lg hover:bg-smart-light-blue transition"
        >
          {mode === "login" ? "Login" : "Signup"}
        </button>
      </form>

      {/* Small footer */}
      <p className="mt-4 text-center text-sm text-gray-300 font-body">
        {mode === "login"
          ? "Don’t have an account? Sign up now!"
          : "Already have an account? Log in instead!"}
      </p>
    </div>
  );
}
