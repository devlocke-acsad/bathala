/**
 * NarrativeData.ts — Centralized narrative text for Bathala
 * 
 * Contains all story text: chapter entries, transitions, boss phase dialogue,
 * post-boss resolutions, and Landás-based endings.
 * 
 * No cutscenes — story delivered through text cards, enemy dialogue, and transitions.
 */

// ─────────────────────────────────────────────
// Chapter Entry Text Cards
// ─────────────────────────────────────────────

export interface ChapterNarrative {
  entryText: string;
  transitionToNext?: string; // Text card shown after boss defeat, before next chapter
}

export const CHAPTER_NARRATIVES: Record<number, ChapterNarrative> = {
  1: {
    entryText:
      "The forest guardians have turned. Tikbalang mislead. Kapre burn. The engkanto's lies run deep in these roots.",
    transitionToNext:
      "The forest exhales. The Lupa Diwa Shard is yours. But floodwaters stir below — the drowned barangays call.",
  },
  2: {
    entryText:
      "Beneath the tides, sea spirits war. Sirena fights siyokoy. The engkanto's betrayals have drowned kapwa in these waters.",
    transitionToNext:
      "The waters calm. The Tubig Diwa Shard is yours. Above, the skies darken. The impostor's citadel awaits — and with it, the final truth.",
  },
  3: {
    entryText:
      "The impostor sits on a throne of stolen myths. Serpent and wing, fused into a false god. Your Landás ends here — in the sky, where gods remember.",
  },
};

// ─────────────────────────────────────────────
// Opening Text (Prologue)
// ─────────────────────────────────────────────

export const PROLOGUE_TEXT =
  "Bathala is silenced. An impostor wears his face — born from the grave of a serpent and a winged spirit, twisted by engkanto lies. You are the last hope. Find the three Diwa Shards. Restore the truth.";

export const TUTORIAL_TEXT =
  "The anito wait. Your path — your Landás — will decide if the stories live or die.";

// ─────────────────────────────────────────────
// Boss Phase Dialogue (Mid-Combat)
// ─────────────────────────────────────────────

export interface BossPhaseDialogue {
  /** Triggers at this HP percentage (0.0 – 1.0) */
  hpThreshold: number;
  /** The dialogue line shown */
  text: string;
}

export interface BossNarrative {
  phases: BossPhaseDialogue[];
  /** Landás-reactive defeat dialogue */
  defeatDialogue: {
    mercy: string;   // Landás >= +5
    balance: string; // Landás -4 to +4
    conquest: string; // Landás <= -5
  };
  /** Post-boss resolution text card */
  resolution: string;
}

export const BOSS_NARRATIVES: Record<string, BossNarrative> = {
  kapre_shade: {
    phases: [
      {
        hpThreshold: 0.5,
        text: "You think cutting my tree frees you? I AM the forest! Every root, every shadow — MINE!",
      },
    ],
    defeatDialogue: {
      mercy:
        "My smoke… clears. I remember now. I was their guardian. The engkanto's poison made me forget. The grove is yours — protect it.",
      balance:
        "The smoke settles. Neither kindness nor cruelty freed me — just the turning of the wind. The Lupa Diwa Shard is yours.",
      conquest:
        "You burned my tree. The forest screams. The Shard is yours… but the roots remember violence.",
    },
    resolution:
      "The Kapre's cigar dims. The ancient grove breathes free. From the charred bark, the Lupa Diwa Shard rises — a crystallized fragment of Bathala's earthen breath.",
  },

  mangangaway: {
    phases: [
      {
        hpThreshold: 0.5,
        text: "Every blessing becomes a curse. This is how the impostor rules — by twisting truth!",
      },
    ],
    defeatDialogue: {
      mercy:
        "My hexes fade… mangangaway were healers once. The engkanto turned cures into curses.",
      balance:
        "Hexes unravel. Balance restores order.",
      conquest:
        "Your strength mirrors the impostor's.",
    },
    resolution:
      "The Mangangaway's hexes shatter. The corrupted healer falls silent.",
  },

  bakunawa: {
    phases: [
      {
        hpThreshold: 0.5,
        text: "No light left! In darkness, all promises are hollow — like the one who chained me!",
      },
    ],
    defeatDialogue: {
      mercy:
        "You didn't kill me? Bakunawa guarded the night once. The engkanto promised moon-eating meant freedom. Lies. Take the Shard — let the waters remember.",
      balance:
        "The tides settle. Neither mercy nor vengeance — just the turning of the sea. The Tubig Diwa Shard is yours.",
      conquest:
        "You killed the moon-eater. But my hunger becomes yours now. The Shard is yours. Its price, too.",
    },
    resolution:
      "The Bakunawa's coils loosen. The Tubig Diwa Shard rises from the deepest trench — a tear of Bathala, crystallized.",
  },

  false_bathala: {
    phases: [
      {
        hpThreshold: 0.5,
        text: "Your relics are nothing! The stories are mine to rewrite!",
      },
      {
        hpThreshold: 0.25,
        text: "We are one! We are— …still two. Two souls forced together. We are not Bathala. We never were. We are… victims too.",
      },
    ],
    defeatDialogue: {
      mercy:
        "You were never the enemy. Kapwa encompasses all.",
      balance:
        "The cycle turns. Neither mercy nor conquest — understanding.",
      conquest:
        "Gods win through power, not stories. I am real. I am strong.",
    },
    resolution: "", // No resolution text — goes straight to ending
  },
};

// ─────────────────────────────────────────────
// Landás-Reactive Event Node Dialogue
// ─────────────────────────────────────────────

export interface LandasEventDialogue {
  greeting: string;
  parting: string;
}

export function getEventNodeDialogue(landasScore: number): LandasEventDialogue {
  if (landasScore >= 5) {
    return {
      greeting: "Welcome, savior.",
      parting: "The anito walk with you.",
    };
  } else if (landasScore <= -5) {
    return {
      greeting: "Your blood is heavy, conqueror.",
      parting: "The anito worry.",
    };
  }
  return {
    greeting: "Traveler. Your path takes no side.",
    parting: "Balance guides you.",
  };
}

// ─────────────────────────────────────────────
// Endings (Chapter 3 Finale)
// ─────────────────────────────────────────────

export interface GameEnding {
  title: string;
  subtitle: string;
  /** Bathala's final words */
  bathalaVoice: string;
  /** Closing text card */
  finalText: string;
  /** Color theme for the ending */
  color: number;
  /** Particle tint for the ending */
  particleTint: number;
  /** Unlock description */
  unlock: string;
}

export function getEnding(landasScore: number): GameEnding {
  if (landasScore >= 5) {
    return {
      title: "Daan ng Awa",
      subtitle: "Ang Pagbabalik ng Liwanag",
      bathalaVoice:
        "You chose mercy. The tikbalang guards again. The sirena sings again. You discovered the monsters were never monsters.",
      finalText:
        "The bamboo is whole — every crack filled with story. The myths live in the hearts of those who love.",
      color: 0x2ed573,
      particleTint: 0xf5e6a3,
      unlock: "Mythological compendium unlocked — benevolent origins of every creature.",
    };
  } else if (landasScore <= -5) {
    return {
      title: "Daan ng Panlulupig",
      subtitle: "Ang Bagong Trono",
      bathalaVoice:
        "You won — but the tikbalang are dead. The sirena silent. You killed the monsters — and with them, the stories. A world without stories is a world of monsters.",
      finalText:
        "The bamboo is cut — weapon, not life. The throne is high, but cold. In the silence, one question remains: who was the real impostor?",
      color: 0xff4757,
      particleTint: 0x8b0000,
      unlock: "Cautionary myth entries unlocked — darker versions of each creature's mythology.",
    };
  }
  return {
    title: "Daan ng Timbang",
    subtitle: "Ang Pag-ikot ng Mundo",
    bathalaVoice:
      "You chose balance. The tikbalang is both guardian and trickster. You did not change the stories — you understood them.",
    finalText:
      "The bamboo bends but does not break. No beginning, no end — only the turning. The myths endure because they are true.",
    color: 0x77888c,
    particleTint: 0xc0c0c0,
    unlock: "Dual-perspective entries unlocked — both benevolent and cautionary versions.",
  };
}

// ─────────────────────────────────────────────
// Mirror of Kapwa (Chapter 3 Mid-Chapter Event)
// ─────────────────────────────────────────────

export interface MirrorOfKapwa {
  description: string;
  cardName: string;
  cardDescription: string;
}

export function getMirrorOfKapwa(landasScore: number): MirrorOfKapwa {
  if (landasScore >= 5) {
    return {
      description: "The mirror shows every creature you spared — returning to their roles. Kapwa: every creature is part of you.",
      cardName: "Kapwa's Embrace",
      cardDescription: "Heals and buffs all elements.",
    };
  } else if (landasScore <= -5) {
    return {
      description: "The mirror shows a throne of bones. Power is the language of gods. Are you the god, or the monster?",
      cardName: "Manlulupig's Wrath",
      cardDescription: "Massive damage, costs HP.",
    };
  }
  return {
    description: "The mirror shows a balanced scale. Life and death are siblings, like day and night.",
    cardName: "Timbang",
    cardDescription: "Adapts to the situation.",
  };
}
