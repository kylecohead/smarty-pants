/**
 * CONRAD
 * PAGE: Admin
 * Buttons:
 *  - Edit Question Type -> /admin/questions
 *  - Logout (top-right) -> Home "/"
 * Back: to previous (e.g., from login or wherever you came from)
 */
import { Link, useNavigate } from "react-router-dom";

export default function Admin() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen relative flex items-center justify-center">
      <button
        onClick={() => navigate(-1)}
        className="absolute left-4 top-4 rounded-lg border px-4 py-2 hover:bg-slate-100"
      >
        ← Back
      </button>

      <button
        onClick={() => navigate("/")}
        className="absolute right-4 top-4 rounded-lg border px-4 py-2 hover:bg-slate-100"
      >
        Logout
      </button>

      <div className="text-center space-y-6">
        <h1 className="text-3xl font-bold">Admin Page</h1>
        <Link
          to="/admin/questions"
          className="rounded-xl border px-6 py-3 hover:bg-slate-100"
        >
          Edit Question Type
        </Link>
      </div>
    </div>
  );
}
