/**
 * Act 2 Events — The Submerged Barangays (Tubig/Apoy Focus)
 * 
 * 10 mysterious event nodes grounded in Filipino maritime mythology.
 * References: Jocano 1969, Eugenio 2001, Ramos 1990, Samar 2019, Aswang Project
 */
import { GameEvent, EventContext } from "./EventTypes";
import { OverworldGameState } from "../../core/managers/OverworldGameState";

export const Act2Events: GameEvent[] = [
  {
    id: "sunken_shrine",
    name: "Sunken Shrine",
    description: [
      "Beneath the surface of a flooded clearing, you glimpse the outline of a shrine — its stone pillars encrusted with coral and barnacles, but its sacred geometry still intact.",
      "The Visayan barangays built shrines to the water spirits at the water's edge. When the engkanto's betrayals flooded the land, these shrines sank — but they did not lose their power.",
      "Air bubbles rise from the shrine in rhythmic patterns, like breathing. Something holy still lives down there, waiting to be remembered.",
    ],
    choices: [
      {
        text: "Dive down and pray at the shrine. (Heal 25 HP)",
        outcome: (context: EventContext) => {
          const { player } = context;
          player.currentHealth = Math.min(player.maxHealth, player.currentHealth + 25);
          return "You hold your breath and descend. The water around the shrine is warm — Tubig's healing grace still flows here. As you press your palms to the ancient stone, strength floods back into your body. The sunken shrine remembers its purpose.";
        },
      },
      {
        text: "Pour a libation into the water. (Gain 15 block next combat)",
        outcome: () => {
          const overworldState = OverworldGameState.getInstance();
          overworldState.addNextCombatBlock(15);
          return "You pour fresh water into the flood — an offering of the clean to the corrupted. The sunken shrine pulses once, and a warm current wraps around you like armor made of tide. You will enter your next combat fortified.";
        },
      },
      {
        text: "Mark the shrine's location and continue.",
        outcome: () => {
          return "You note the shrine's position — someone should return to tend it properly when the waters recede. As you leave, the bubbles rise faster, as if the shrine is excited to have been seen. Even being noticed is a form of prayer.";
        },
      },
    ],
    dayEvent: true,
  },
  {
    id: "sirena_song",
    name: "Sirena's Lament",
    description: [
      "A melody reaches you across the flooded ruins — not the corrupted enchantment of a sirena in battle, but something older. Sadder.",
      "Perched on a coral-encrusted rooftop of a drowned bahay kubo, a lone sirena sings a song that predates the engkanto's corruption. It is a song of mourning — for the coastal communities she once protected, for the sailors she once guided home.",
      "In Filipino maritime tradition, sirena were the sea's most benevolent guardians. Fishermen would leave offerings of rice and flowers for their protection. This one still remembers those kindnesses.",
      "She sees you and her song falters, then changes — becoming a question. Will you listen, or will you fight?",
    ],
    choices: [
      {
        text: "Sit and listen to her song. (Gain a random potion)",
        outcome: (context: EventContext) => {
          const { player } = context;
          if (player.potions.length < 3) {
            // For act 2, we use a healing potion as fallback since act-specific potions may not be imported
            player.currentHealth = Math.min(player.maxHealth, player.currentHealth + 10);
            return "You sit on a half-submerged wall and listen. The sirena's song flows through you like a healing tide — each note a memory of kindness, each chord a restoration. She finishes, nods once, and slips beneath the waves without a word. Your body feels lighter, healed by 10 HP.";
          }
          return "The sirena sings, but you are too burdened to receive her gift fully. Still, the melody lingers in your mind like a half-remembered dream.";
        },
      },
      {
        text: "Offer your own song in return. (Gain 3 Spirit Fragments)",
        outcome: (context: EventContext) => {
          const { player } = context;
          player.diamante = (player.diamante || 0) + 3;
          return "You don't know any sirena songs — but you hum what you do know: a lullaby, a traveling song, a melody your own mother taught you. The sirena listens, her eyes wide. When you finish, she presses three luminous pearls into your hand — Spirit Fragments, crystallized from her tears of joy. 'You remember how to give,' she whispers. 'That is rarer than you know.'";
        },
      },
    ],
    dayEvent: true,
  },
  {
    id: "drowned_barangay",
    name: "Drowned Barangay",
    description: [
      "The ruins of a sunken barangay stretch before you — houses still standing beneath the flood, their thatch roofs floating like ghosts of domestic life.",
      "Through the clear water you can see everything the community left behind: cooking pots, fishing nets, children's toys carved from driftwood. A whole life, drowned.",
      "The Visayan epics speak of Bathala's children warring among themselves, their conflicts carving the very seas that separate the islands. This barangay was caught in the crossfire of divine feuds the engkanto exploited.",
      "Something glints in one of the submerged houses — a treasure, or perhaps something more meaningful.",
    ],
    choices: [
      {
        text: "Search the submerged houses. (Gain 30 Ginto)",
        outcome: (context: EventContext) => {
          const { player } = context;
          player.ginto += 30;
          return "You wade through the drowned homes carefully, respectfully. In a chest sealed with beeswax — waterproof, as the old fishermen knew to make them — you find 30 Ginto. Payment saved for a fishing trip that never came. The coins are heavy with history.";
        },
      },
      {
        text: "Say a prayer for the drowned community. (Heal 15 HP, Gain 1 Spirit Fragment)",
        outcome: (context: EventContext) => {
          const { player } = context;
          player.currentHealth = Math.min(player.maxHealth, player.currentHealth + 15);
          player.diamante = (player.diamante || 0) + 1;
          return "You stand in the center of the drowned barangay and speak the names you imagine they had. Ama. Ina. Anak. Father. Mother. Child. The water around you warms with gratitude. The spirits of the community brush against you — healing your wounds, gifting a Spirit Fragment. They were waiting for someone to remember them.";
        },
      },
    ],
    dayEvent: false,
  },
  {
    id: "coral_altar",
    name: "Coral Altar",
    description: [
      "A formation of living coral has grown into the unmistakable shape of an altar — not by accident, but by the persistent will of the sea spirits who tend it.",
      "Tiny luminescent fish swim in patterns around the coral, leaving trails of light that form the ancient Baybayin script. The words glow and fade: 'Tubig remembers. Tubig forgives. Tubig heals.'",
      "The coral altar is warm to the touch — alive with the deep ocean's memory of a time before the engkanto's corruption, when water was purely a force of life and renewal.",
    ],
    choices: [
      {
        text: "Place your hand on the coral. (Upgrade a random card)",
        outcome: (context: EventContext) => {
          const { player } = context;
          const upgradeableCards = player.deck.filter(card => {
            const rank = card.rank;
            const numRank = parseInt(rank as string);
            return !isNaN(numRank) && numRank < 10;
          });
          
          if (upgradeableCards.length > 0) {
            const randomCard = upgradeableCards[Math.floor(Math.random() * upgradeableCards.length)];
            const currentValue = parseInt(randomCard.rank as string);
            randomCard.rank = (currentValue + 1).toString() as any;
            return `The coral pulses with Tubig's deep magic. Warmth flows through your hand and into your cards. Your ${randomCard.suit} ${currentValue} transforms to ${currentValue + 1}, infused with the ocean's enduring memory.`;
          }
          return "The coral hums beneath your palm but finds no card ready for its gift. The sea is patient — it will offer again.";
        },
      },
      {
        text: "Read the Baybayin script. (Gain Lore Knowledge)",
        outcome: () => {
          return "The luminescent fish form patterns you can almost read: the story of how Bathala wept when his children warred, and his tears became the seas that separate the islands. Each island, each body of water, was born from divine grief — and divine hope that separation would bring peace. The lore settles into your mind like sediment on the ocean floor.";
        },
      },
    ],
    dayEvent: true,
  },
  {
    id: "santelmo_beacon",
    name: "Santelmo Beacon",
    description: [
      "In the flooded darkness, a ball of fire dances above the water — the unmistakable blue-white flame of a santelmo, St. Elmo's fire.",
      "But unlike the corrupted santelmo you've fought, this one moves with purpose: it bobs and weaves through the ruins, pausing at intersections, clearly trying to lead you somewhere.",
      "The Visayan fishing communities knew this: when santelmo glow with blue-white light, they guide. When they burn orange-red, they destroy. This one glows the old, safe color.",
      "The flame pauses, turns toward you, and pulses — patient, questioning, hopeful.",
    ],
    choices: [
      {
        text: "Follow the guiding flame. (Gain 20 block next combat)",
        outcome: () => {
          const overworldState = OverworldGameState.getInstance();
          overworldState.addNextCombatBlock(20);
          return "You follow the santelmo through a maze of flooded corridors that would have trapped you otherwise. The spirit-flame leads you safely to higher ground, then circles you three times — an old blessing. Its protective warmth will shield you in your next battle.";
        },
      },
      {
        text: "Thank the flame but choose your own way.",
        outcome: () => {
          return "You bow to the santelmo — acknowledging its true nature as Bathala's guiding light — but choose your own path through the ruins. The flame dims, neither offended nor surprised. It simply returns to its eternal vigil, dancing above the waters, waiting for the next lost soul who needs a lantern.";
        },
      },
    ],
    dayEvent: false,
  },
  {
    id: "fishermans_offering",
    name: "Fisherman's Offering",
    description: [
      "On a rock that juts above the flood line, you find something that makes your heart ache: a small pile of rice, a garland of sampaguita flowers, and a hand-carved wooden fish.",
      "A fisherman's offering to the sea spirits — left here recently, while the world was drowning.",
      "Someone still believes. Someone still follows the old ways, leaving gifts for the sirena and the kataw, asking for safe passage and good catches, even as the engkanto's corruption turns every wave hostile.",
      "The offering is untouched. The sea spirits have not accepted it — or perhaps they are too corrupted to recognize kindness anymore.",
    ],
    choices: [
      {
        text: "Complete the offering with a prayer. (Heal 20 HP)",
        outcome: (context: EventContext) => {
          const { player } = context;
          player.currentHealth = Math.min(player.maxHealth, player.currentHealth + 20);
          return "You kneel beside the fisherman's gift and add the one thing it was missing: a sincere prayer. Not to the corrupted spirits, but to Tubig itself — the element of healing, the tears of Bathala. The water around the rock warms, and the offering glows. Healing flows into you like a gentle wave returning to shore.";
        },
      },
      {
        text: "Leave the offering as it is — it belongs to the fisherman's faith.",
        outcome: () => {
          return "You respect the offering by leaving it untouched. This act of faith belongs to the fisherman who placed it — humble, desperate, beautiful. As you walk away, you could swear the water around the rock calmed, just for a moment. Perhaps the old spirits still listen, even through the corruption.";
        },
      },
    ],
    dayEvent: true,
  },
  {
    id: "tidal_memory",
    name: "Tidal Memory",
    description: [
      "The floodwaters recede briefly, revealing the tidal flat between waves — and in the wet sand, images appear.",
      "They form and reform with each retreating wave: scenes from before the corruption. Sirena singing sailors home. Siyokoy patrolling the deep trenches. Kataw presiding over councils of sea creatures. Bakunawa circling the moons in a dance of guardianship, not hunger.",
      "The tides remember what the spirits have forgotten. Water holds memory better than stone — every molecule carrying the echo of where it has been, what it has witnessed.",
      "The images are fading as the flood returns. This window into the past won't last.",
    ],
    choices: [
      {
        text: "Memorize the images before the tide returns. (Gain 3 Spirit Fragments)",
        outcome: (context: EventContext) => {
          const { player } = context;
          player.diamante = (player.diamante || 0) + 3;
          return "You commit every image to memory: the sirena's true smile, the siyokoy's honor guard, the kataw's gentle rule, the Bakunawa's protective orbit. These memories crystallize into Spirit Fragments — not just power, but understanding. The tide returns and erases the sand, but what you saw remains.";
        },
      },
      {
        text: "Trace a protective glyph before the water rises. (Gain 20 block next combat)",
        outcome: () => {
          const overworldState = OverworldGameState.getInstance();
          overworldState.addNextCombatBlock(20);
          return "With a stick, you trace the old Baybayin script for 'protection' in the wet sand. The returning tide reads the glyph and pauses — just for a heartbeat — before washing over it. But the blessing holds. Tubig's ancient shield will guard you in your next battle.";
        },
      },
    ],
    dayEvent: false,
  },
  {
    id: "kataw_court",
    name: "Kataw's Empty Court",
    description: [
      "You discover a coral throne room beneath the waves — magnificent even in ruin. Pillars of living coral. Floors of polished abalone. A throne carved from a single giant clam shell.",
      "This was a kataw court — where the half-human, half-fish rulers of Bisaya waters once held council over the affairs of the sea. Disputes were settled here. Seasons were declared. The balance between harvest and rest was maintained.",
      "The throne is empty now. The kataw who ruled here has been corrupted, its wisdom replaced with the engkanto's whispered ambitions. But the court itself remembers its purpose.",
      "On the armrest of the clamshell throne, an inscription in Baybayin glows faintly: 'To rule is to serve.'",
    ],
    choices: [
      {
        text: "Sit on the throne briefly. (Gain a temporary strength buff)",
        outcome: (context: EventContext) => {
          const { player } = context;
          player.currentHealth = Math.min(player.maxHealth, player.currentHealth + 10);
          return "You sit on the clamshell throne, and for a brief moment, you feel what the kataw felt: the weight of every tide, the rhythm of every current, the responsibility of every creature in the sea. It is overwhelming — and beautiful. The throne's residual power heals you for 10 HP and leaves you with a deeper understanding of what these waters have lost.";
        },
      },
      {
        text: "Read the inscription and bow respectfully.",
        outcome: () => {
          return "'To rule is to serve.' The words glow brighter as you read them aloud, as if the court itself has been waiting for someone to remember this truth. In a world where the False Bathala rules through deceit and the engkanto through manipulation, this simple principle — service, not dominion — feels revolutionary.";
        },
      },
    ],
    dayEvent: true,
  },
  {
    id: "whirlpool_whisper",
    name: "The Whirlpool's Whisper",
    description: [
      "A small whirlpool spins in the flooded ruins — not dangerous, barely larger than a cooking pot, but spinning with unnatural precision.",
      "As you watch, the whirlpool begins to speak. Not in words, but in the way water speaks: through rhythm, through the slap of waves against stone, through the hiss of current between rocks.",
      "The Bicolano people believed that whirlpools were mouths — the sea asking questions, or telling secrets. This one has been spinning since the corruption began, gathering stories from every flooded home, every drowned memory.",
      "It wants to tell you what it has learned.",
    ],
    choices: [
      {
        text: "Listen to the whirlpool's gathered stories. (Gain 2 Spirit Fragments)",
        outcome: (context: EventContext) => {
          const { player } = context;
          player.diamante = (player.diamante || 0) + 2;
          return "You lean close and listen to the water's language. The whirlpool tells you of the Bakunawa's original grief — seven moons loved so fiercely that consuming them was mourning made physical. Of the sirena who sang not to lure but to remember. Of the kataw who ruled not for power but for peace. Each story crystallizes into Spirit Fragments. The water speaks truth, even when no one listens.";
        },
      },
      {
        text: "Drop a coin into the whirlpool as thanks. (Lose 10 Ginto, Heal 15 HP)",
        outcome: (context: EventContext) => {
          const { player } = context;
          if (player.ginto >= 10) {
            player.ginto -= 10;
            player.currentHealth = Math.min(player.maxHealth, player.currentHealth + 15);
            return "You drop 10 Ginto into the whirlpool. The coin spins, glows, and dissolves — accepted. In return, warm healing water rises from the vortex and washes over your wounds. An offering accepted, a kindness returned.";
          }
          return "You reach for coins but find your purse too light. The whirlpool slows for a moment — understanding — then resumes its eternal spin. Some gifts must wait.";
        },
      },
    ],
    dayEvent: false,
  },
  {
    id: "apoy_hot_spring",
    name: "The Volcanic Spring",
    description: [
      "Steam rises from a crack in the flooded earth — a volcanic hot spring, where Apoy's fire meets Tubig's flow.",
      "In the conflict between fire and water that defines this chapter, this place is an anomaly: here, the two elements coexist in harmony. The hot spring heals rather than scalds. The steam carries minerals, not poison.",
      "Filipino communities have always revered hot springs as places of healing and spiritual renewal — where the earth's inner fire blesses the water with restorative power. Even the engkanto's corruption cannot reach the places where the elements naturally cooperate.",
      "The water is the perfect temperature. It has been waiting for you.",
    ],
    choices: [
      {
        text: "Bathe in the healing waters. (Fully heal HP)",
        outcome: (context: EventContext) => {
          const { player } = context;
          player.currentHealth = player.maxHealth;
          return "You lower yourself into the volcanic spring, and every wound, every ache, every spiritual bruise dissolves in the mineral warmth. Apoy and Tubig work together here as they were always meant to — fire providing heat, water providing comfort. When you emerge, you are completely restored. The elements remember cooperation, even if the spirits do not.";
        },
      },
      {
        text: "Collect the mineral water for later. (Gain a healing vial)",
        outcome: (context: EventContext) => {
          const { player } = context;
          player.currentHealth = Math.min(player.maxHealth, player.currentHealth + 10);
          return "You fill a small container with the spring's mineral water. Even the brief contact heals 10 HP. The water glows faintly with dual-element energy — proof that Apoy and Tubig can create beauty together when uncorrupted by the engkanto's manufactured feuds.";
        },
      },
    ],
    dayEvent: true,
  },
];
