import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Landing from "./pages/Landing.jsx";
import GameMenu from "./pages/GameMenu.jsx";
import CreateGame from "./pages/CreateGame.jsx";
import JoinGame from "./pages/JoinGame.jsx";
import JoinGameLobby from "./pages/JoinGameLobby.jsx";
import Lobby from "./pages/Lobby.jsx";
import PlayGame from "./pages/PlayGame.jsx";
import Admin from "./pages/Admin.jsx";
import QuestionTypes from "./pages/QuestionTypes.jsx";

import Modal from "./components/Modal.jsx";
import LoginModal from "./modals/LoginModal.jsx";
import AboutModal from "./modals/AboutModal.jsx";
import SettingsModal from "./modals/SettingsModal.jsx";
import PauseModal from "./modals/PauseModal.jsx";
import RoundModal from "./modals/RoundModal.jsx";

// App routes and nested modal structure.
// Notes:
// - Most modals use the shared <Modal> wrapper that includes a close button.
// - The recap between questions (under /game/play/pause) is a custom
//   container that intentionally has NO close button and matches the question card sizing.

export default function App() {
  return (
    <Routes>
      {/* 1) Home + modals */}
      <Route path="/" element={<Home />}>
        <Route
          path="login"
          element={
            <Modal>
              <LoginModal
                mode="login"
                onAuth={() => {
                  /* close modal, update state */
                }}
              />
            </Modal>
          }
        />
        <Route
          path="signup"
          element={
            <Modal>
              <LoginModal
                mode="signup"
                onAuth={() => {
                  /* close modal, update state */
                }}
              />
            </Modal>
          }
        />

        <Route
          path="about"
          element={
            <Modal>
              <AboutModal />
            </Modal>
          }
        />
      </Route>

      {/* 3) Landing + Settings modal (with tab routes) */}
      <Route path="/landing" element={<Landing />}>
        <Route
          path="settings"
          element={
            <Modal>
              <SettingsModal />
            </Modal>
          }
        />
        <Route
          path="settings/:tabId"
          element={
            <Modal>
              <SettingsModal />
            </Modal>
          }
        />
      </Route>

      {/* 4) Game menu */}
      <Route path="/game" element={<GameMenu />} />

      {/* 5) Create / 6) Join */}
      <Route path="/game/create" element={<CreateGame />} />
      <Route path="/game/join/:matchId" element={<JoinGame />} />
      <Route path="/join-lobby" element={<JoinGameLobby />} />

      {/* 6) Lobby + "Round number" modal */}
      <Route path="/lobby/:matchId" element={<Lobby />}>
         
        <Route
          path="round"
          element={
            <Modal>
              <RoundModal />
            </Modal>
          }
        />
      </Route>

      {/* 7) Play + Recap (uses custom non-dismissible overlay) */}
      <Route path="/game/play/:matchId" element={<PlayGame />}>
        <Route
          path="pause"
          element={
            // overlay so user can't peek the next question
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
              <div className="relative flex min-h-[28rem] w-full max-w-4xl items-center justify-center rounded-3xl border border-white/15 bg-slate-950/90 p-10 shadow-2xl backdrop-blur">
                {/* Intentionally no close button here */}
                <PauseModal />
              </div>
            </div>
          }
        />
      </Route>

      {/* Admin area */}
      <Route path="/admin" element={<Admin />} />
      <Route path="/admin/questions" element={<QuestionTypes />} />
    </Routes>
  );
}
