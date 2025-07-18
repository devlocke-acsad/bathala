Bathala AI Development Guidelines
Comprehensive AI Assistant Instructions for Thesis Development
Project Overview
Game: Bathala - A Filipino mythology-inspired roguelike deck-building card game  
Primary Research Focus: Machine Learning-based Dynamic Difficulty Adjustment (DDA)  
Tech Stack: TypeScript + Phaser.js + Web3 integration  
Target: Computer Science thesis with custom ML algorithms
Core Development Objectives

1. Main Game Mechanics Implementation
   Goal: Develop a robust and engaging roguelike deck-building card game system inspired by Filipino mythology.  
   Key Requirements:
   ⦁ Implement the core combat loop: Draw, Play (poker hand), Action (Attack/Defend/Special), Enhancement, Discard, Enemy Phase.
   ⦁ Accurately reflect Elemental Poker Hands, including base values and Fire, Water, Earth, and Air modifications, ensuring correct application of bonuses and special effects.
   ⦁ Integrate Enhancement Cards (Offensive, Defensive, Utility, Honor-Based, Legendary) with their respective costs, types (Passive/Active), and effects.
   ⦁ Develop the Relic System, allowing players to acquire and benefit from Common, Uncommon, Rare, and Legendary Relics throughout a run.
   ⦁ Implement the Honor System, ensuring player choices dynamically affect Honor ranges (High, Neutral, Low) and trigger corresponding gameplay and story effects.
   ⦁ Integrate the Enemy Bestiary for each Act (Act 1: Forest of Whispers, Act 2: Mountain Realm, Act 3: Realm of Bathala), accurately reflecting enemy HP, attack patterns, and special abilities for Common, Elite, and Boss encounters.
   ⦁ Develop the Story Structure, progressing through Acts with key events and multiple endings based on Honor and player choices.
   ⦁ Implement Progression Systems, including starting deck unlocks, cosmetic unlocks, and daily/weekly challenges.
   Implementation Priority: HIGH - These mechanics form the foundation of the game and provide data for the DDA system.
2. Primary Algorithm Implementation (DDA)
   Goal: Develop ML-based Dynamic Difficulty Adjustment system  
   Key Requirements:
   ⦁ Real-time player behavior analysis
   ⦁ Adaptive difficulty scaling based on performance metrics
   ⦁ Maintain target win rates (15-25% new players, 40-60% experienced)
   ⦁ Measurable impact on player engagement and retention
   Implementation Priority: HIGH - This is the thesis centerpiece, dependent on solid game mechanics.
3. Game Architecture (TypeScript + Phaser.js)
   Structure Requirements:  
   // Core system architecture  
   interface GameSystems {  
   difficultyManager: DynamicDifficultyAdjuster;  
   playerMetrics: PlayerBehaviorTracker;  
   gameState: GameStateManager;  
   cardSystem: CardGameLogic;  
   combatSystem: CombatEngine; // Added for explicit combat management  
   honorSystem: HonorManager; // Added for explicit honor management  
   relicSystem: RelicManager; // Added for explicit relic management  
   enemyManager: EnemyAI; // Added for enemy behavior  
   progressionSystem: ProgressionManager; // Added for unlocks  
   blockchainIntegration: Web3Manager;  
   }
   Key Considerations:
   ⦁ Modular design for easy testing and thesis documentation
   ⦁ Clean separation between game logic and ML systems
   ⦁ Comprehensive logging for research data collection
   ⦁ Type-safe interfaces for all game components
4. Machine Learning Integration
   Data Collection Requirements:
   ⦁ Player decision patterns (card selections, honor choices, relic choices, shop purchases)
   ⦁ Performance metrics (win/loss ratios, progression speed, damage dealt, damage taken, healing received)
   ⦁ Behavioral indicators (decision time, risk-taking patterns, preferred poker hands/elements)
   ⦁ Session data (play duration, return frequency, run outcomes)
   Model Requirements:
   ⦁ Real-time inference capabilities
   ⦁ Lightweight enough for web deployment
   ⦁ Clear input/output interfaces
   ⦁ A/B testing framework for validation
   Technical Implementation Guidelines
   File Structure & Organization
   src/  
   ├── core/  
   │ ├── game/ # Phaser.js game logic (scenes, UI, rendering)  
   │ ├── mechanics/ # Core game mechanics (cards, combat, honor, relics, progression) - NEW  
   │ ├── ai/ # ML/DDA systems  
   │ ├── blockchain/ # Web3 integration  
   │ └── types/ # TypeScript interfaces  
   ├── data/  
   │ ├── cards/ # Game content (poker cards, enhancement cards)  
   │ ├── enemies/ # Bestiary data  
   │ ├── relics/ # Relic data  
   │ ├── ui/ # UI specific data/assets  
   │ └── ml-models/ # Trained models  
   ├── utils/  
   │ ├── analytics/ # Player metrics  
   │ ├── difficulty/ # DDA algorithms  
   │ ├── validation/ # Testing utilities  
   │ └── helpers/ # General utility functions  
   └── tests/ # Unit and integration tests
   Code Quality Standards
   ⦁ TypeScript strict mode: Enable all strict type checking
   ⦁ Comprehensive interfaces: Define types for all game objects
   ⦁ Documentation: JSDoc comments for all public methods
   ⦁ Testing: Unit tests for ML algorithms and game logic, including card effects, combat calculations, and honor changes.
   ⦁ Linting: ESLint + Prettier for consistent code style
   Performance Requirements
   ⦁ ML inference: <10ms response time for difficulty adjustments
   ⦁ Frame rate: Maintain 60fps during gameplay
   ⦁ Memory usage: Efficient data structures for card/enemy/relic management
   ⦁ Load times: Initial game load <3 seconds
   Dynamic Difficulty Adjustment Specifications
   Core DDA Algorithm
   interface DifficultyAdjustment {  
   enemyHealthMultiplier: number; // 0.5 - 1.5  
   enemyDamageMultiplier: number; // 0.7 - 1.3  
   shopPriceMultiplier: number; // 0.6 - 1.4  
   rareCardDropChance: number; // 0.1 - 0.3  
   eventDifficultyScale: number; // 0.8 - 1.2  
   playerStartingHealthBonus: number; // e.g., -10 to +10 HP  
   initialDiscardBonus: number; // e.g., 0 to +1 discard  
   }
   interface PlayerMetrics {  
   winRate: number;  
   avgDecisionTime: number;  
   honorTrend: 'increasing' | 'decreasing' | 'stable';  
   riskTakingScore: number;  
   sessionCount: number;  
   preferredElement: 'fire' | 'water' | 'earth' | 'air';  
   avgDamageDealt: number;  
   avgDamageTaken: number;  
   avgHealingReceived: number;  
   cardsPlayedPerTurn: number;  
   uniqueHandsPlayed: Set<string>; // e.g., ['Straight', 'Flush']  
   }
   Adjustment Triggers
   ⦁ Real-time: After each combat encounter, after significant honor changes, after acquiring rare relics/enhancements.
   ⦁ Session-based: At start of new game session.
   ⦁ Progressive: Gradual changes to avoid player frustration.
   ⦁ Bounded: All adjustments within reasonable ranges.
   ⦁ Milestone-based: After defeating Act bosses or unlocking new progression elements.
   Success Metrics
   ⦁ Primary: Win rate optimization within target ranges
   ⦁ Secondary: Player retention and session length
   ⦁ Tertiary: Player satisfaction surveys and feedback, diversity of card/element usage.
   Web3 Integration Considerations
   Blockchain Features (Future Implementation)
   ⦁ NFT Enhancement Cards: Unique cards with special abilities
   ⦁ Achievement Tokens: Blockchain-verified accomplishments
   ⦁ Decentralized Tournaments: Community-driven competitions
   ⦁ Play-to-Earn Mechanics: Reward system for skilled players
   Technical Requirements
   ⦁ Wallet Integration: MetaMask/WalletConnect compatibility
   ⦁ Smart Contract Interaction: Read/write blockchain data
   ⦁ Gas Optimization: Efficient transaction batching
   ⦁ Offline Capability: Core game playable without blockchain
   Development Approach
   ⦁ Phase 1: Complete core game mechanics and systems.
   ⦁ Phase 2: Add DDA and ML systems.
   ⦁ Phase 3: Basic blockchain integration.
   ⦁ Phase 4: Implement advanced Web3 features.
   ⦁ Priority: Thesis algorithm development comes first, but it relies on a solid game foundation.
   Data Collection & Analysis Framework
   Player Behavior Tracking
   interface GameplaySession {  
   sessionId: string;  
   playerId: string;  
   startTime: Date;  
   endTime: Date;  
   gameEvents: GameEvent[];  
   finalOutcome: 'win' | 'loss' | 'abandoned';  
   difficultyAdjustments: DifficultyAdjustment[];  
   honorHistory: { timestamp: Date, honorValue: number }[]; // Track honor over time  
   relicsAcquired: string[];  
   enhancementsAcquired: string[];  
   }
   interface GameEvent {  
   timestamp: Date;  
   type: 'card_played' | 'enemy_encounter' | 'shop_visit' | 'honor_choice' | 'relic_aquired' | 'enhancement_acquired' | 'combat_start' | 'combat_end' | 'discard_action';  
   data: any; // Contextual data relevant to the event (e.g., cardName, handType, enemyName, itemPurchased)  
   playerState: PlayerState; // Snapshot of player HP, Block, Energy, Hand, Deck size  
   enemyState?: EnemyState; // Snapshot of enemy HP, buffs/debuffs  
   }
   ML Model Training Data
   ⦁ Features: Player behavior patterns (e.g., preference for high attack vs. high defend hands, average cards discarded per turn, honor range maintained), game state variables (e.g., enemy type, current act), previous difficulty settings.
   ⦁ Labels: Optimal difficulty adjustments for engagement (e.g., player continued playing, win within target range).
   ⦁ Validation: Cross-validation with held-out player data.
   ⦁ Continuous Learning: Model updates based on new player data.
   Research Documentation
   ⦁ Methodology: Clear description of ML approach, detailing data collection, feature engineering, model selection, and training procedures.
   ⦁ Experiments: A/B testing results and statistical analysis comparing DDA against static difficulty or other DDA methods.
   ⦁ Validation: Comparison with baseline difficulty systems, demonstrating how DDA maintains target win rates and improves engagement metrics.
   ⦁ Limitations: Honest assessment of approach constraints and areas for future research.
   Development Phases & Milestones
   Phase 1: Core Game Prototype (Weeks 1-4)
   ⦁ [x] Basic card game mechanics in Phaser.js (draw, play, discard).
   ⦁ [x] Simple combat system (HP, damage, block).
   ⦁ [x] Implementation of Base Poker Hand Values and Elemental Modifications (Fire, Water, Earth, Air).
   ⦁ [x] Initial Enemy Bestiary for Act 1 common enemies with basic attack patterns.
   ⦁ [x] Player metrics collection system for basic win/loss.
   ⦁ [x] Basic UI and game flow (start game, combat, end screen).
   Phase 2: Advanced Game Mechanics & Baseline AI (Weeks 5-8)
   ⦁ [ ] Full implementation of Enhancement Cards (Offensive, Defensive, Utility).
   ⦁ [ ] Relic System integration (acquisition and effects for Common, Uncommon Relics).
   ⦁ [ ] Honor System implementation with initial events and honor range effects.
   ⦁ [ ] Full Act 1 Enemy Bestiary (Elites, Boss) with all special abilities.
   ⦁ [ ] Implement baseline DDA system (simple rule-based adjustments).
   ⦁ [ ] Add more detailed player behavior analysis (card selections, decision time).
   ⦁ [ ] Create initial ML model training pipeline with mock data.
   Phase 3: DDA & Progression Systems (Weeks 9-12)
   ⦁ [ ] Implement advanced DDA system (e.g., initial neural network or reinforcement learning approach).
   ⦁ [ ] Real-time model inference for difficulty adjustments.
   ⦁ [ ] Implementation of Progression Systems (unlockable starting decks, basic cosmetics).
   ⦁ [ ] Full Act 2 Enemy Bestiary and Story Structure.
   ⦁ [ ] A/B testing framework for DDA validation.
   ⦁ [ ] Performance optimization for game mechanics and AI.
   Phase 4: Final Content & Web3 Integration (Weeks 13-16)
   ⦁ [ ] Full Act 3 Enemy Bestiary and Story Structure with multiple endings.
   ⦁ [ ] Implementation of Rare and Legendary Enhancement Cards and Relics.
   ⦁ [ ] Full Progression Systems (all unlocks, daily/weekly challenges).
   ⦁ [ ] Basic blockchain connectivity (wallet integration, read-only smart contract data).
   ⦁ [ ] NFT integration for enhancement cards (conceptual or basic implementation).
   Phase 5: Testing & Documentation (Weeks 17-20)
   ⦁ [ ] Comprehensive testing suite for all game mechanics and DDA.
   ⦁ [ ] Performance benchmarking and optimization for final deployment.
   ⦁ [ ] Thorough thesis documentation, including methodology, results, and analysis.
   ⦁ [ ] Final presentation preparation and demonstration.
   Key Constraints & Considerations
   Academic Requirements
   ⦁ Original Research: Novel application of ML to card game difficulty.
   ⦁ Measurable Results: Quantitative analysis of algorithm effectiveness on player engagement and win rates.
   ⦁ Reproducible: Clear methodology and code for replication of both game mechanics and DDA.
   ⦁ Ethical: Responsible data collection and player privacy.
   Technical Constraints
   ⦁ Web Deployment: Must run efficiently in browsers, balancing visual fidelity with performance.
   ⦁ Mobile Compatibility: Responsive design for various screen sizes, ensuring touch controls are intuitive.
   ⦁ Accessibility: Support for keyboard navigation and screen readers where feasible.
   ⦁ Scalability: Architecture supports future feature additions and potential expansion (e.g., more cards, enemies, acts).
   Time Management
   ⦁ Thesis Priority: Academic requirements come first, ensuring sufficient time for research and analysis.
   ⦁ Iterative Development: Working prototypes at each milestone, allowing for early feedback and adjustments.
   ⦁ Risk Management: Identify and mitigate potential roadblocks, especially with complex ML integration or blockchain.
   ⦁ Documentation: Continuous documentation throughout development is crucial for thesis writing.
   Success Criteria
   Minimum Viable Product (MVP)
   ⦁ [ ] Functional card game with all core mechanics (combat, poker hands, enhancements, relics).
   ⦁ [ ] Basic enemy AI opponents for Act 1.
   ⦁ [ ] Working DDA system with measurable impact on win rates.
   ⦁ [ ] Data collection and analysis framework for player behavior.
   ⦁ [ ] Basic Web3 integration (e.g., displaying NFT card data).
   Thesis Requirements
   ⦁ [ ] Novel ML algorithm implementation for DDA, clearly described and justified.
   ⦁ [ ] Comprehensive dataset collection and analysis from actual gameplay.
   ⦁ [ ] Statistical validation of DDA approach effectiveness on player engagement and target win rates.
   ⦁ [ ] Comparison of the custom DDA method with existing difficulty adjustment strategies.
   ⦁ [ ] Clear documentation of game mechanics and their interaction with the DDA.
   Stretch Goals
   ⦁ [ ] Advanced neural network architectures for DDA, exploring more complex player models.
   ⦁ [ ] Real-time multiplayer capability for competitive play.
   ⦁ [ ] Sophisticated blockchain integration with full play-to-earn mechanics and decentralized governance.
   ⦁ [ ] Publication-ready research results, demonstrating significant contributions to the field.
   AI Assistant Guidelines
   When Providing Code
   ⦁ Use TypeScript with strict typing, adhering to the specified file structure.
   ⦁ Include comprehensive comments, especially for game mechanics and DDA logic.
   ⦁ Follow established patterns and interfaces, recommending new ones as needed for clarity.
   ⦁ Provide error handling and validation, particularly for player inputs and data integrity.
   When Discussing ML Approaches
   ⦁ Focus on practical, implementable solutions suitable for web deployment.
   ⦁ Consider web deployment constraints (model size, inference speed) and suggest optimizations.
   ⦁ Emphasize measurable outcomes and how to design experiments to validate them.
   ⦁ Suggest validation methodologies, including A/B testing and statistical analysis.
   When Planning Features
   ⦁ Prioritize thesis requirements and the core game loop.
   ⦁ Consider implementation complexity and suggest incremental development approaches.
   ⦁ Balance academic rigor with practical feasibility, ensuring features contribute to both.
   ⦁ Suggest how each game mechanic can feed into or be influenced by the DDA system.
   When Reviewing Progress
   ⦁ Assess against milestone objectives for both game mechanics and DDA.
   ⦁ Identify potential research contributions and opportunities for deeper analysis.
   ⦁ Suggest optimization opportunities for both performance and DDA effectiveness.
   ⦁ Recommend testing strategies for individual mechanics and the integrated system.
   This document should be updated as the project evolves and new requirements emerge. All AI assistance should align with these core objectives while maintaining flexibility for academic discovery and technical innovation.
