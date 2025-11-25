import React, { useEffect, useState } from "react";
import Auth from "./pages/Auth";
import Chat from "./pages/Chat";

const TOKEN_KEY = "token";

const App: React.FC = () => {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const t = localStorage.getItem(TOKEN_KEY);
    if (t) setToken(t);
  }, []);

  const handleLogin = (t: string) => {
    localStorage.setItem(TOKEN_KEY, t);
    setToken(t);
  };

  const handleLogout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
  };

  return (
    <div className="h-screen">
      {!token ? (
        <Auth onAuth={handleLogin} />
      ) : (
        <Chat token={token} onLogout={handleLogout} />
      )}
    </div>
  );
};

export default App;
