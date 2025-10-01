
export interface EventChoice {
  text: string;
  outcome: () => void; // This will be a function that executes the choice's outcome
}

export interface GameEvent {
  id: string;
  name: string;
  description: string[]; // An array of strings to represent the dialogue
  choices: EventChoice[];
  dayEvent: boolean; // true if it's a day event, false if it's a night event
}
