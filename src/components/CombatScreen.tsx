import React, { useState } from "react";
import Combatant from "./Combatant";
import PlayerHand from "./PlayerHand";
import type { Card } from "./CardComponent";

interface CombatScreenProps {
  player: { name: string; health: number; maxHealth: number };
  enemy: { name: string; health: number; maxHealth: number };
  hand: Card[];
  selected: string[];
  discardsLeft: number;
  onSelectCard: (id: string) => void;
  onPlay: () => void;
  onDiscard: () => void;
  onSort: (type: "rank" | "suit") => void;
}

const CombatScreen: React.FC<CombatScreenProps> = ({
  player,
  enemy,
  hand,
  selected,
  discardsLeft,
  onSelectCard,
  onPlay,
  onDiscard,
  onSort,
}) => {
  return (
    <div className="flex flex-row w-full h-screen bg-background text-text">
      {/* Player Side */}
      <div className="flex flex-col items-center justify-center w-1/4 h-full">
        <Combatant
          name={player.name}
          health={player.health}
          maxHealth={player.maxHealth}
          isPlayer
        />
      </div>
      {/* Center Area */}
      <div className="flex flex-col items-center justify-end w-2/4 h-full pb-8">
        <div className="mb-2 text-lg font-heading">Your Hand</div>
        <PlayerHand hand={hand} selected={selected} onSelect={onSelectCard} />
        <div className="flex flex-row gap-2 mt-2">
          <button className="button" onClick={onPlay}>
            Play
          </button>
          <button className="button" onClick={() => onSort("rank")}>
            Sort: Rank
          </button>
          <button className="button" onClick={() => onSort("suit")}>
            Sort: Suit
          </button>
          <button
            className="button"
            onClick={onDiscard}
            disabled={discardsLeft <= 0}
          >
            Discard ({discardsLeft})
          </button>
        </div>
      </div>
      {/* Enemy Side */}
      <div className="flex flex-col items-center justify-center w-1/4 h-full">
        <Combatant
          name={enemy.name}
          health={enemy.health}
          maxHealth={enemy.maxHealth}
        />
      </div>
    </div>
  );
};

export default CombatScreen;
