/**
 * PAGE: Home
 * Demo of smart colors + fonts
 */
import { Link, Outlet } from "react-router-dom";

export default function Home() {
  return (
    <div className="center-screen bg-smart-light-blue font-body text-smart-black">
      <div className="text-center space-y-6">
        {/* heading font */}
        <h1 className="text-5xl font-heading text-smart-dark-blue">
          SMARTIE PANTS
        </h1>

        {/* buttons with button font + smart colors */}
        <div className="flex flex-col items-center gap-3">
          <Link
            to="/login"
            className="rounded-xl border border-smart-black bg-smart-yellow px-6 py-3 font-button text-smart-black hover:bg-smart-orange"
          >
            Login
          </Link>
          <Link
            to="/about"
            className="rounded-xl border border-smart-black bg-smart-green px-6 py-3 font-button text-smart-white hover:bg-smart-purple"
          >
            About Game
          </Link>
        </div>
      </div>
      {/* route-based modal outlet */}
      <Outlet />
    </div>
  );
}
