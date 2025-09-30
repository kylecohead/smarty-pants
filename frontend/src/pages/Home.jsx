/**
 * PAGE: Home
 * Demo of smart colors + fonts
 */
import { Link, Outlet,useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import backgroundImg from "../assets/home-background.jpg";

export default function Home() {

  //This handles the login login rendering (if user is logged in it shows sign out button)
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  

  //This is for when the user refreshes the page, it checks if there is a token in localStorage
  useEffect(() => {
    // check localStorage on mount
    const token = localStorage.getItem("accessToken");
    setIsLoggedIn(!!token);

    //Get the actual user data if logged in
    if (token) {
    fetch("/api/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setUser(data.user))
      .catch(() => setUser(null));
  }
  }, []);

  //Signs the user out by removing the tokens from localStorage and redirecting to home page
  function handleSignOut() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setIsLoggedIn(false);
    navigate("/"); // back to home
  }




  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat font-body text-smart-black relative"
      style={{
        backgroundImage: `url(${backgroundImg})`,
      }}
    >
      {/* Optional overlay for better text readability */}
      <div className="absolute inset-0 bg-black/30"></div>

      <div className="relative z-10 min-h-screen flex items-center justify-end px-8 lg:px-16">
        <div className="text-right space-y-8 max-w-md">
          {/* heading font - SMARTIE on one line, PANTS on another, right-aligned and colorful */}
          <div className="text-right">
            <h1 className="text-6xl lg:text-7xl font-heading font-black leading-tight drop-shadow-2xl">
              <span className="text-smart-green">S</span>
              <span className="text-smart-orange">M</span>
              <span className="text-smart-light-blue">A</span>
              <span className="text-smart-light-pink">R</span>
              <span className="text-smart-green">T</span>
              <span className="text-smart-red">I</span>
              <span className="text-smart-purple">E</span>
            </h1>
            <h1 className="text-6xl lg:text-7xl font-heading font-black leading-tight drop-shadow-2xl">
              <span className="text-smart-light-blue">P</span>
              <span className="text-smart-yellow">A</span>
              <span className="text-smart-green">N</span>
              <span className="text-smart-pink">T</span>
              <span className="text-smart-dark-blue">S</span>
            </h1>
          </div>

          {/* buttons with button font + smart colors - much bigger and right-aligned */}
          <div className="flex flex-col items-end gap-4">
            {isLoggedIn ? (
              // Show Sign Out if logged in
              <>
              <button
                onClick={handleSignOut}
                className="rounded-2xl border-4 border-smart-white bg-smart-yellow px-12 py-4 font-button text-2xl font-bold text-smart-black hover:bg-smart-orange hover:scale-105 transition-all duration-200 shadow-2xl min-w-[200px] text-center"
              >
                Sign Out
              </button>
              <Link
                to="/landing"
                className="rounded-2xl border-4 border-smart-white bg-smart-yellow px-12 py-4 font-button text-2xl font-bold text-smart-black hover:bg-smart-orange hover:scale-105 transition-all duration-200 shadow-2xl min-w-[200px] text-center"              >
                Continue
              </Link>
              <Link
                to="/about"
                className="rounded-2xl border-4 border-smart-white bg-smart-green px-12 py-4 font-button text-2xl font-bold text-smart-white hover:bg-smart-purple hover:scale-105 transition-all duration-200 shadow-2xl min-w-[200px] text-center"
              >
                ABOUT GAME
              </Link>
              </>
              
            ) : (
              <>
              <Link
                to="/login"
                className="rounded-2xl border-4 border-smart-white bg-smart-yellow px-12 py-4 font-button text-2xl font-bold text-smart-black hover:bg-smart-orange hover:scale-105 transition-all duration-200 shadow-2xl min-w-[200px] text-center"              >
                Login
              </Link>

              <Link
                to="/signup"
                className="rounded-2xl border-4 border-smart-white bg-smart-yellow px-12 py-4 font-button text-2xl font-bold text-smart-black hover:bg-smart-orange hover:scale-105 transition-all duration-200 shadow-2xl min-w-[200px] text-center"
              >
                Sign Up
              </Link>
              <Link
                to="/about"
                className="rounded-2xl border-4 border-smart-white bg-smart-green px-12 py-4 font-button text-2xl font-bold text-smart-white hover:bg-smart-purple hover:scale-105 transition-all duration-200 shadow-2xl min-w-[200px] text-center"
              >
                ABOUT GAME
              </Link>
            </>
          )}
        
          </div>
        </div>
      </div>
      {/* route-based modal outlet */}
      <Outlet />
    </div>
  );
}
