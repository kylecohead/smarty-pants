// Simple Tailwind modal overlay that keeps URL via nested routes.
// Has a close (X) button that navigates back.
import { useNavigate, useLocation } from "react-router-dom";

export default function Modal({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Make the modal wider only on /landing/settings/*
  const isSettings = location.pathname.startsWith("/landing/settings");
  const modalWidth = isSettings ? "max-w-3xl" : "max-w-md";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        className={`relative w-full ${modalWidth} rounded-2xl bg-smart-login-bg p-6 shadow-xl`}
      >
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
