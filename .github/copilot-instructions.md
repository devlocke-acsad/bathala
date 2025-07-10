### **Guidelines for Building "Bathala" with React-TypeScript (Vite)**

This document outlines best practices and specific considerations for developing "Bathala" using React with TypeScript and Vite. The focus will be on the core components: the **Game Map** and the **Main Gameplay Loop**.

#### **I. General React & TypeScript Best Practices**

1. **Component-Based Architecture:**
   - **Modular Design:** Break down the UI into small, reusable components (e.g., Card, EnemyDisplay, PlayerHand, MapNode, Button).
   - **Atomic Design Principles:** Consider organizing components into Atoms (buttons, icons), Molecules (card display, enemy intent), Organisms (player hand, combat area), Templates (full combat screen layout), and Pages (the actual game screens).
   - **Clear Responsibilities:** Each component should have a single, clear responsibility.
2. **State Management:**
   - **Centralized Game State:** For a game, a single, centralized state object is often beneficial.
   - **useState / useReducer:** For local component state and more complex state logic within a single component. useReducer is excellent for game state transitions (e.g., DRAW_CARD, PLAY_HAND, ENEMY_TURN).
   - **React Context API:** For global state that needs to be accessed by many components (e.g., GameContext for the main game state, PlayerStatsContext, DeckContext). This avoids prop drilling.
   - **Zustand (Recommended for larger state):** A lightweight, fast, and scalable state management library that's excellent for games. It's simpler than Redux and very intuitive with React hooks.
3. **TypeScript for Type Safety:**
   - **Define Interfaces/Types:** Crucially define types for all game entities:
     - Card (id, name, rank, suit, type (attack/defend/special), description, power, cost, effects, tags)
     - Enemy (id, name, health, maxHealth, intent, statusEffects, abilities)
     - Player (health, maxHealth, energy, gold, deck, hand, discardPile, playedPile, relics, statusEffects)
     - GameMapNode (id, type, position, connections, visited)
     - GameState (currentAct, currentFloor, player, enemy, deckState, handState, turnPhase, currentTurn)
   - **Strict Typing:** Leverage TypeScript's power to catch errors early, especially important in complex game logic.
4. **Performance Considerations:**
   - **React.memo / useMemo / useCallback:** Use these hooks to prevent unnecessary re-renders of components, especially for frequently updated elements like health bars or card counts.
   - **Virtualization (if many cards):** If you ever need to display a very large number of cards (e.g., a massive deck viewer), consider libraries like react-virtualized or react-window.
5. **Error Handling:**
   - **React Error Boundaries:** Implement these to gracefully catch JavaScript errors in your component tree and display a fallback UI, preventing the entire game from crashing.
   - **try...catch:** For asynchronous operations (e.g., blockchain interactions, API calls).
6. **Responsive Design (Tailwind CSS):**
   - **Mobile-First Approach:** Design for smaller screens first, then scale up using Tailwind's responsive prefixes (sm:, md:, lg:).
   - **Flexbox/Grid:** Utilize Tailwind's flex and grid utilities for robust and adaptable layouts.
   - **Fluid Units:** Prefer rem, em, vw, vh, and percentage-based widths over fixed pixel values.

#### **II. Game Map Implementation Guidelines**

The map is a visual representation of the player's progression.

1. **Data Structure for Map:**

   - Represent the map as a graph:
     - nodes: An array of MapNode objects. Each node has an id, type (e.g., 'Combat', 'Elite', 'Rest', 'Shop', 'Event', 'Boss'), position (x, y coordinates for rendering), and connections (array of node IDs it connects to).
     - edges: An array representing connections between nodes (optional, can be derived from connections in nodes).
   - **Example MapNode Interface:**  
     interface MapNode {  
      id: string;  
      type: 'Combat' | 'Elite' | 'Rest' | 'Shop' | 'Event' | 'Boss';  
      x: number; // For rendering position  
      y: number; // For rendering position  
      connections: string\[\]; // IDs of connected nodes  
      visited: boolean;  
      isCurrent: boolean;  
      // Add any other specific properties like 'eventOutcome', 'enemyType', etc.  
     }

2. **Rendering the Map:**
   - **SVG (Recommended):** Use SVG elements within React (JSX) for drawing nodes (circles, rectangles) and paths (lines). SVG scales beautifully and allows for easy interaction.
     - **Pros:** Vector graphics, easy styling with CSS, direct manipulation with React state.
     - **Cons:** Can be less performant for extremely complex graphs with thousands of nodes (not likely for a Slay the Spire-like map).
   - **HTML/CSS:** Can be used for simpler node representations, but drawing paths might be more cumbersome.
   - **Libraries (Optional):**
     - **D3.js:** While powerful for data visualization, its direct DOM manipulation might clash with React's philosophy. If used, integrate it carefully within useEffect hooks.
     - **react-force-graph:** A React component for force-directed graphs. Might be overkill if you want precise control over node placement.
3. **Map Interaction:**
   - **Clickable Nodes:** Attach onClick handlers to SVG nodes.
   - **Path Highlighting:** When a node is clicked, highlight valid paths to connected, unvisited nodes.
   - **Current Node Tracking:** Maintain isCurrent state for the player's current map node.
   - **Navigation Logic:** When a new node is selected, update the isCurrent node and trigger the corresponding encounter type.
4. **Procedural Generation (Algorithm for Map Generation):**
   - **Layered Approach:** Generate nodes layer by layer (e.g., 5-7 layers for a typical act).
   - **Node Distribution:** Ensure a good mix of combat, event, rest, and shop nodes.
   - **Pathing:** Ensure all nodes are reachable and there's at least one path to the boss. Avoid dead ends unless intentional.
   - **Randomness with Constraints:** Use random number generation but apply rules to ensure a playable and balanced map (e.g., "always at least one rest site every 3 floors," "boss node must be at the final layer").
   - **Algorithm Example (Simplified):**
     1. Create a starting node.
     2. For each layer, create a set number of nodes.
     3. Connect nodes from the current layer to the previous layer, ensuring a minimum number of connections per node and preventing excessive branching.
     4. Place special nodes (Elite, Shop, Event) based on probabilities.
     5. Place the Boss node at the final layer, connected to several nodes in the penultimate layer.

#### **III. Main Gameplay Loop Implementation Guidelines**

This is the core of your game, encompassing card mechanics and combat.

1. **Game State Management (Centralized):**
   - A single GameState object (as defined in I.3) should hold all critical information for the current turn, player, enemy, and card piles.
   - Use useReducer or Zustand to manage state updates in a predictable way (e.g., dispatch({ type: 'DRAW_CARDS', payload: count })).
2. **Card Representation (Card Component):**
   - A dedicated Card React component that takes card data (from your Card interface) as props.
   - Handles rendering card art, text, elemental suit, rank, and any active effects.
   - Manages its own visual state (e.g., isHovered, isSelected, isPlayed).
   - Drag-and-drop functionality (using libraries like react-dnd or custom onMouseDown/onMouseMove/onMouseUp listeners) for playing cards.
3. **Deck/Hand Logic:**
   - **Deck Module/Utility:** Functions to shuffle, drawCards, discardCards, moveToDiscard, moveToHand, exhaustCard, addCard, removeCard.
   - **Piles as Arrays:** deck: Card\[\], hand: Card\[\], discardPile: Card\[\], playedPile: Card\[\], exhaustPile: Card\[\].
   - **Shuffling:** Implement a standard shuffling algorithm (e.g., Fisher-Yates).
   - **Drawing:** When drawCards is called, move cards from deck to hand. If deck is empty, shuffle discardPile into deck.
4. **Poker Hand Evaluation:**
   - **Core Algorithm:** A function that takes an array of Card objects (the player's selected cards) and returns the best possible poker hand found (e.g., Pair, TwoPair, ThreeOfAKind, Straight, Flush, FullHouse, FourOfAKind, StraightFlush, RoyalFlush).
   - **Elemental Consideration:** The algorithm should also identify the dominant elemental suit(s) within the formed poker hand to determine the "Special" action's elemental property.
   - **Power Calculation:** Assign a "power" value to each poker hand type (e.g., Royal Flush \= highest power, Pair \= lowest). This power value will scale the Attack, Defend, or Special action.
5. **Action Selection and Resolution:**
   - **UI for Actions:** After a poker hand is formed and "played," display three buttons: "Attack," "Defend," "Special."
   - **Dynamic Action Values:** The values (damage, block, special effect) displayed on these buttons should update based on the power of the played poker hand and any active player/relic buffs.
   - **Special Action Logic:** The "Special" action will have varying effects based on the poker hand's dominant element(s).
     - **Example:** If a "Fire Flush" is played, the "Special" button might say "Fire Burst: Deal AoE damage & apply Burn." If an "Earth Straight" is played, it might say "Earth Shield: Gain massive Block & apply Root."
   - **Resolution:** When an action is chosen, update game state (reduce enemy HP, increase player block, apply status effects).
6. **Turn-Based System:**
   - **Turn Phases:** Clearly define phases: PlayerTurnStart, DrawPhase, DiscardPhase, PlayHandPhase, ActionPhase, EnemyTurnStart, EnemyActionPhase, EndTurnPhase.
   - **State Machine:** A useReducer or Zustand store can act as a simple state machine to manage these phases.
   - **Enemy AI:** For the enemy's turn, a simple AI that checks its intent (e.g., "Attack for X," "Debuff Y") and executes it.
7. **Visual Feedback and Animations:**
   - **Card Movement:** Animate cards drawing from deck, moving to hand, moving to discard, and playing. Libraries like Framer Motion or React Spring can simplify complex animations.
   - **Damage/Block Numbers:** Floating numbers for damage dealt, block gained.
   - **Status Effects:** Visual icons on player/enemy to indicate active status effects.
   - **Intent Icons:** Clear icons above enemies showing their next action.

#### **IV. Blockchain Integration (Briefly)**

- **NFTs for Cosmetics:** When integrating NFTs, this will primarily involve a separate "Collection" or "Inventory" screen.
- **Web3 Connection:** Use ethers.js (or web3.js) and a wallet connector like Wagmi or Web3Modal to allow users to connect their MetaMask/other wallets.
- **Smart Contract Interaction:** Call smart contract functions to verify ownership of NFT skins or to mint new achievement NFTs. This will be outside the core gameplay loop but integrated into the UI.

#### **V. How to Interact with the AI for Code Generation**

When asking me to generate code, be as specific as possible:

- **Specify Components:** "Generate the Card component," "Show me the PlayerHand component."
- **Define Inputs/Outputs:** "The Card component should accept cardData: Card as a prop."
- **Describe Logic:** "The PlayerHand component should allow cards to be dragged and dropped into a PlayArea." "The poker hand evaluation function should return the hand type and the dominant element."
- **State Management:** "Show me how to set up a useReducer for the main GameState."
- **Styling:** "Use Tailwind CSS for all styling."
- **Iterative Development:** Ask for small, manageable chunks of code. "First, let's get the basic Card component working. Then, we'll add the PlayerHand."

By following these guidelines, you'll be well-equipped to build a robust and engaging "Bathala" game with React-TypeScript and Vite\!
