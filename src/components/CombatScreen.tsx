import React from "react";
import Combatant from "./Combatant";
import PlayerHand from "./PlayerHand";
import type { Card } from "./CardComponent";
import type { PokerHandResult } from "../logic/poker";

interface CombatScreenProps {
  player: { name: string; health: number; maxHealth: number };
  enemy: { name: string; health: number; maxHealth: number };
  hand: Card[];
  selected: string[];
  discardsLeft: number;
  onSelectCard: (id: string) => void;
  onPlay: (() => void) | undefined;
  onDiscard: (() => void) | undefined;
  onSort: ((type: "rank" | "suit") => void) | undefined;
  played?: { cards: Card[]; result: PokerHandResult } | null;
  onAction?: (type: "attack" | "defend" | "special") => void;
  deck: Card[];
  discardPile: Card[];
  playedPile: Card[];
  onShowPile: (pile: "deck" | "discard" | "played" | null) => void;
  showPile: "deck" | "discard" | "played" | null;
  showPileModal?: "deck" | "discard" | "played" | null;
  setShowPileModal?: (pile: "deck" | "discard" | "played" | null) => void;
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
  played,
  onAction,
  deck,
  discardPile,
  playedPile,
  onShowPile,
  showPile,
  showPileModal,
  setShowPileModal,
}) => {
  return (
    <div className="flex flex-col w-full h-screen bg-background text-text">
      {/* Pile Buttons at Top */}
      <div className="flex flex-row gap-4 justify-center items-center w-full p-8">
        <button
          className="button"
          onClick={() => setShowPileModal && setShowPileModal("deck")}
        >
          Deck ({deck.length})
        </button>
        <button
          className="button"
          onClick={() => setShowPileModal && setShowPileModal("discard")}
        >
          Discard ({discardPile.length})
        </button>
        <button
          className="button"
          onClick={() => setShowPileModal && setShowPileModal("played")}
        >
          Played ({playedPile.length})
        </button>
      </div>
      <div className="flex flex-row flex-1 w-full h-full">
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
          <div className="mb-2 text-lg font-heading">
            {played ? "Played Hand" : "Your Hand"}
          </div>
          <PlayerHand hand={hand} selected={selected} onSelect={onSelectCard} />
          {!played ? (
            <div className="flex flex-row gap-2 mt-2">
              <button className="button" onClick={onPlay} disabled={!onPlay}>
                Play
              </button>
              <button
                className="button"
                onClick={() => onSort && onSort("rank")}
                disabled={!onSort}
              >
                Sort: Rank
              </button>
              <button
                className="button"
                onClick={() => onSort && onSort("suit")}
                disabled={!onSort}
              >
                Sort: Suit
              </button>
              <button
                className="button"
                onClick={onDiscard}
                disabled={discardsLeft <= 0 || !onDiscard}
              >
                Discard ({discardsLeft})
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center mt-4">
              <div className="mb-2 text-xl font-heading">
                {played.result.handType} ({played.result.dominantSuit})
              </div>
              <div className="flex flex-row gap-4">
                <button
                  className="button"
                  onClick={() => onAction && onAction("attack")}
                >
                  Attack ({played.result.power * 5})
                </button>
                <button
                  className="button"
                  onClick={() => onAction && onAction("defend")}
                >
                  Defend ({played.result.power * 3})
                </button>
                <button
                  className="button"
                  onClick={() => onAction && onAction("special")}
                >
                  Special
                </button>
              </div>
            </div>
          )}
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
    </div>
  );
};

export default CombatScreen;
