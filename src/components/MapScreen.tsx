import React from "react";

export type MapNodeType =
  | "Start"
  | "Combat"
  | "Elite"
  | "Rest"
  | "Shop"
  | "Event"
  | "Treasure"
  | "Boss";

export interface MapNode {
  id: string;
  type: MapNodeType;
  x: number;
  y: number;
  connections: string[];
  visited: boolean;
  isCurrent: boolean;
}

export interface GameMap {
  nodes: MapNode[];
}

interface MapScreenProps {
  map: GameMap;
  onNodeClick: (nodeId: string) => void;
}

const nodeColors: Record<MapNodeType, string> = {
  Start: "fill-primary",
  Combat: "fill-red-500",
  Elite: "fill-yellow-500",
  Rest: "fill-blue-400",
  Shop: "fill-green-400",
  Event: "fill-purple-400",
  Treasure: "fill-amber-300",
  Boss: "fill-accent",
};

const MapScreen: React.FC<MapScreenProps> = ({ map, onNodeClick }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-text">
      <h2 className="text-4xl font-heading mb-6">Choose Your Path</h2>
      <svg
        width={400}
        height={600}
        className="bg-secondary rounded-lg shadow-lg"
      >
        {/* Draw connections */}
        {map.nodes.map((node) =>
          node.connections.map((targetId) => {
            const target = map.nodes.find((n) => n.id === targetId);
            if (!target) return null;
            return (
              <line
                key={`${node.id}-${targetId}`}
                x1={node.x}
                y1={node.y}
                x2={target.x}
                y2={target.y}
                stroke="#afb5d0"
                strokeWidth={3}
                opacity={0.5}
              />
            );
          })
        )}
        {/* Draw nodes */}
        {map.nodes.map((node) => (
          <g key={node.id}>
            <circle
              cx={node.x}
              cy={node.y}
              r={24}
              className={
                nodeColors[node.type] +
                (node.isCurrent ? " stroke-accent stroke-4" : "")
              }
              onClick={() => onNodeClick(node.id)}
              style={{ cursor: "pointer" }}
            />
            <text
              x={node.x}
              y={node.y + 6}
              textAnchor="middle"
              fontSize={14}
              fill="#fff"
              style={{ pointerEvents: "none" }}
            >
              {node.type === "Start" ? "S" : node.type[0]}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
};

export default MapScreen;
