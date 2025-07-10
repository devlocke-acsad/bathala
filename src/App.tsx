import React, { useState } from "react";
import TitleScreen from "./components/TitleScreen";
import MapScreen from "./components/MapScreen";
import type { GameMap, MapNodeType } from "./components/MapScreen";
import "./index.css";

const App: React.FC = () => {
  const [screen, setScreen] = useState<"title" | "game">("title");
  const [map, setMap] = useState<GameMap | null>(null);

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
    setMap((prev: GameMap | null) => {
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
    </div>
  );
};

export default App;
