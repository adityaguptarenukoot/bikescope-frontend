import { useState } from "react";
import PredictionForm from "./components/PredictionForm";
import "./App.css";

function App() {
  const [theme, setTheme] = useState("dark");

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <div className={`app-wrapper ${theme}`}>
      <header className="app-header">
        <div className="header-left">
          <span className="logo-icon">🚲</span>
          <span className="logo-text">BikeScope AI</span>
        </div>
        <button className="theme-toggle" onClick={toggleTheme}>
          {theme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode"}
        </button>
      </header>
      <main>
        <PredictionForm />
      </main>
    </div>
  );
}

export default App;