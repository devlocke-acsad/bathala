
import { Player } from "../../core/types/CombatTypes";

export interface EventContext {
  player: Player;
  scene?: any; // Reference to the Phaser scene if needed
}

export interface EventChoice {
  text: string;
  outcome: (context: EventContext) => string | void; // Returns a message or void
}

export interface GameEvent {
  id: string;
  name: string;
  description: string[]; // An array of strings to represent the dialogue
  choices: EventChoice[];
  dayEvent: boolean; // true if it's a day event, false if it's a night event
}
