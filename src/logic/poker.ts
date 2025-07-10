// Poker hand evaluation for 5-card hands
import type { Card } from "../components/CardComponent";

export type PokerHandType =
  | "HighCard"
  | "Pair"
  | "TwoPair"
  | "ThreeOfAKind"
  | "Straight"
  | "Flush"
  | "FullHouse"
  | "FourOfAKind"
  | "StraightFlush"
  | "RoyalFlush";

export interface PokerHandResult {
  handType: PokerHandType;
  ranks: string[];
  suits: string[];
  power: number; // Used for scaling attack/block
  dominantSuit: string;
}

const rankOrder = [
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K",
  "A",
];
const handPowerTable: Record<PokerHandType, number> = {
  HighCard: 1,
  Pair: 2,
  TwoPair: 3,
  ThreeOfAKind: 4,
  Straight: 5,
  Flush: 6,
  FullHouse: 7,
  FourOfAKind: 8,
  StraightFlush: 9,
  RoyalFlush: 10,
};

export function evaluatePokerHand(cards: Card[]): PokerHandResult {
  if (cards.length !== 5) {
    return {
      handType: "HighCard",
      ranks: cards.map((c) => c.rank),
      suits: cards.map((c) => c.suit),
      power: 1,
      dominantSuit: cards[0]?.suit || "♠",
    };
  }
  const ranks = cards.map((c) => c.rank);
  const suits = cards.map((c) => c.suit);
  const rankCounts: Record<string, number> = {};
  const suitCounts: Record<string, number> = {};
  for (const r of ranks) rankCounts[r] = (rankCounts[r] || 0) + 1;
  for (const s of suits) suitCounts[s] = (suitCounts[s] || 0) + 1;
  const isFlush = Object.values(suitCounts).some((c) => c === 5);
  const sortedRanks = ranks
    .map((r) => rankOrder.indexOf(r))
    .sort((a, b) => a - b);
  const isStraight = sortedRanks.every((v, i, arr) =>
    i === 0 ? true : v === arr[i - 1] + 1
  );
  const isRoyal = isStraight && isFlush && sortedRanks[0] === 8; // 10,J,Q,K,A
  let handType: PokerHandType = "HighCard";
  if (isRoyal) handType = "RoyalFlush";
  else if (isStraight && isFlush) handType = "StraightFlush";
  else if (Object.values(rankCounts).includes(4)) handType = "FourOfAKind";
  else if (
    Object.values(rankCounts).includes(3) &&
    Object.values(rankCounts).includes(2)
  )
    handType = "FullHouse";
  else if (isFlush) handType = "Flush";
  else if (isStraight) handType = "Straight";
  else if (Object.values(rankCounts).includes(3)) handType = "ThreeOfAKind";
  else if (Object.values(rankCounts).filter((c) => c === 2).length === 2)
    handType = "TwoPair";
  else if (Object.values(rankCounts).includes(2)) handType = "Pair";
  // Dominant suit for special
  const dominantSuit = Object.entries(suitCounts).sort(
    (a, b) => b[1] - a[1]
  )[0][0];
  return {
    handType,
    ranks,
    suits,
    power: handPowerTable[handType],
    dominantSuit,
  };
}
