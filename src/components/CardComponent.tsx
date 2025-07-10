import React from "react";

export interface Card {
  id: string;
  rank: string; // e.g. 'A', '2', ..., 'K'
  suit: string; // e.g. '♠', '♥', '♦', '♣'
  // Add more properties as needed
}

interface CardProps {
  card: Card;
  isSelected?: boolean;
  onClick?: () => void;
}

const suitColors: Record<string, string> = {
  "♠": "text-blue-300 border-blue-400",
  "♣": "text-green-300 border-green-400",
  "♥": "text-red-400 border-red-400",
  "♦": "text-pink-300 border-pink-400",
};

const CardComponent: React.FC<CardProps> = ({ card, isSelected, onClick }) => (
  <div
    className={`w-16 h-24 rounded-lg border-2 bg-background flex flex-col items-center justify-center font-heading text-2xl shadow-md cursor-pointer transition-all duration-150 select-none m-1 ${
      suitColors[card.suit] || "border-primary"
    } ${isSelected ? "ring-4 ring-accent" : ""}`}
    onClick={onClick}
  >
    <div>{card.rank}</div>
    <div className="text-lg">{card.suit}</div>
  </div>
);

export default CardComponent;
