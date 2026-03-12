import { GameEvent, EventContext } from "./EventTypes";
import { act1CommonPotions as commonPotions, act1UncommonPotions as uncommonPotions } from "../potions";
import { commonRelics, treasureRelics } from "../relics/Act1Relics";
import { OverworldGameState } from "../../core/managers/OverworldGameState";

export const Act1Events: GameEvent[] = [
  {
    id: "anito_shrine",
    name: "Anito Shrine",
    description: [
      "In a clearing where balete roots form a natural altar, you find a small shrine dedicated to the anito — the ancestral spirits who once guided the faithful.",
      "Offerings of rice, flowers, and tabako lie scattered at its base. The air hums with a forgotten power — Bathala's breath, still lingering in the earth.",
      "In the Tagalog tradition, the anito were not feared but honored. They were grandparents, ancestors, protectors. The engkanto's corruption has silenced most of them... but this shrine still whispers.",
      "A sense of peace washes over you. The groves remember creation.",
    ],
    choices: [
      {
        text: "Pray at the shrine. (Heal 20 HP)",
        outcome: (context: EventContext) => {
          const { player } = context;
          player.currentHealth = Math.min(player.maxHealth, player.currentHealth + 20);
          return "You kneel before the shrine and the anito's blessing flows through you like warm rain after a long drought. The old ways still work for those who remember them.";
        },
      },
      {
        text: "Meditate in silence. (Gain 15 block)",
        outcome: () => {
          const overworldState = OverworldGameState.getInstance();
          overworldState.addNextCombatBlock(15);
          return "In the silence, the anito speak — not in words, but in the hardening of your resolve. Your meditation draws strength from the earth itself, as Bathala's Lupa once taught the first babaylan.";
        },
      },
      {
        text: "Leave an offering and depart.",
        outcome: () => {
          return "You place a small offering at the shrine and bow your head. The anito do not answer — but you feel their gaze, watchful and approving. In these corrupted times, even small acts of reverence carry weight.";
        },
      },
    ],
    dayEvent: true,
  },
  {
    id: "balete_vision",
    name: "Balete Vision",
    description: [
      "A massive balete tree stands before you — its aerial roots cascading like a curtain of gnarled fingers, forming doorways within doorways.",
      "The Tagalog people knew these trees as portals to the spirit realm. Where the roots arch, the anito once crossed freely between worlds. Now those doorways shimmer with corrupted light.",
      "You feel a strange pull towards it — a whisper of ancient secrets. Something within the tree wants to be heard. Something wants to show you what the engkanto buried beneath the bark.",
    ],
    choices: [
      {
        text: "Touch the tree and accept the vision. (Upgrade a random card)",
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
            return `The balete's roots pulse with light. Visions of the uncorrupted forest flood your mind — and when you open your eyes, your ${randomCard.suit} ${currentValue} has been attuned to ${currentValue + 1}. The tree remembers what it was meant to be.`;
          }
          return "The tree's vision washes over you — memories of a forest before corruption. Though no card changes, you feel the weight of ancient knowledge settle in your bones.";
        },
      },
      {
        text: "Step away carefully. (Gain 20 Ginto)",
        outcome: (context: EventContext) => {
          const { player } = context;
          player.ginto += 20;
          return "You resist the balete's pull and back away slowly. As you do, your foot catches on something half-buried in the roots — 20 Ginto, offerings from travelers who came before you. The tree does not object. It has bigger concerns.";
        },
      },
    ],
    dayEvent: false,
  },
  {
    id: "diwata_whisper",
    name: "Diwata Whisper",
    description: [
      "A gentle breeze carries a sweet melody through the corrupted grove — untainted, impossibly pure.",
      "Between the trees, you catch a glimpse of a diwata — a nature spirit, radiant even in the forest's darkness. She flits between branches like light itself, her presence making flowers bloom in her wake.",
      "The diwata were divine guardians of specific places — each one protector of a spring, a grove, a mountain. This one survived the engkanto's corruption by hiding in the spaces between leaves.",
      "She whispers of a hidden spring where the water still runs clean, where Bathala's tears never dried.",
    ],
    choices: [
      {
        text: "Follow the whisper to the spring. (Gain a random potion)",
        outcome: (context: EventContext) => {
          const { player } = context;
          if (player.potions.length < 3) {
            const availablePotions = [...commonPotions, ...uncommonPotions];
            const randomPotion = availablePotions[Math.floor(Math.random() * availablePotions.length)];
            player.potions.push(randomPotion);
            return `The diwata guides you through a maze of uncorrupted flowers to a hidden spring. In its crystal waters, you find a ${randomPotion.name}. "Guard this well," she whispers. "The forest has few clean waters left."`;
          }
          return "The diwata leads you to the spring, but your pouch is already full. She smiles sadly and vanishes into the petals.";
        },
      },
      {
        text: "Ask the diwata for her strength instead. (Gain 2 discard charges)",
        outcome: (context: EventContext) => {
          const { player } = context;
          player.maxDiscardCharges += 2;
          return "The diwata touches your forehead with a finger of light. 'I cannot fight the corruption for you,' she whispers, 'but I can sharpen your judgment.' You gain greater tactical flexibility — the diwata's gift of clarity.";
        },
      },
    ],
    dayEvent: true,
  },
  {
    id: "forgotten_altar",
    name: "Forgotten Altar",
    description: [
      "You stumble upon a forgotten altar, half-consumed by moss and vine. Once, offerings were laid here daily — rice, tabako, flowers. Once, the community gathered here for rituals of gratitude.",
      "A single, perfect sampaguita flower lies in the center — the national flower, symbol of purity and devotion. Someone still remembers. Someone still believes.",
      "The old animist rituals are fading under the engkanto's lies, but this altar proves they are not yet dead.",
    ],
    choices: [
      {
        text: "Take the offering — the altar's power answers. (Gain a random relic)",
        outcome: (context: EventContext) => {
          const { player } = context;
          if (player.relics.length < 6) {
            const availableRelics = [...commonRelics, ...treasureRelics];
            const randomRelic = availableRelics[Math.floor(Math.random() * availableRelics.length)];
            if (!player.relics.some(r => r.id === randomRelic.id)) {
              player.relics.push(randomRelic);
            }
            return `You reach for the sampaguita — and the altar responds. Ancient power flows upward through the stone, crystallizing into ${randomRelic.name}. The animist rites still work for those who approach with respect.`;
          }
          return "The altar pulses with latent power, but you carry too many relics. The offering remains, waiting for one who has room for its gift.";
        },
      },
      {
        text: "Leave the altar undisturbed.",
        outcome: () => {
          return "You leave the sampaguita where it lies. Some sacred things should not be disturbed — the old babaylan knew this. The altar hums faintly as you depart, as if grateful for the respect.";
        },
      },
    ],
    dayEvent: true,
  },
  {
    id: "tikbalang_crossroads",
    name: "Tikbalang Crossroads",
    description: [
      "You arrive at a crossroads where the forest paths split in three directions — but something is deeply wrong.",
      "The trails shift and twist before your eyes, reversing themselves like the backward hooves of a tikbalang. A tall, horse-headed figure watches from the shadows, its eyes glinting with corrupted mischief.",
      "The Tagalog tradition says: to break a tikbalang's spell of misdirection, wear your shirt inside-out. The old stories always contained the solution alongside the danger.",
      "This one has not fully succumbed to the engkanto. It watches you, somewhere between trickster and guardian.",
    ],
    choices: [
      {
        text: "Ask the tikbalang for the true path.",
        outcome: () => {
          return "The tikbalang tilts its horse-head, considering. For a moment, the corruption flickers in its eyes — and fades. 'That way,' it says, pointing with a gnarled hand. 'I... remember guiding once. Before the whispers.' The path it indicates leads true. Somewhere deep inside, the guardian remembers.";
        },
      },
      {
        text: "Turn your shirt inside-out and choose your own path.",
        outcome: () => {
          return "You reverse your shirt as the old ones taught. The tikbalang's illusion shatters like glass — the three paths collapse into one, straight and true. The tikbalang grunts, half annoyed, half impressed. 'You know the old ways,' it mutters. 'Good. You will need them.'";
        },
      },
    ],
    dayEvent: false,
  },
  {
    id: "ancestral_echo",
    name: "Ancestral Echo",
    description: [
      "The forest falls silent — not the silence of danger, but the silence of listening.",
      "Around you, translucent figures shimmer into existence: the anito, the ancestral spirits. They do not speak with words, but with gestures, with warmth, with the feeling of a hand on your shoulder from someone who loves you.",
      "In the Tagalog worldview, the anito were not distant gods but familiar guides — grandparents, elders, the wise who came before. Even the engkanto's corruption cannot fully silence the love of ancestors.",
      "The voices recall harmony — a time before the impostor, before the lies, when kapwa connected every living thing to every spirit.",
    ],
    choices: [
      {
        text: "Listen to the ancestors' memories. (Gain Spirit Fragments)",
        outcome: (context: EventContext) => {
          const { player } = context;
          player.diamante = (player.diamante || 0) + 3;
          return "The anito share their memories: images of the uncorrupted forest, the harmony of kapwa, the truth of what was stolen. You gain 3 Spirit Fragments — crystallized ancestral wisdom.";
        },
      },
      {
        text: "Ask the ancestors for strength.",
        outcome: (context: EventContext) => {
          const { player } = context;
          player.currentHealth = Math.min(player.maxHealth, player.currentHealth + 15);
          return "The anito surround you, their spectral hands settling on your shoulders, your arms, your heart. Warmth floods through you — not healing, exactly, but restoration. The strength of those who came before. You heal 15 HP.";
        },
      },
    ],
    dayEvent: true,
  },
  {
    id: "kapre_smoke",
    name: "Kapre's Smoke",
    description: [
      "The night thickens with the unmistakable scent of burning tabako — rich, ancient, almost comforting.",
      "Through the haze, you see the ember of an enormous cigar. A kapre sits in the branches of a towering acacia tree, watching you with amber eyes. But this one is different — older, perhaps. Less corrupted.",
      "The old stories say the kapre were Bathala's appointed grove guardians. Their cigars kept evil spirits at bay. This one's smoke still carries a hint of that original purpose — protective, not choking.",
      "It does not attack. It simply watches. And waits.",
    ],
    choices: [
      {
        text: "Sit beneath the tree and share the silence. (Gain a relic)",
        outcome: (context: EventContext) => {
          const { player } = context;
          if (player.relics.length < 6) {
            const availableRelics = [...commonRelics, ...treasureRelics];
            const randomRelic = availableRelics[Math.floor(Math.random() * availableRelics.length)];
            if (!player.relics.some(r => r.id === randomRelic.id)) {
              player.relics.push(randomRelic);
            }
            return `You sit beneath the kapre's tree without fear. For a long while, neither of you speaks. Then the kapre reaches down with an enormous hand and places something in your palm — ${randomRelic.name}. "I remember what I was," it rumbles. "Guard it better than I did."`;
          }
          return "The kapre nods approvingly at your courage but sees your pockets are full. 'Come back when you have room,' it rumbles.";
        },
      },
      {
        text: "Move on quietly — do not disturb the guardian.",
        outcome: () => {
          return "You bow your head in respect and continue through the smoke. As you leave, you hear a deep, rumbling sigh from the branches above. Was it grief? Or gratitude? The kapre watches you go, cigar ember glowing like a amber star in the dark.";
        },
      },
    ],
    dayEvent: false,
  },
  {
    id: "wind_omen",
    name: "Wind Omen",
    description: [
      "A sudden gust of wind tears through the forest canopy — not the corrupted wind of the tawong lipod, but something older. Purer.",
      "Hangin, the element of air, carries omens in the Filipino tradition. The babaylan would read the wind's direction, its warmth, its scent, to divine the future.",
      "This wind carries the scent of rain before a monsoon — and something else. A warning. A premonition. The forest itself is trying to tell you something about what lies ahead.",
    ],
    choices: [
      {
        text: "Heed the warning. (Start next combat with 20 block)",
        outcome: () => {
          const overworldState = OverworldGameState.getInstance();
          overworldState.addNextCombatBlock(20);
          return "You close your eyes and listen to the wind's message. The omen is clear: danger approaches, but forewarned is forearmed. The wind fortifies you with Hangin's ancient protective blessing — 20 block for your next battle.";
        },
      },
      {
        text: "Ignore the omen and press forward.",
        outcome: () => {
          return "You push through the wind, choosing action over divination. The gust dies reluctantly, its message undelivered. Not all old wisdom requires acceptance — sometimes the path forward demands its own kind of courage.";
        },
      },
    ],
    dayEvent: true,
  },
  {
    id: "sacred_grove",
    name: "Sacred Grove",
    description: [
      "You enter a grove of ancient trees — their branches reaching skyward like hands raised in prayer.",
      "The air is still and silent, filled with a sense of reverence that the engkanto's corruption cannot touch. This place is sacred in the truest sense: set apart, protected, consecrated by faith older than memory.",
      "In the Filipino animist tradition, certain groves were considered dwelling places of the diwata and the anito. To enter was to stand in the presence of the divine. To harm a tree was to wound a spirit.",
      "The earth here holds kapwa — the sacred bond connecting all living things. You feel it beneath your feet like a heartbeat.",
    ],
    choices: [
      {
        text: "Rest in the grove's embrace. (Fully heal HP)",
        outcome: (context: EventContext) => {
          const { player } = context;
          player.currentHealth = player.maxHealth;
          return "You lay down among the roots, and the grove cradles you like a mother cradling a child. When you rise, every wound is healed, every ache soothed. The sacred earth remembers what healing means, even if the rest of the forest has forgotten.";
        },
      },
      {
        text: "Pay respects and continue your journey.",
        outcome: () => {
          return "You kneel briefly, touching the earth in gratitude. The grove acknowledges you — a subtle shift in the light, a breath of clean air, a moment of perfect silence. Then you rise and continue, carrying its peace with you like a lantern in the dark.";
        },
      },
    ],
    dayEvent: true,
  },
  {
    id: "tiyanak_wail",
    name: "Tiyanak Wail",
    description: [
      "From deep within the night forest comes a sound that stops your heart — the cry of a baby, lost and alone.",
      "Every instinct says rush to help. Every old story says run the other way.",
      "The tiyanak — spirits of infants lost between life and death — use their cries to lure the compassionate into the dark. But every legend also carries a truth: these are children who were never named, never mourned, never given peace.",
      "The cry grows more distorted, more unnatural. But beneath the distortion, the grief is real.",
    ],
    choices: [
      {
        text: "Approach carefully — the child may be real.",
        outcome: () => {
          return "You approach with caution, one hand on your cards. The forest parts to reveal — nothing. An empty clearing where the cry was loudest. But on the ground, scratched into the dirt by tiny fingers, is a symbol: the old Tagalog glyph for 'remember me.' The tiyanak was never going to attack you. It just wanted to be acknowledged.";
        },
      },
      {
        text: "Recognize the trap and avoid it.",
        outcome: () => {
          return "You recognize the deception — the distorted cry, the unnatural pull — and wisely keep your distance. But as you walk away, the crying softens into something almost peaceful. Perhaps avoiding the trap was itself a form of kindness: not engaging with the corruption, refusing to give the engkanto's weapon its target.";
        },
      },
    ],
    dayEvent: false,
  },
];
