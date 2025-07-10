import React from "react";
import type { Card } from "./CardComponent";
import CardComponent from "./CardComponent";

interface PlayerHandProps {
  hand: Card[];
  selected: string[];
  onSelect: (id: string) => void;
}

const PlayerHand: React.FC<PlayerHandProps> = ({
  hand,
  selected,
  onSelect,
}) => (
  <div className="flex flex-row items-end justify-center gap-2 mt-2 mb-2">
    {hand.map((card) => (
      <div key={card.id}>
        <div onClick={() => onSelect(card.id)}>
          <div className={selected.includes(card.id) ? "scale-110" : ""}>
            <CardComponent
              card={card}
              isSelected={selected.includes(card.id)}
            />
          </div>
        </div>
      </div>
    ))}
  </div>
);

export default PlayerHand;
