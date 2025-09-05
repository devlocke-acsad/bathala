/**
 * Enemy Lore Data for Bathala
 * Based on Filipino mythology creatures
 */

export interface EnemyLore {
  id: string;
  name: string;
  description: string;
  mythology: string;
  abilities: string[];
  weakness: string;
}

// Common Enemies
export const TIKBALANG_LORE: EnemyLore = {
  id: "tikbalang",
  name: "Tikbalang",
  description: "A creature with the head of a horse and the body of a human, known for playing pranks on travelers by making them lost in the forest.",
  mythology: "In Philippine folklore, the Tikbalang is a creature that inhabits forests and mountains. It is said to be a guardian of the forest and will lead travelers astray if they disrespect nature. Despite its mischievous nature, it can be befriended by showing respect.",
  abilities: [
    "Forest Navigation: Can move through dense forests without getting lost",
    "Illusion Casting: Can create mirages to confuse travelers",
    "Enhanced Speed: Much faster than humans in forest terrain"
  ],
  weakness: "Salt and respect - leaving an offering of salt or showing respect to the forest will appease it"
};

export const DWENDE_LORE: EnemyLore = {
  id: "dwende",
  name: "Dwende",
  description: "A small, magical being that lives in rocks, trees, or underground. They are generally helpful but can be mischievous if provoked.",
  mythology: "Dwende are nature spirits in Philippine mythology. They are believed to be the souls of the dead or beings from another realm. They can be benevolent or malevolent depending on how they are treated by humans.",
  abilities: [
    "Invisibility: Can become invisible at will",
    "Elemental Manipulation: Can control earth and plant elements",
    "Shape-shifting: Can change form to appear as different creatures"
  ],
  weakness: "They can be driven away by iron objects or loud noises"
};

export const KAPRE_LORE: EnemyLore = {
  id: "kapre",
  name: "Kapre",
  description: "A giant, tree-dwelling creature that smells like tobacco and is often seen sitting atop large trees smoking a huge cigar.",
  mythology: "The Kapre is a legendary creature in Philippine folklore, described as a large, dark-skinned being that lives in large trees like balete or mango trees. Despite its intimidating appearance, it is generally not malicious but can be protective of its tree.",
  abilities: [
    "Super Strength: Can uproot entire trees",
    "Smoke Manipulation: Can create thick smoke to obscure vision",
    "Heightened Senses: Can see and hear from great distances"
  ],
  weakness: "Fire and holy water are said to drive them away"
};

export const SIGBIN_LORE: EnemyLore = {
  id: "sigbin",
  name: "Sigbin",
  description: "A creature that walks backwards and is known for its ability to become invisible. It feeds on the shadows or life force of humans.",
  mythology: "The Sigbin is a mythical creature from Philippine folklore, characterized by walking backwards and having the ability to become invisible. It is often associated with darkness and is said to feed on human shadows or life force.",
  abilities: [
    "Invisibility: Can become completely invisible",
    "Shadow Draining: Can drain life force from shadows",
    "Backwards Movement: Moves in reverse, making it difficult to track"
  ],
  weakness: "Tying a rope around its ankles will trap it when it becomes visible"
};

export const TIYANAK_LORE: EnemyLore = {
  id: "tiyanak",
  name: "Tiyanak",
  description: "A creature that appears as a crying baby to lure people into taking care of it, then reveals its true form and attacks.",
  mythology: "The Tiyanak is a creature from Philippine folklore that takes the form of a newborn baby. It is often found abandoned and crying, waiting for someone to take care of it. Once picked up, it reveals its true form and attacks its rescuer.",
  abilities: [
    "Shapeshifting: Can appear as a helpless baby",
    "Deception: Can convincingly mimic human emotions",
    "Surprise Attack: Can strike when least expected"
  ],
  weakness: "Holy water and prayers can repel it"
};

// Elite Enemies
export const MANANANGGAL_LORE: EnemyLore = {
  id: "manananggal",
  name: "Manananggal",
  description: "A vampire-like creature that can sever its upper torso from its lower body and fly using bat-like wings.",
  mythology: "The Manananggal is one of the most feared creatures in Philippine folklore. It is a self-segmenting vampire that can detach its upper body and fly in search of prey. It is particularly dangerous to pregnant women and newborns.",
  abilities: [
    "Flight: Can fly using bat-like wings",
    "Body Segmentation: Can separate upper torso from lower body",
    "Blood Draining: Feeds on human blood, especially from pregnant women",
    "Shapeshifting: Can appear as a beautiful woman during the day"
  ],
  weakness: "Salt, garlic, and scattered rice can prevent it from reattaching its body parts"
};

export const ASWANG_LORE: EnemyLore = {
  id: "aswang",
  name: "Aswang",
  description: "A collective term for various shape-shifting evil creatures in Philippine folklore that feed on human flesh or blood.",
  mythology: "Aswang is a collective term for various evil creatures in Philippine folklore. They are known for their ability to shapeshift and are particularly dangerous because they can appear as ordinary humans during the day. They are often associated with black magic and cannibalism.",
  abilities: [
    "Shapeshifting: Can appear as ordinary humans or various animals",
    "Flight: Can fly in bat or giant bird form",
    "Blood Sucking: Can drain blood from victims",
    "Cannibalism: Feeds on human flesh, especially of the recently deceased"
  ],
  weakness: "Blessed objects, garlic, and prayers can repel them"
};

export const DUWENDE_CHIEF_LORE: EnemyLore = {
  id: "duwende_chief",
  name: "Duwende Chief",
  description: "The leader of a community of Dwende, more powerful and intelligent than regular Dwende.",
  mythology: "The Duwende Chief is the leader of the Dwende community. It is said to be more powerful and intelligent than regular Dwende, with greater control over nature and magical abilities. It is both respected and feared by other Dwende.",
  abilities: [
    "Leadership: Commands obedience from other Dwende",
    "Enhanced Magic: More powerful magical abilities than regular Dwende",
    "Earth Manipulation: Can cause earthquakes and manipulate terrain",
    "Illusion Mastery: Can create complex and realistic illusions"
  ],
  weakness: "Iron and disrespect to nature can weaken its powers"
};

// Boss
export const BAKUNAWA_LORE: EnemyLore = {
  id: "bakunawa",
  name: "Bakunawa",
  description: "A giant sea serpent or dragon that is believed to cause eclipses by attempting to swallow the sun or moon.",
  mythology: "Bakunawa is a giant sea serpent or dragon in Philippine mythology. It is believed to be the cause of eclipses, as it tries to swallow the sun or moon. In some stories, it is a transformed deity or a punishment for vanity. It is one of the most powerful creatures in Philippine folklore.",
  abilities: [
    "Eclipse Creation: Can cause solar and lunar eclipses",
    "Massive Size: Its enormous size can create tsunamis and earthquakes",
    "Elemental Control: Controls water, wind, and storm elements",
    "Immortality: Extremely long-lived and difficult to kill"
  ],
  weakness: "The creature can be driven away by making loud noises and creating chaos"
};

// Lore data structure
export const ENEMY_LORE_DATA: Record<string, EnemyLore> = {
  "tikbalang": TIKBALANG_LORE,
  "dwende": DWENDE_LORE,
  "kapre": KAPRE_LORE,
  "sigbin": SIGBIN_LORE,
  "tiyanak": TIYANAK_LORE,
  "manananggal": MANANANGGAL_LORE,
  "aswang": ASWANG_LORE,
  "duwende_chief": DUWENDE_CHIEF_LORE,
  "bakunawa": BAKUNAWA_LORE
};