import React, { useState } from "react";
import TitleScreen from "./components/TitleScreen";
import "./styles/game.css";
import "./index.css";

const App: React.FC = () => {
  const [screen, setScreen] = useState<"title" | "game">("title");

  return (
    <div className="min-h-screen">
      {screen === "title" && <TitleScreen onPlay={() => setScreen("game")} />}
      {screen === "game" && (
        <div className="flex items-center justify-center h-screen">
          {/* Game content goes here */}
          <h2 className="text-3xl font-heading">Game Screen (WIP)</h2>
        </div>
      )}
    </div>
  );
};

export default App;
