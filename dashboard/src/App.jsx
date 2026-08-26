import { useState } from "react";
import AuthScreen from "./components/AuthScreen";
import Dashboard from "./pages/Dashboard";

function App() {
  const [token, setToken] = useState(localStorage.getItem("pb_token"));
  const [email, setEmail] = useState(localStorage.getItem("pb_email"));

  function handleAuth(newToken, newEmail) {
    setToken(newToken);
    setEmail(newEmail);
  }

  function handleLogout() {
    localStorage.removeItem("pb_token");
    localStorage.removeItem("pb_email");
    setToken(null);
    setEmail(null);
  }

  return token
    ? <Dashboard email={email} onLogout={handleLogout} />
    : <AuthScreen onAuth={handleAuth} />;
}

export default App;