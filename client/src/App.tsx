import React from "react";
import { Toaster } from "react-hot-toast";
import { Outlet, useLocation } from "react-router-dom";

import "./App.css";
import { Nav } from "./components/ui/Nav";
import { useTheme } from "./hooks/useTheme";

function App() {
  const { isDark } = useTheme();
  const location = useLocation();

  const handleConfigChange = () => {
    if (location.pathname === "/" && (window as any).handleConfigChange) {
      (window as any).handleConfigChange();
    }
  };

  return (
    <div id="app" className="App h-auto dark:bg-[#2b2b2b]">
      <Nav onConfigChange={handleConfigChange} />
      <Outlet />
      <Toaster
        position="bottom-center"
        reverseOrder={false}
        toastOptions={{
          style: {
            background: isDark ? "rgb(64 64 64)" : "#ffffff",
            color: isDark ? "#f9fafb" : "#111827",
          },
        }}
      />
    </div>
  );
}

export default App;
