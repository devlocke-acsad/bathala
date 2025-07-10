import React from "react";

interface CombatantProps {
  name: string;
  health: number;
  maxHealth: number;
  isPlayer?: boolean;
}

const Combatant: React.FC<CombatantProps> = ({
  name,
  health,
  maxHealth,
  isPlayer,
}) => (
  <div className={`flex flex-col items-center ${isPlayer ? "" : "mt-8"}`}>
    <div
      className={`w-24 h-24 rounded-full ${
        isPlayer ? "bg-primary" : "bg-accent"
      } flex items-center justify-center text-3xl font-heading mb-2`}
    >
      {isPlayer ? "🧑‍🎤" : "👹"}
    </div>
    <div className="text-lg font-heading mb-1">{name}</div>
    <div className="w-32 h-4 bg-secondary rounded-full overflow-hidden mb-2">
      <div
        className="h-full bg-green-500 transition-all"
        style={{ width: `${(health / maxHealth) * 100}%` }}
      />
    </div>
    <div className="text-xs text-text">
      {health} / {maxHealth}
    </div>
  </div>
);

export default Combatant;
