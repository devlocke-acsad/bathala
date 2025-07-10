import React from "react";

const TitleScreen: React.FC<{ onPlay: () => void }> = ({ onPlay }) => {
  return (
    <div className="min-h-screen flex flex-col bg-background text-text">
      <div className="flex justify-end p-6">
        <div className="profile-placeholder">P</div>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center">
        <h1 className="text-9xl font-heading mb-8 tracking-tight drop-shadow-lg">
          BATHALA
        </h1>
        <div className="flex flex-row gap-4 w-full max-w-xs font-body uppercase">
          <button className="button w-full" onClick={onPlay}>
            Play
          </button>
          <button className="button w-full">Options</button>
          <button className="button w-full">Journal</button>
        </div>
      </div>
    </div>
  );
};

export default TitleScreen;
