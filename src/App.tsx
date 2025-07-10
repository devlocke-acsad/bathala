import React, { useState } from "react";
import TitleScreen from "./components/TitleScreen";
import MapScreen from "./components/MapScreen";
import CombatScreen from "./components/CombatScreen";
import { evaluatePokerHand } from "./logic/poker";
import type { GameMap, MapNodeType } from "./components/MapScreen";
import "./index.css";
import CardComponent from "./components/CardComponent";

const App: React.FC = () => {
  const [screen, setScreen] = useState<"title" | "game" | "combat">("title");
  const [map, setMap] = useState<GameMap | null>(null);
  const [combat, setCombat] = useState<null | {
    player: { name: string; health: number; maxHealth: number };
    enemy: { name: string; health: number; maxHealth: number };
    hand: import("./components/CardComponent").Card[];
    selected: string[];
    discardsLeft: number;
  }>(null);
  const [played, setPlayed] = useState<{
    cards: import("./components/CardComponent").Card[];
    result: ReturnType<typeof evaluatePokerHand>;
  } | null>(null);
  const [deck, setDeck] = useState<import("./components/CardComponent").Card[]>(
    []
  );
  const [discardPile, setDiscardPile] = useState<
    import("./components/CardComponent").Card[]
  >([]);
  const [playedPile, setPlayedPile] = useState<
    import("./components/CardComponent").Card[]
  >([]);
  const [showPile, setShowPile] = useState<
    "deck" | "discard" | "played" | null
  >(null);
  const [showPileModal, setShowPileModal] = useState<
    "deck" | "discard" | "played" | null
  >(null);
  const [log, setLog] = useState<string[]>([]);

  function generateFirstLevelMap(): GameMap {
    // 5 layers: Start, 1st, 2nd, 3rd, Boss
    const layers = [
      [{ type: "Start" as MapNodeType }],
      Array(3).fill({ type: "Combat" as MapNodeType }),
      [
        { type: "Combat" as MapNodeType },
        { type: "Shop" as MapNodeType },
        { type: "Event" as MapNodeType },
      ],
      [
        { type: "Elite" as MapNodeType },
        { type: "Rest" as MapNodeType },
        { type: "Treasure" as MapNodeType },
      ],
      [{ type: "Boss" as MapNodeType }],
    ];
    let nodes: GameMap["nodes"] = [];
    let nodeId = 0;
    const layerY = [60, 160, 280, 400, 540];
    layers.forEach((layer, i) => {
      const xStep = 400 / (layer.length + 1);
      layer.forEach((node, j) => {
        nodes.push({
          id: `${nodeId}`,
          type: node.type,
          x: xStep * (j + 1),
          y: layerY[i],
          connections: [],
          visited: false,
          isCurrent: i === 0 && j === 0,
        });
        nodeId++;
      });
    });
    // Connect nodes layer by layer
    for (let i = 0; i < layers.length - 1; i++) {
      const fromLayer = nodes.filter((n) => n.y === layerY[i]);
      const toLayer = nodes.filter((n) => n.y === layerY[i + 1]);
      fromLayer.forEach((fromNode) => {
        // Connect to 1-2 random nodes in next layer
        const targets = toLayer.length === 1 ? toLayer : toLayer.slice();
        const shuffled = targets.sort(() => Math.random() - 0.5);
        const numConnections = Math.max(1, Math.floor(Math.random() * 2) + 1);
        shuffled.slice(0, numConnections).forEach((target) => {
          fromNode.connections.push(target.id);
        });
      });
    }
    return { nodes };
  }

  function startCombat() {
    const newDeck = createDeck();
    setDeck(newDeck);
    setDiscardPile([]);
    setPlayedPile([]);
    setCombat({
      player: { name: "Player", health: 80, maxHealth: 80 },
      enemy: { name: "Slime", health: 40, maxHealth: 40 },
      hand: newDeck.slice(0, 8),
      selected: [],
      discardsLeft: 3,
    });
  }

  function createDeck() {
    const suits = ["♠", "♥", "♦", "♣"];
    const ranks = [
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
    const deck: import("./components/CardComponent").Card[] = [];
    for (const suit of suits)
      for (const rank of ranks) deck.push({ id: `${rank}${suit}`, rank, suit });
    return deck.sort(() => Math.random() - 0.5);
  }

  function drawFromDeck(count: number) {
    let drawn: import("./components/CardComponent").Card[] = [];
    setDeck((prev) => {
      drawn = prev.slice(0, count);
      return prev.slice(count);
    });
    return drawn;
  }

  function handleNodeClick(nodeId: string) {
    const node = map?.nodes.find((n) => n.id === nodeId);
    if (node && node.type === "Combat") {
      startCombat();
      setScreen("combat");
    } else {
      setMap((prev) => {
        if (!prev) return prev;
        return {
          nodes: prev.nodes.map((n) =>
            n.id === nodeId
              ? { ...n, isCurrent: true, visited: true }
              : { ...n, isCurrent: false }
          ),
        };
      });
    }
  }

  function handleSelectCard(id: string) {
    setCombat((prev) =>
      prev
        ? {
            ...prev,
            selected: prev.selected.includes(id)
              ? prev.selected.filter((cid) => cid !== id)
              : prev.selected.length < 5
              ? [...prev.selected, id]
              : prev.selected,
          }
        : prev
    );
  }
  // Fix played pile logic: only add played cards once per play, not again on action
  function handlePlay() {
    setCombat((prev) => {
      if (!prev) return prev;
      const playedCards = prev.hand.filter((c) => prev.selected.includes(c.id));
      if (playedCards.length !== 5) return prev;
      setPlayed({ cards: playedCards, result: evaluatePokerHand(playedCards) });
      // Remove played cards from hand, keep unplayed for next turn
      const newHand = prev.hand.filter((c) => !prev.selected.includes(c.id));
      return {
        ...prev,
        hand: newHand,
        selected: [],
      };
    });
  }
  function handleAction(type: "attack" | "defend" | "special") {
    if (!played) return;
    let logEntry = "";
    let effect = (prev: typeof combat) => prev;
    if (type === "attack") {
      const dmg = played.result.power * 5;
      logEntry = `Player attacks for ${dmg} damage (${played.result.handType})!`;
      effect = (prev) => {
        if (!prev) return prev;
        let newEnemy = { ...prev.enemy };
        newEnemy.health = Math.max(0, newEnemy.health - dmg);
        return { ...prev, enemy: newEnemy };
      };
    } else if (type === "defend") {
      const block = played.result.power * 3;
      logEntry = `Player defends for ${block} block (${played.result.handType})!`;
    } else if (type === "special") {
      logEntry = `Player uses special (${played.result.handType}, ${played.result.dominantSuit})!`;
    }
    const playedCards = played.cards;
    // Update log and played pile ONCE per action
    setLog((prevLog) => {
      const entries = [...prevLog, logEntry];
      if (combat && combat.player.health > 0 && combat.enemy.health > 0) {
        entries.push("Enemy attacks for 7 damage!");
      }
      return entries;
    });
    setPlayedPile((pile) => [...pile, ...playedCards]);
    setCombat((prev) => {
      if (!prev) return prev;
      const needed = 8 - prev.hand.length;
      let newHand = [...prev.hand];
      if (needed > 0) {
        const drawn = drawFromDeck(needed);
        newHand = [...newHand, ...drawn];
      }
      return effect({
        ...prev,
        hand: newHand,
        selected: [],
      });
    });
    setTimeout(() => {
      setCombat((prev2) => {
        if (!prev2) return prev2;
        return {
          ...prev2,
          player: {
            ...prev2.player,
            health: Math.max(0, prev2.player.health - 7),
          },
        };
      });
      setPlayed(null);
    }, 800);
  }
  function handleDiscard() {
    setCombat((prev) => {
      if (!prev || prev.discardsLeft <= 0) return prev;
      const toDiscard = prev.selected;
      const discarded = prev.hand.filter((c) => toDiscard.includes(c.id));
      setDiscardPile((pile) => [...pile, ...discarded]);
      const remainingHand = prev.hand.filter((c) => !toDiscard.includes(c.id));
      const drawn = drawFromDeck(toDiscard.length);
      return {
        ...prev,
        hand: [...remainingHand, ...drawn],
        selected: [],
        discardsLeft: prev.discardsLeft - 1,
      };
    });
  }
  function handleSort(type: "rank" | "suit") {
    setCombat((prev) =>
      prev
        ? {
            ...prev,
            hand: [...prev.hand].sort((a, b) =>
              type === "rank"
                ? a.rank.localeCompare(b.rank)
                : a.suit.localeCompare(b.suit)
            ),
          }
        : prev
    );
  }

  return (
    <div className="min-h-screen">
      {screen === "title" && (
        <TitleScreen
          onPlay={() => {
            setMap(generateFirstLevelMap());
            setScreen("game");
          }}
        />
      )}
      {screen === "game" && map && (
        <MapScreen map={map} onNodeClick={handleNodeClick} />
      )}
      {screen === "game" && !map && (
        <div className="flex items-center justify-center h-screen">
          <h2 className="text-3xl font-heading">Loading map...</h2>
        </div>
      )}
      {screen === "combat" && combat && (
        <CombatScreen
          player={combat.player}
          enemy={combat.enemy}
          hand={combat.hand} // always show the real hand (unplayed cards)
          selected={combat.selected}
          discardsLeft={combat.discardsLeft}
          onSelectCard={played ? () => {} : handleSelectCard}
          onPlay={played ? undefined : handlePlay}
          onDiscard={played ? undefined : handleDiscard}
          onSort={played ? undefined : handleSort}
          played={played}
          onAction={handleAction}
          deck={deck}
          discardPile={discardPile}
          playedPile={playedPile}
          onShowPile={setShowPile}
          showPile={showPile}
          showPileModal={showPileModal}
          setShowPileModal={setShowPileModal}
          log={log}
          onNewRun={() => {
            setMap(generateFirstLevelMap());
            setScreen("game");
            setCombat(null);
            setPlayed(null);
            setDeck([]);
            setDiscardPile([]);
            setPlayedPile([]);
            setLog([]);
            setShowPile(null);
            setShowPileModal(null);
          }}
        />
      )}
      {showPileModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-60">
          <div className="bg-background p-6 rounded-lg shadow-lg max-w-2xl w-full flex flex-col items-center">
            <div className="font-heading text-2xl mb-4">
              {showPileModal.charAt(0).toUpperCase() + showPileModal.slice(1)}{" "}
              Pile
            </div>
            <div className="flex flex-wrap gap-2 justify-center mb-4">
              {(showPileModal === "deck"
                ? deck
                : showPileModal === "discard"
                ? discardPile
                : playedPile
              ).map((card) => (
                <div key={card.id}>
                  <CardComponent card={card} />
                </div>
              ))}
            </div>
            <button
              className="button w-32"
              onClick={() => setShowPileModal(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
