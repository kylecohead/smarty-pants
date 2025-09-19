import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Landing from "./pages/Landing.jsx";
import GameMenu from "./pages/GameMenu.jsx";
import CreateGame from "./pages/CreateGame.jsx";
import JoinGame from "./pages/JoinGame.jsx";
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

export default function App() {
  return (
    <Routes>
      {/* 1) Home + modals */}
      <Route path="/" element={<Home />}>
        <Route
          path="login"
          element={
            <Modal>
              <LoginModal />
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
      <Route path="/game/join" element={<JoinGame />} />

      {/* 6) Lobby + "Round number" modal */}
      <Route path="/lobby" element={<Lobby />}>
        <Route
          path="round"
          element={
            <Modal>
              <RoundModal />
            </Modal>
          }
        />
      </Route>

      {/* 7) Play + Pause modal */}
      <Route path="/game/play" element={<PlayGame />}>
        <Route
          path="pause"
          element={
            <Modal>
              <PauseModal />
            </Modal>
          }
        />
      </Route>

      {/* Admin area */}
      <Route path="/admin" element={<Admin />} />
      <Route path="/admin/questions" element={<QuestionTypes />} />
    </Routes>
  );
}