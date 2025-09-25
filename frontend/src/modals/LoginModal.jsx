/**
 * WIKUS :)
 * MODAL: Login (from Home)
 * Buttons:
 *  - Save (normal user) -> /landing
 *  - Login as Admin -> /admin
 * Close (X) handled by Modal wrapper
 */
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function LoginModal({ mode = "login", onAuth }) {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();


  async function handleSubmit(e) {
    e.preventDefault();
    
    // const url = mode === "login" ? "/auth/login" : "/auth/signup";
    const API_URL = "http://localhost:3000";
    const url = mode === "login" ? `${API_URL}/auth/login` : `${API_URL}/auth/signup`;


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
        navigate("/landing"); // new users
      } else {
        if (data.role === "ADMIN") {
          navigate("/admin");
        } else {
          navigate("/landing");
        }
      }
    } else {
      alert(data.error || "Auth failed");
    }
  }

  return (
    <div className="space-y-5">
      <h2 className="text-2xl font-bold text-smart-dark-blue">
        {mode === "login" ? "Login" : "Signup"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-3">
        {mode === "signup" && (
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            required
            className="w-full rounded-lg border border-smart-light-blue px-3 py-2"
          />
        )}

        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={mode === "login" ? "Username or Email" : "Email"}
          type={mode === "login" ? "text" : "email"}
          required
          className="w-full rounded-lg border border-smart-light-blue px-3 py-2"
        />

        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="Password"
          required
          className="w-full rounded-lg border border-smart-light-blue px-3 py-2"
        />

        <button
          type="submit"
          className="w-full rounded-xl bg-smart-green px-4 py-2 font-button text-black hover:bg-smart-light-blue"
        >
          {mode === "login" ? "Login" : "Signup"}
        </button>
      </form>

    </div>
  );
}
