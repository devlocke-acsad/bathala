import { PlayingCard, Suit, Rank, Element } from "../core/types/CombatTypes";

/**
 * DeckManager - Handles deck creation, shuffling, and card management
 */
export class DeckManager {
  private static readonly SUITS: Suit[] = [
    "hearts",
    "diamonds",
    "clubs",
    "spades",
  ];
  private static readonly RANKS: Rank[] = [
    "A",
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
  ];

  // Element mapping for suits (can be customized later)
  private static readonly SUIT_ELEMENTS: Record<Suit, Element> = {
    hearts: "fire", // Red suits = Fire
    diamonds: "earth", // Red suits = Earth
    clubs: "water", // Black suits = Water
    spades: "air", // Black suits = Air
  };

  /**
   * Create a standard deck of 52 cards with elemental attributes
   */
  static createStandardDeck(): PlayingCard[] {
    const deck: PlayingCard[] = [];

    this.SUITS.forEach((suit) => {
      this.RANKS.forEach((rank) => {
        deck.push({
          id: `${rank}-${suit}`,
          rank,
          suit,
          element: this.SUIT_ELEMENTS[suit],
          selected: false,
          playable: true,
        });
      });
    });

    return this.shuffleDeck(deck);
  }

  /**
   * Create a starter deck (smaller, balanced deck for combat)
   */
  static createStarterDeck(): PlayingCard[] {
    const starterCards: PlayingCard[] = [];

    // Add specific cards for balanced starter deck
    const starterRanks: Rank[] = [
      "A",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "10",
    ];

    this.SUITS.forEach((suit) => {
      starterRanks.forEach((rank) => {
        starterCards.push({
          id: `${rank}-${suit}`,
          rank,
          suit,
          element: this.SUIT_ELEMENTS[suit],
          selected: false,
          playable: true,
        });
      });
    });

    return this.shuffleDeck(starterCards);
  }

  /**
   * Shuffle a deck using Fisher-Yates algorithm
   */
  static shuffleDeck(deck: PlayingCard[]): PlayingCard[] {
    const shuffled = [...deck];

    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled;
  }

  /**
   * Draw cards from deck
   */
  static drawCards(
    deck: PlayingCard[],
    count: number
  ): { drawnCards: PlayingCard[]; remainingDeck: PlayingCard[] } {
    const drawnCards = deck.slice(0, count);
    const remainingDeck = deck.slice(count);

    return { drawnCards, remainingDeck };
  }

  /**
   * Get card display information
   */
  static getCardDisplay(card: PlayingCard): {
    symbol: string;
    color: string;
    elementSymbol: string;
  } {
    const suitSymbols: Record<Suit, string> = {
      hearts: "♥",
      diamonds: "♦",
      clubs: "♣",
      spades: "♠",
    };

    const suitColors: Record<Suit, string> = {
      hearts: "#ff4757",
      diamonds: "#ff4757",
      clubs: "#2f3542",
      spades: "#2f3542",
    };

    const elementSymbols: Record<Element, string> = {
      fire: "🔥",
      water: "💧",
      earth: "🌍",
      air: "💨",
      neutral: "⚪",
    };

    return {
      symbol: suitSymbols[card.suit],
      color: suitColors[card.suit],
      elementSymbol: elementSymbols[card.element],
    };
  }

  /**
   * Sort cards by rank or suit
   */
  static sortCards(
    cards: PlayingCard[],
    sortBy: "rank" | "suit"
  ): PlayingCard[] {
    const rankOrder: Record<Rank, number> = {
      A: 1,
      "2": 2,
      "3": 3,
      "4": 4,
      "5": 5,
      "6": 6,
      "7": 7,
      "8": 8,
      "9": 9,
      "10": 10,
      J: 11,
      Q: 12,
      K: 13,
    };

    const suitOrder: Record<Suit, number> = {
      clubs: 1,
      diamonds: 2,
      hearts: 3,
      spades: 4,
    };

    return [...cards].sort((a, b) => {
      if (sortBy === "rank") {
        return rankOrder[a.rank] - rankOrder[b.rank];
      } else {
        if (suitOrder[a.suit] === suitOrder[b.suit]) {
          return rankOrder[a.rank] - rankOrder[b.rank];
        }
        return suitOrder[a.suit] - suitOrder[b.suit];
      }
    });
  }
}
