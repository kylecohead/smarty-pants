/**
 * CONRAD
 * MODAL: About Game (from Home)
 * Close with ✕ in modal chrome
 *
 */
import { useNavigate } from "react-router-dom";
import aboutBackground from "../assets/about_background.jpg";

export default function AboutModal() {
  const navigate = useNavigate();

  const handleClose = () => {
    navigate("/");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-smart-black/60 p-4">
      <div className="relative w-full max-w-4xl max-h-[80vh] rounded-xl overflow-hidden shadow-2xl">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-xl flex items-center justify-center transition-colors duration-200 border-2 border-red-600 hover:border-red-700 shadow-lg"
          title="Close About"
        >
          ×
        </button>

        {/* Background Image */}
        <img
          src={aboutBackground}
          alt="About Smartie Pants Game"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
}
