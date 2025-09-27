/**
 * PAGE: Home
 * Demo of smart colors + fonts
 */
import { Link, Outlet,useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";


export default function Home() {

  //This handles the login login rendering (if user is logged in it shows sign out button)
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  //This is for when the user refreshes the page, it checks if there is a token in localStorage
  useEffect(() => {
    // check localStorage on mount
    const token = localStorage.getItem("accessToken");
    setIsLoggedIn(!!token);
  }, []);

  //Signs the user out by removing the tokens from localStorage and redirecting to home page
  function handleSignOut() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setIsLoggedIn(false);
    navigate("/"); // back to home
  }




  return (
    <div className="center-screen bg-smart-light-blue font-body text-smart-black">
      <div className="text-center space-y-6">
        {/* heading font */}
        <h1 className="text-5xl font-heading text-smart-dark-blue">
          SMARTIE PANTS
        </h1>

        {/* buttons with button font + smart colors */}
        <div className="flex flex-col items-center gap-3">
          {isLoggedIn ? (
            // Show Sign Out if logged in
            <button
              onClick={handleSignOut}
              className="rounded-xl border border-smart-black bg-red-500 px-6 py-3 font-button text-white hover:bg-red-600"
            >
              Sign Out
            </button>
          ) : (
            // Show Login + Sign Up if not logged in
            <>
              <Link
                to="/login"
                className="rounded-xl border border-smart-black bg-smart-yellow px-6 py-3 font-button text-smart-black hover:bg-smart-orange"
              >
                Login
              </Link>

              <Link
                to="/signup"
                className="rounded-xl border border-smart-black bg-smart-yellow px-6 py-3 font-button text-smart-black hover:bg-smart-orange"
              >
                Sign Up
              </Link>
            </>
          )}

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
