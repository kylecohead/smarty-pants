/**
 * WIKUS
 * MODAL: Login (from Home)
 * Buttons:
 *  - Save (normal user) -> /landing
 *  - Login as Admin -> /admin
 * Close (X) handled by Modal wrapper
 */
import { useNavigate } from "react-router-dom";

export default function LoginModal() {
  const navigate = useNavigate();
  return (
    <div className="space-y-5">
      <h2 className="text-xl font-semibold">Login</h2>

      <div className="space-y-2">
        <input
          placeholder="Username or Email"
          className="w-full rounded-lg border px-3 py-2"
        />
        <input
          placeholder="Password"
          type="password"
          className="w-full rounded-lg border px-3 py-2"
        />
      </div>

      <div className="grid grid-cols-1 gap-2">
        <button
          onClick={() => navigate("/landing")}
          className="w-full rounded-xl border px-4 py-2 hover:bg-slate-100"
        >
          Save
        </button>
        <button
          onClick={() => navigate("/admin")}
          className="w-full rounded-xl border px-4 py-2 hover:bg-slate-100"
        >
          Login as Admin
        </button>
      </div>
    </div>
  );
}
