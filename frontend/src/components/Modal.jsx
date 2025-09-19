// Simple Tailwind modal overlay that keeps URL via nested routes.
// Has a close (X) button that navigates back.
import { useNavigate } from "react-router-dom";

export default function Modal({ children }) {
  const navigate = useNavigate();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <button
          aria-label="Close modal"
          className="absolute right-3 top-3 rounded-full border px-2 py-1 text-sm hover:bg-slate-100"
          onClick={() => navigate(-1)}
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}
