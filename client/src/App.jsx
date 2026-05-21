import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ChatPage from "./pages/ChatPage";
import VideoCall from "./components/VideoCall";

function App() {
  const { token } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/signup"
          element={token ? <Navigate to="/chat" /> : <SignupPage />}
        />

        <Route
          path="/login"
          element={token ? <Navigate to="/chat" /> : <LoginPage />}
        />

        <Route
          path="/chat"
          element={token ? <ChatPage /> : <Navigate to="/login" />}
        />

        <Route
          path="*"
          element={<Navigate to={token ? "/chat" : "/login"} />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;