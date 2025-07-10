import React, { useState } from "react";
import TitleScreen from "./components/TitleScreen";
import MapScreen from "./components/MapScreen";
import CombatScreen from "./components/CombatScreen";
import { evaluatePokerHand } from "./logic/poker";
import type { GameMap, MapNodeType } from "./components/MapScreen";
import "./index.css";

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

  function handleNodeClick(nodeId: string) {
    const node = map?.nodes.find((n) => n.id === nodeId);
    if (node && node.type === "Combat") {
      // Start combat with dummy data
      setCombat({
        player: { name: "Player", health: 80, maxHealth: 80 },
        enemy: { name: "Slime", health: 40, maxHealth: 40 },
        hand: drawHand(),
        selected: [],
        discardsLeft: 3,
      });
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

  function drawHand() {
    // Return 8 random cards from a standard 52-card deck
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
    return deck.sort(() => Math.random() - 0.5).slice(0, 8);
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
  function handlePlay() {
    setCombat((prev) => {
      if (!prev) return prev;
      const playedCards = prev.hand.filter((c) => prev.selected.includes(c.id));
      if (playedCards.length !== 5) return prev; // Only allow 5-card hands
      setPlayed({ cards: playedCards, result: evaluatePokerHand(playedCards) });
      return {
        ...prev,
        hand: prev.hand.filter((c) => !prev.selected.includes(c.id)),
        selected: [],
      };
    });
  }
  function handleDiscard() {
    setCombat((prev) =>
      prev && prev.discardsLeft > 0
        ? {
            ...prev,
            hand: prev.hand
              .filter((c) => !prev.selected.includes(c.id))
              .concat(drawHand().slice(0, prev.selected.length)),
            selected: [],
            discardsLeft: prev.discardsLeft - 1,
          }
        : prev
    );
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
  function handleAction(type: "attack" | "defend" | "special") {
    // TODO: Implement action logic based on played.result
    setPlayed(null); // Reset for next turn
    // For now, just go back to hand phase
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
          hand={played ? played.cards : combat.hand}
          selected={combat.selected}
          discardsLeft={combat.discardsLeft}
          onSelectCard={played ? () => {} : handleSelectCard}
          onPlay={played ? undefined : handlePlay}
          onDiscard={played ? undefined : handleDiscard}
          onSort={played ? undefined : handleSort}
          played={played}
          onAction={handleAction}
        />
      )}
    </div>
  );
};

export default App;
