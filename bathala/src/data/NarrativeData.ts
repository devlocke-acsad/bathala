/**
 * NarrativeData.ts — Centralized narrative text for Bathala
 * 
 * Contains all story text: chapter entries, transitions, boss phase dialogue,
 * post-boss resolutions, Landás-based endings, and atmospheric narration.
 * 
 * All narrative grounded in Filipino mythology references:
 * - Jocano, F.L. (1969): Philippine Mythology (cosmogony, earth/wind/water creation)
 * - Eugenio, D.L. (2001): Philippine Folk Literature (creature tales, rebellion narratives)
 * - Ramos, M.D. (1990): Creatures of Philippine Lower Mythology (creature compendium)
 * - Samar, E. (2019): Philippine Mythical Creatures (regional variants)
 * - Aswang Project: Online multimedia mythology reference
 * - Treasury of Tagalog Stories: Coconut myth, creation narratives
 *
 * No cutscenes — story delivered through text cards, enemy dialogue, and transitions.
 */

// ─────────────────────────────────────────────
// Chapter Entry Text Cards
// ─────────────────────────────────────────────

export interface ChapterNarrative {
  /** Short title for the chapter */
  title: string;
  /** Atmospheric opening narration — displayed with typewriter */
  entryText: string;
  /** Extended narration slides for chapter intro (optional) */
  entrySlides?: string[];
  /** Text card shown after boss defeat, before next chapter */
  transitionToNext?: string;
  /** Narrator voice-over for the chapter's theme */
  narratorIntro?: string;
}

export const CHAPTER_NARRATIVES: Record<number, ChapterNarrative> = {
  1: {
    title: "The Corrupted Ancestral Forests",
    entryText:
      "In balete groves — portals to anito realms where Bathala's breath birthed earth and winds carried omens — the engkanto's lies twist guardians into deceivers.",
    entrySlides: [
      "The balete trees once stood as doorways between the mortal world and the spirit realm.\n\nTheir roots grew deep into Bathala's earth, and their branches reached toward the heavens where the anito dwelt in harmony.",
      "In the old stories, the Bicolano people spoke of a time when spirits rebelled against the divine order.\n\nNow those stories repeat — not as myth, but as truth unfolding before you.",
      "Tikbalang who once guided travelers now lead them astray with backward hooves.\n\nKapre who smoked in peaceful watch now burn with corrupted fury.\n\nThe engkanto's whispers have turned every guardian into a weapon.",
      "Navigate the forest's day-time harmony to attune the ancient relics.\n\nBrave the night's aggression to face the trials that await.\n\nSurvive five cycles to summon the cursed enforcer — and purify the cradle of creation.",
    ],
    transitionToNext:
      "The Mangangaway's hexes shatter like glass against stone. The forest exhales — a breath held since the engkanto first whispered their lies.\n\nFrom the purified earth, the Lupa Diwa Shard rises: a crystallized fragment of Bathala's earthen breath, warm as soil after rain.\n\nBut even as roots mend, the ground beneath your feet grows damp. Somewhere below, floodwaters stir. The drowned barangays call — and the sea spirits' betrayals run deeper than any root.",
    narratorIntro:
      "The forests remember what the world has forgotten. In every twisted root, a stolen truth. In every corrupted guardian, a story crying to be heard.",
  },
  2: {
    title: "The Submerged Barangays",
    entryText:
      "In sunken barangays — where Bathala's tears wove seas and merfolk guarded the deep — the engkanto's betrayals spark ancient feuds, drowning kapwa in deceitful tides.",
    entrySlides: [
      "The Visayan epics tell of Bathala's children who warred among themselves.\n\nSiblings pitted against siblings, their conflicts carving the very seas that separate the islands.\n\nNow those wars echo beneath the waves.",
      "Sirena who once sang sailors to safety now lure them to their doom.\n\nSiyokoy drag the drowned into their sunken kingdoms.\n\nThe engkanto's poison has turned the sea's embrace into a crushing grip.",
      "Beneath the tides, entire barangays lie submerged — their homes now haunted by spirits who have forgotten what they once protected.\n\nThe waters hold secrets and sorrows in equal measure.",
      "Attune relics in the day's calm currents.\n\nFace the fiery surges that rise with the night.\n\nSurvive five cycles to summon the lunar devourer — the great Bakunawa — and restore the depths to peace.",
    ],
    transitionToNext:
      "The Bakunawa's coils loosen as its ancient hunger finally stills. Seven moons — all that the serpent devoured in its madness — begin to reform in the sky above the waves.\n\nFrom the deepest trench, the Tubig Diwa Shard rises: a tear of Bathala, crystallized into sapphire light.\n\nThe waters calm, but above, thunder rolls across cloudless skies. The impostor's citadel hangs in the heavens like a stolen constellation — and within it, the final truth waits to be unmasked.",
    narratorIntro:
      "The sea does not forget. Every wave carries a memory, every tide a promise. In the drowned barangays, the old ways still sing — if you can hear them through the storm.",
  },
  3: {
    title: "The Skyward Citadel",
    entryText:
      "Atop the ethereal citadel — Bathala's dream-realm of omens and celestial courts — the engkanto's illusions cycle through deceptions, fracturing the very sky.",
    entrySlides: [
      "The Tagalog creation stories speak of Apolaki and Mayari — sun and moon, brother and sister.\n\nTheir balance kept the heavens in order. Their feud, born of jealousy, scarred Mayari's face and gave us the dim light of the moon.",
      "Now a greater deception eclipses even that ancient rivalry.\n\nThe False Bathala sits upon a stolen throne — a fusion of Ulilang Kaluluwa, the serpent slain by the true Bathala, and Galang Kaluluwa, the winged spirit buried alongside him.\n\nRevived by engkanto sorcery, they pervert the coconut tree's sacred gift of life.",
      "The sky creatures who once served as Bathala's messengers and guardians now bow to the impostor.\n\nTigmamanukan's prophecies are silenced. Sarimanok's fortune is twisted. Minokawa devours not just the moon, but hope itself.",
      "Infuse multi-element synergies in the day's celestial visions.\n\nSurvive the night's thunderous trials.\n\nEndure five cycles to unmask the impostor and restore divine order to the fractured heavens.",
    ],
    narratorIntro:
      "In the sky, lies are hardest to hide — yet the greatest deception of all has taken root among the clouds. The gods themselves have been fooled. Only mortal eyes, unclouded by divinity, can see the truth.",
  },
};

// ─────────────────────────────────────────────
// Opening Text (Prologue)
// ─────────────────────────────────────────────

/** Full prologue narration slides — used by Prologue scene */
export const PROLOGUE_SLIDES: string[] = [
  "In the age before memory, when the world was still young...\n\nBathala shaped the heavens with his breath.\n\nAmihan wove the seas with her song.",
  "From their divine union, the islands were born — a paradise where anito spirits of wind, water, earth, and flame danced in perfect harmony.\n\nBalance was the law of creation.\n\nKapwa — the sacred bond connecting all living things — was the foundation of existence.",
  "But in shadow, envy festered.\n\nThe engkanto — ancient spirits of illusion and deceit — whispered poison into willing ears.\n\nThey twisted the truth of Bathala's creation. Corrupted the bonds of kapwa. Shattered the sacred balance that held the world together.",
  "From the grave of Ulilang Kaluluwa — the serpent deity whom Bathala slew — and the remains of Galang Kaluluwa — the winged spirit who befriended Bathala in life — the engkanto forged an abomination.\n\nA false god. An impostor wearing Bathala's face.",
  "The coconut tree, born from the burial of these spirits as a gift of life to humanity, now weeps at the perversion of its roots.\n\nThe anito — ancestral spirits who guided the faithful — fall silent one by one.\n\nThe old stories begin to unravel.",
  "You are the Tagapagligtas — the one the elders foretold.\n\nThe sacred deck is yours to master: each card a channel of elemental power.\n\nApoy's consuming fury. Tubig's healing grace. Lupa's unyielding strength. Hangin's swift judgment.",
  "Form hands of power. Strike with the wisdom of the ancients. Choose wisely between mercy and conquest.\n\nFor in your judgment — your Landás — lies the fate of every myth, every spirit, every story that the Filipino people have told since the first bamboo split open and gave birth to Malakas and Maganda.",
  "Three Diwa Shards. Three corrupted realms. One impostor to unmask.\n\nThe corrupted forests await.\n\nThe balance trembles.\n\nYour Landás begins now.",
];

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
        hpThreshold: 0.75,
        text: "Ha! You think your little cards can match the fury of the forest? I smoked these leaves when Bathala still walked among men!",
      },
      {
        hpThreshold: 0.5,
        text: "You think cutting my tree frees you? I AM the forest! Every root, every shadow — MINE! The engkanto showed me what Bathala never did: that power grows in darkness!",
      },
      {
        hpThreshold: 0.25,
        text: "Wait... the smoke... it's clearing. I can see the old grove. The children I used to watch over... What have I become?",
      },
    ],
    defeatDialogue: {
      mercy:
        "My smoke… clears. I remember now. Before the engkanto's poison, I sat in my acacia tree and watched over the mountain trails. Travelers would leave me offerings of tabako, and I would keep their paths safe through the night. The grove is yours — protect it as I once did. The stories say Kapre are gentle giants. Make it true again.",
      balance:
        "The smoke settles. Neither kindness nor cruelty freed me — just the turning of the earth, as it has always turned. Ramos wrote of us as simple tree-lurkers, but we were something more. Take the Lupa Diwa Shard. Let balance decide what the forest becomes.",
      conquest:
        "You burned my tree — the same tree where I kept vigil for a hundred years. The forest screams with a voice older than any myth. The Shard is yours, taken by force... but the roots remember violence, traveler. They always remember.",
    },
    resolution:
      "The Kapre's cigar dims to a single ember, then fades like a dying star. The ancient grove breathes free for the first time in an age — balete roots unclenching, diwata whispering gratitude through the leaves.\n\nFrom the charred bark of the Kapre's sacred tree, the Lupa Diwa Shard rises: a crystallized fragment of Bathala's earthen breath, warm as soil after monsoon rain, pulsing with the rhythm of the land itself.",
  },

  mangangaway: {
    phases: [
      {
        hpThreshold: 0.75,
        text: "Fates reverse at my command! Every hex I cast was once a healing prayer — the engkanto taught me to speak the words backwards!",
      },
      {
        hpThreshold: 0.5,
        text: "Every blessing becomes a curse! This is how the impostor rules — by twisting truth! My skull necklace burns with stolen prayers!",
      },
      {
        hpThreshold: 0.25,
        text: "The hexes... they're turning on me. I can feel the old healing trying to break through. Was I truly a bruha, or was I a babaylan all along?",
      },
    ],
    defeatDialogue: {
      mercy:
        "My hexes fade… and beneath them, I remember. Mangangaway were not always witches. We were babaylan — healers, spiritual guides. The engkanto found our grief and twisted our prayers into curses. Every skull on my necklace was someone I tried to save. Your mercy breaks the cycle. Take what I guard — the forest's heart remembers compassion.",
      balance:
        "Hexes unravel like thread from a loom. Neither love nor hate frees me — only the natural order returning. Eugenio wrote of us as evil spellcasters, but every curse began as a prayer. Balance restores what corruption stole.",
      conquest:
        "Your strength mirrors the impostor's own — crushing force against twisted magic. My curses end, but tell me: when you break a healer, what remains? Only silence. And silence feeds the false god more than any hex I cast.",
    },
    resolution:
      "The Mangangaway's skull necklace shatters, each bone releasing a whispered prayer — the original blessings, uncorrupted, rising like smoke toward heaven.\n\nThe cursed enforcer falls silent, and in the silence, the ancestral forest breathes a collective sigh. The corruption recedes from root and branch. The Lupa Diwa Shard crystallizes from the purified earth — Bathala's foundational breath given form.",
  },

  bakunawa: {
    phases: [
      {
        hpThreshold: 0.75,
        text: "Seven moons I swallowed! Seven promises the engkanto made! 'Eat the light,' they said, 'and you will be free!' LIES — all of it, LIES!",
      },
      {
        hpThreshold: 0.5,
        text: "No light left! In darkness, all promises are hollow — like the one who chained me! The Visayan elders beat their pots and pans to scare me from the moon, but it was never hunger that drove me — it was DESPERATION!",
      },
      {
        hpThreshold: 0.25,
        text: "I can taste the moonlight again... not as prey, but as memory. Before the corruption, I guarded the tides. The fishermen sang to me, and I kept the storms at bay. What have I become?",
      },
    ],
    defeatDialogue: {
      mercy:
        "You... didn't kill me? In all the legends, the hero always drives the Bakunawa back. But you — you showed mercy to the moon-eater. Before the engkanto's poison, I was Bathala's tidal guardian. The old Bicolano stories say I loved the seven moons so fiercely that consuming them was my grief made manifest. Take the Shard — let the waters remember what I protected, not what I destroyed.",
      balance:
        "The tides settle, neither pulled by fury nor stilled by death. The Visayan people once feared me, the Bicolano people honored me — and both were right. I am the eclipse: darkness that reveals the stars. Neither mercy nor vengeance — just the eternal turning of the sea. The Tubig Diwa Shard is yours.",
      conquest:
        "You killed the moon-eater. The seven moons are free, but at what cost? My hunger does not die with me — it passes to the one who strikes the killing blow. The Shard is yours, warrior. But every time you look at the sea, remember: the Bakunawa was not always a monster. The engkanto made me one. And now my hunger is yours.",
    },
    resolution:
      "The Bakunawa's coils loosen as seven phantom moons drift upward from its open jaws — silver lights reforming in the dark water above.\n\nFrom the deepest trench of the sunken barangay, the Tubig Diwa Shard rises: a tear of Bathala crystallized into sapphire brilliance, carrying the memory of every tide, every rain, every river that flows from mountain to sea.\n\nThe submerged villages glow faintly — not with life, but with remembrance. The sea spirits' feuds quiet. The waters heal.",
  },

  false_bathala: {
    phases: [
      {
        hpThreshold: 0.75,
        text: "You dare challenge a GOD? We are Bathala reborn — serpent's cunning and wing's grace united! The coconut tree gave life to mortals, but WE gave purpose to divinity!",
      },
      {
        hpThreshold: 0.5,
        text: "Your relics are nothing! The stories are MINE to rewrite! Every myth, every legend, every prayer whispered in the dark — I will remake them all in my image!",
      },
      {
        hpThreshold: 0.25,
        text: "We are one! We are— …still two. The serpent writhes. The wings beat against themselves. We are not Bathala. We never were. Ulilang Kaluluwa died in jealousy. Galang Kaluluwa was buried in grief. The engkanto promised resurrection, but what rose from that grave was... neither. We are... victims too.",
      },
    ],
    defeatDialogue: {
      mercy:
        "You... choose mercy? For us — for the impostor? Ulilang Kaluluwa attacked Bathala from envy. Galang Kaluluwa befriended Bathala from love. One died a villain, one died a friend. The engkanto fused us into something that was neither — a mockery of the divine. You were never the enemy. Kapwa encompasses all — even the broken. Even us. Let the coconut tree grow true again.",
      balance:
        "The cycle turns. Ulilang Kaluluwa — the serpent — was chaos. Galang Kaluluwa — the winged one — was harmony. Together we were supposed to be everything. Instead we were nothing. Neither mercy nor conquest defines you — understanding does. Jocano wrote of the three gods meeting in an empty world. Two died. One grieved. And from that grief, the coconut tree gave life. Let grief become growth again.",
      conquest:
        "You choose the throne? Then take it. Ulilang Kaluluwa understood power — and it destroyed him. We were forged in violence and ended in violence. The cycle completes. But remember the old story: when Bathala buried his friend Galang Kaluluwa, a coconut tree grew from the grave — a gift of sustenance and shelter. What will grow from OUR grave, conqueror? Only you decide.",
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
      greeting: "The anito sense your compassion, wayward one. The spirits of those you spared whisper your name like a prayer.",
      parting: "Walk gently, savior. The tikbalang return to their posts, the sirena sing your name across the tides. The stories heal because of you.",
    };
  } else if (landasScore <= -5) {
    return {
      greeting: "Your shadow arrives before you, conqueror. The anito tremble — not in reverence, but in recognition. They have seen your kind before.",
      parting: "The silence you leave behind is deafening. Where myths once sang, only echoes remain. The anito wonder: who truly is the impostor?",
    };
  }
  return {
    greeting: "Traveler of the middle way, the anito watch with interest. Your Landás takes neither side — and in that neutrality, there is a wisdom older than the gods themselves.",
    parting: "Balance guides you, as it guided Bathala when he shaped the world from chaos. The stories neither flourish nor fade — they simply endure, as they always have.",
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
      subtitle: "Ang Pagbabalik ng Liwanag — The Return of Light",
      bathalaVoice:
        "You chose mercy — the hardest path, the truest path. The tikbalang returns to his mountain trail, guiding the lost with hooves that no longer deceive. The sirena sings again, not to lure, but to heal. The Bakunawa releases the moons, and the tides remember their purpose.\n\nYou discovered what the engkanto tried to erase: the monsters were never monsters. They were guardians — corrupted, yes — but beneath every curse was a prayer, and beneath every shadow, a story worth saving.\n\nKapwa endures. The bond between all living things — spirit and mortal, predator and prey, myth and truth — grows stronger because you chose to understand rather than destroy.",
      finalText:
        "The bamboo is whole — every crack filled with story, every knot a memory preserved.\n\nThe coconut tree grows tall again from the grave of the reconciled spirits, its fruit nourishing a world that remembers.\n\nIn the balete groves, the anito dance. In the drowned barangays, the merfolk sing. In the sky, Apolaki and Mayari share the heavens in peace.\n\nThe myths live — not in books, but in the hearts of those who love them enough to show mercy.",
      color: 0x2ed573,
      particleTint: 0xf5e6a3,
      unlock: "Mythological compendium unlocked — the benevolent origins of every creature, as the elders first told their stories around the fire.",
    };
  } else if (landasScore <= -5) {
    return {
      title: "Daan ng Panlulupig",
      subtitle: "Ang Bagong Trono — The New Throne",
      bathalaVoice:
        "You won — with the same fire that burned in Ulilang Kaluluwa's heart when he challenged me at the dawn of creation.\n\nThe tikbalang are dead. Their mountain trails grow wild and forgotten. The sirena float silent in the deep, their songs extinguished. The Bakunawa is slain, and the tides have no guardian.\n\nYou killed the monsters — and with them, the stories. Every creature you destroyed was a chapter torn from the book of our people. A world without stories is a world without meaning. And a world without meaning... is a world of monsters.\n\nTell me, conqueror: who sits on the throne now?",
      finalText:
        "The bamboo is cut — weapon, not life. Its hollow core echoes with the silence of myths unmade.\n\nThe coconut tree grows, but its fruit is bitter. The spirits buried beneath it find no peace, only more violence piled upon their grave.\n\nThe throne is high, but cold. The sky is clear, but empty.\n\nIn the silence of the conquered world, one question remains — whispered by the last anito as it fades into nothing:\n\nWho was the real impostor?",
      color: 0xff4757,
      particleTint: 0x8b0000,
      unlock: "Cautionary myth entries unlocked — the darker versions of each creature's mythology, and the warnings the elders gave about the price of unchecked power.",
    };
  }
  return {
    title: "Daan ng Timbang",
    subtitle: "Ang Pag-ikot ng Mundo — The Turning of the World",
    bathalaVoice:
      "You chose balance — the path I walked when I shaped the world from nothing.\n\nThe tikbalang is both guardian and trickster — as it was always meant to be. The sirena sings songs of beauty and danger in equal measure. The Bakunawa swims between the moons, neither devouring nor protecting — simply existing, as the tides exist.\n\nYou did not change the stories. You understood them. Every myth has two faces: the terror and the wonder, the warning and the wisdom. To honor both is to honor the truth of what we are.\n\nThis is the oldest lesson: the world turns, and in its turning, nothing is lost forever.",
    finalText:
      "The bamboo bends but does not break. Its roots hold firm in the earth while its branches dance with the wind — flexible, enduring, alive.\n\nThe coconut tree grows as it was meant to: from grief, a gift. From death, sustenance. From the grave of fallen spirits, life for all.\n\nNo beginning, no end — only the turning. Day and night. Mercy and conquest. Myth and reality.\n\nThe stories endure because they are true. And you endure because you understood that truth needs no throne, no army, no divine mandate.\n\nIt only needs someone who listens.",
    color: 0x77888c,
    particleTint: 0xc0c0c0,
    unlock: "Dual-perspective entries unlocked — both benevolent and cautionary versions of every myth, because the truth lives in the space between.",
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
      description: "The mirror shimmers with golden light, and within it you see every creature you spared — the tikbalang returning to its mountain trail, the sirena singing healing songs, the Bakunawa releasing moonlight across the waves.\n\nEach spirit you showed mercy to has returned to its original purpose, a guardian reborn. The mirror whispers: 'Kapwa — the sacred bond that connects all living things. Every creature is part of you, and you of them.'\n\nThe reflection smiles with Bathala's own face — the true one.",
      cardName: "Kapwa's Embrace",
      cardDescription: "Heals and buffs all elements — the sacred bond restores what was broken.",
    };
  } else if (landasScore <= -5) {
    return {
      description: "The mirror darkens to obsidian, and within it you see a throne built from the bones of every creature you slew. The tikbalang's skull crowns the armrest. The sirena's scales line the seat.\n\nPower radiates from every surface — power taken by force, by conquest, by the refusal to show weakness. The mirror whispers: 'Manlulupig — the conqueror. You chose the path of Ulilang Kaluluwa, who challenged Bathala and was destroyed by his own ambition.'\n\nThe reflection wears a familiar face. Is it the False Bathala's... or yours?",
      cardName: "Manlulupig's Wrath",
      cardDescription: "Massive damage at the cost of your own life force — power always demands a price.",
    };
  }
  return {
    description: "The mirror holds perfectly still, its surface neither bright nor dark — simply clear, like water in a sacred spring.\n\nWithin it you see the world as it truly is: creatures that are both guardian and monster, stories that are both warning and wonder, a balance that does not judge but simply IS.\n\nThe mirror whispers: 'Timbang — the scales of creation. Day and night. Life and death. Mercy and might. Bathala shaped the world from all of these, and none outweighs the other.'\n\nThe reflection shows no face — only light, turning.",
    cardName: "Timbang",
    cardDescription: "Adapts to the situation — embodying the balance of all elements.",
  };
}
