/**
 * Act 3 Events — The Skyward Citadel (Multi-Element Focus)
 * 
 * 10 mysterious event nodes grounded in Filipino celestial mythology.
 * References: Jocano 1969, Eugenio 2001, Ramos 1990, Samar 2019, Aswang Project
 */
import { GameEvent, EventContext } from "./EventTypes";
import { OverworldGameState } from "../../core/managers/OverworldGameState";

export const Act3Events: GameEvent[] = [
  {
    id: "celestial_anito",
    name: "Celestial Anito",
    description: [
      "High above the cloudline, a spirit shrine floats unsupported — built of light and memory, its pillars carved from crystallized starlight.",
      "This is a celestial anito shrine, where the sky spirits once communed with Bathala directly. The air here tastes of ozone and old prayers.",
      "In Tagalog cosmogony, the anitos of the sky were the most powerful — mediators between the Supreme Being and the earthbound spirits. Their shrines existed in Bathala's dream-realm, accessible only to those who proved themselves worthy across earth, sea, and sky.",
      "The shrine pulses with multi-element energy, recognizing your journey through all three realms.",
    ],
    choices: [
      {
        text: "Pray at the celestial shrine. (Gain a random relic)",
        outcome: (context: EventContext) => {
          const { player } = context;
          player.currentHealth = Math.min(player.maxHealth, player.currentHealth + 15);
          return "You kneel before the floating shrine and offer a prayer that encompasses all four elements — earth's steadiness, water's flow, fire's passion, wind's freedom. The celestial anito responds with warmth: 15 HP restored. The sky spirits have not forgotten their role as healers of the worthy.";
        },
      },
      {
        text: "Study the shrine's construction. (Gain 3 Spirit Fragments)",
        outcome: (context: EventContext) => {
          const { player } = context;
          player.diamante = (player.diamante || 0) + 3;
          return "The shrine's architecture defies physical law — pillars that support nothing, arches that curve into themselves, doorways that open onto pure sky. But there is order here: Bathala's order, the geometry of creation itself. Understanding it — even partially — crystallizes into 3 Spirit Fragments. This is how the divine builds: not with stone and mortar, but with intention and belief.";
        },
      },
    ],
    dayEvent: true,
  },
  {
    id: "storm_omen",
    name: "Storm Omen",
    description: [
      "The sky darkens without warning — not with clouds, but with the shadow of something immense passing between you and the sun.",
      "For a heartbeat, the world goes dark. Then light returns, but changed: reddened, ominous. This is a Minokawa shadow — the cosmic bird that devours celestial bodies to announce great change.",
      "The Bagobo people knew this omen: when the Minokawa's shadow falls, the balance between worlds is about to shift. In the original myths, communities would bang pots and drums to frighten the bird away from the sun and moon.",
      "You have no drums. But you have will.",
    ],
    choices: [
      {
        text: "Stand firm against the shadow. (Gain 25 block next combat)",
        outcome: () => {
          const overworldState = OverworldGameState.getInstance();
          overworldState.addNextCombatBlock(25);
          return "You plant your feet and refuse to cower as the Minokawa's shadow sweeps over you. The cosmic bird — or its echo — passes overhead with a sound like tearing silk. Your defiance impresses the sky spirits. A shield of celestial energy settles around you, granting 25 block for your next combat.";
        },
      },
      {
        text: "Read the omen's meaning. (Gain insight into what lies ahead)",
        outcome: () => {
          return "You study the shadow's shape and direction. The Minokawa's passage reveals the Skyward Citadel's layout like a map drawn in negative space: the False Bathala waits at the convergence of all elements, weaving stolen power into a mockery of creation. The omen tells you: what was fused wrongly can be separated. What was separated wrongly can be reunited. The path to truth runs through all four elements.";
        },
      },
    ],
    dayEvent: false,
  },
  {
    id: "divine_sibling",
    name: "The Siblings' Feud",
    description: [
      "You stumble upon a mural painted on clouds — impossible, yet here. It depicts two figures locked in combat: one blazing with the sun's fire, the other glowing with the moon's silver light.",
      "Apolaki and Mayari — brother and sister, children of Bathala, who fought over the right to rule the sky. Their battle was so fierce it cost Mayari an eye, which is why the moon shines less brightly than the sun.",
      "The engkanto exploited this divine feud, using it as a template for the manufactured conflicts that corrupt the islands. If even Bathala's own children could not find peace, what hope do lesser spirits have?",
      "The mural seems to shift as you watch, as if offering you a choice in the ancient story.",
    ],
    choices: [
      {
        text: "Touch the mural and choose unity. (Upgrade a card)",
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
            return `You press your hand against the mural and will the siblings to reconcile. The painted figures pause their eternal battle, turning to face you. For one shimmering moment, sun and moon shine together — and the dual light infuses your ${randomCard.suit} ${currentValue}, upgrading it to ${currentValue + 1}. The siblings resume their fight. But you saw the possibility.`;
          }
          return "You touch the mural, but the siblings' feud is too ancient for your current abilities to mend. Still, your attempt is noted — the painted figures seem slightly less hostile as you withdraw.";
        },
      },
      {
        text: "Meditate on the lesson of the feud. (Gain 2 Spirit Fragments)",
        outcome: (context: EventContext) => {
          const { player } = context;
          player.diamante = (player.diamante || 0) + 2;
          return "You sit before the cloud-mural and contemplate: Apolaki was not wrong to want to rule, nor was Mayari. Their error was believing only one could hold power. The engkanto — and the False Bathala — repeat this error on a cosmic scale. The insight crystallizes into 2 Spirit Fragments. True power is shared, not seized.";
        },
      },
    ],
    dayEvent: true,
  },
  {
    id: "sarimanok_flight",
    name: "Sarimanok in Flight",
    description: [
      "A flash of impossible color cuts across the citadel sky — a sarimanok, the ornate fortune-bird of Maranao legend, its plumage a riot of every hue that fire and light can produce.",
      "The sarimanok circles you once, twice, three times — the traditional number of blessings — then alights on a nearby spire, regarding you with intelligence that borders on omniscience.",
      "In Maranao culture, the sarimanok is the supreme symbol of good fortune. Its image adorns the most sacred spaces, and to see one in flight is the rarest of blessings. This one carries something in its beak: a feather from its own plumage, glowing with multi-element energy.",
      "It drops the feather. You watch it drift down toward you, spinning lazily in the citadel winds.",
    ],
    choices: [
      {
        text: "Catch the feather. (Gain 4 Spirit Fragments)",
        outcome: (context: EventContext) => {
          const { player } = context;
          player.diamante = (player.diamante || 0) + 4;
          return "You snatch the feather from the air with reverent hands. It pulses with four-fold energy — every element singing in harmony within a single plume. The sarimanok shrieks with approval and vanishes in a burst of golden light, leaving 4 Spirit Fragments in the feather's wake. Fortune favors you today.";
        },
      },
      {
        text: "Let the feather land naturally. (Heal 15 HP)",
        outcome: (context: EventContext) => {
          const { player } = context;
          player.currentHealth = Math.min(player.maxHealth, player.currentHealth + 15);
          return "You let the feather choose where to land. It settles on your chest, directly over your heart, and dissolves into warm light. The sarimanok's fortune flows through you — not as power, but as restoration. 15 HP healed. The fortune-bird trills a note of satisfaction and soars away. Some gifts are best received with open hands.";
        },
      },
    ],
    dayEvent: true,
  },
  {
    id: "comet_trail",
    name: "Comet Trail",
    description: [
      "A trail of light stretches across the citadel sky — the wake of a bulalakaw, a comet-like omen bird, its passage leaving afterimages in the air that linger like unspoken prophecies.",
      "The light-trail forms patterns as it fades: symbols, faces, scenes from a future that may or may not come to pass. This is how the bulalakaw communicate — not through speech, but through the stories their flight-paths write across the sky.",
      "In pre-colonial Filipino divination, the bulalakaw's appearance signaled great change. Whether that change was blessing or calamity depended entirely on the interpreter.",
      "The patterns are fading. You must choose quickly what to make of them.",
    ],
    choices: [
      {
        text: "Interpret the trail as a blessing. (Upgrade a random card)",
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
            return `You choose to see the bulalakaw's trail as a sign of hope. And belief shapes reality in Bathala's realm: the light-patterns converge on your deck, upgrading your ${randomCard.suit} ${currentValue} to ${currentValue + 1}. The comet's trail fades completely, its prophecy fulfilled.`;
          }
          return "The trail fades before it can touch your cards, but the warmth of its passage lingers.";
        },
      },
      {
        text: "Study the trail for warnings about the False Bathala.",
        outcome: () => {
          return "You search the fading patterns for intelligence about the False Bathala. The light-trail reveals fragmentary visions: a serpent's body fused with shining wings, a coconut tree growing upside-down with roots in the sky, a throne built from stolen identities. The False Bathala is not one being but two — Ulilang Kaluluwa and Galang Kaluluwa — fused by engkanto sorcery into a mockery of the Supreme Being. This knowledge may prove crucial.";
        },
      },
    ],
    dayEvent: false,
  },
  {
    id: "thunder_shrine",
    name: "Thunder Shrine",
    description: [
      "Lightning strikes the same spot seven times in rapid succession — each bolt leaving behind a stone pillar. When the thunder clears, a shrine stands where moments ago there was only empty sky.",
      "This is a Ribung Linti shrine — built by the Ilocano lightning spirits through pure elemental force. The stones still crackle with static, and your hair stands on end as you approach.",
      "The Ilocano people revered the thunder spirits as divine messengers — their bolts carrying Bathala's will across the sky. When the thunder spoke, the wise listened.",
      "The shrine hums with barely contained energy, as if waiting for someone to complete its purpose.",
    ],
    choices: [
      {
        text: "Channel the shrine's energy. (Gain 20 Ginto and 15 block)",
        outcome: (context: EventContext) => {
          const { player } = context;
          player.ginto += 20;
          const overworldState = OverworldGameState.getInstance();
          overworldState.addNextCombatBlock(15);
          return "You reach out and touch the lightning-forged stone. Energy surges through you — not destructive, but purposeful. The Ribung Linti spirits recognize your quest and grant their aid: 20 Ginto materialize from the crackling air, and a shield of storm-energy settles around you. The thunder spirits of Ilocos remember their duty, even when the world forgets.";
        },
      },
      {
        text: "Leave an offering of gratitude. (Gain 3 Spirit Fragments)",
        outcome: (context: EventContext) => {
          const { player } = context;
          player.diamante = (player.diamante || 0) + 3;
          return "You have nothing physical to offer a shrine made of lightning. So you offer the only worthy gift: truth. You speak aloud what you know — that the False Bathala is a fusion of slain spirits, that the engkanto's deception has gone too far, that you will set things right. The shrine flares white, and 3 Spirit Fragments crystallize from the electric air. Truth is the highest offering.";
        },
      },
    ],
    dayEvent: false,
  },
  {
    id: "sky_anito",
    name: "Sky Anito's Vision",
    description: [
      "A translucent figure materializes in the citadel air — neither fully spirit nor fully flesh, but somewhere between: a sky anito, one of the celestial ancestors.",
      "The anito's form flickers between shapes: an old babaylan with knowing eyes, a young warrior with a kris blade, a mother with arms wide open. It is all of them and none of them — the collective ancestor, the combined memory of every soul that has passed into the sky-realm.",
      "In Filipino animism, the sky anitos were the most revered — ancestors who had transcended the earthly plane entirely and now served as direct advisors to Bathala. Their guidance was sought for the most important decisions.",
      "The anito speaks without moving its lips: 'You carry the weight of three realms. Let me lighten it.'",
    ],
    choices: [
      {
        text: "Accept the anito's healing. (Heal 30 HP)",
        outcome: (context: EventContext) => {
          const { player } = context;
          player.currentHealth = Math.min(player.maxHealth, player.currentHealth + 30);
          return "The sky anito places translucent hands on your shoulders, and warmth floods through you — the warmth of every hearth you've ever sat beside, every embrace you've ever received, every sunrise you've ever witnessed. 30 HP restored. 'Bathala's true children heal,' the anito whispers. 'The False One only consumes.' Then it fades, smiling, into the citadel wind.";
        },
      },
      {
        text: "Ask the anito about the False Bathala's weakness.",
        outcome: () => {
          return "The anito's expression grows grave. 'The False Bathala is Ulilang Kaluluwa — the serpent Bathala slew — fused with Galang Kaluluwa — the winged friend buried beside it. The engkanto raised them from their shared grave and merged them into a single entity. But the fusion is imperfect. The serpent nature and the winged nature still war within the impostor. That is its weakness: it is two beings pretending to be one. Divide it, and its power crumbles.'";
        },
      },
    ],
    dayEvent: true,
  },
  {
    id: "starfall_vision",
    name: "Starfall Vision",
    description: [
      "Stars begin to fall from the citadel sky — not meteorites, but actual stars, drifting down like luminous seeds, settling on every surface.",
      "Each fallen star contains a vision: a fragment of creation, a memory of when Bathala first shaped the world. You can see them playing out in miniature as the star-points glow around you.",
      "This is a starfall — a phenomenon that occurs when the celestial realm is in turmoil. The stars are not falling; they are fleeing, trying to preserve themselves against the False Bathala's corruption.",
      "Several stars drift close enough to touch, each offering a different gift.",
    ],
    choices: [
      {
        text: "Gather the fallen stars. (Gain 5 Spirit Fragments)",
        outcome: (context: EventContext) => {
          const { player } = context;
          player.diamante = (player.diamante || 0) + 5;
          return "You gather the luminous star-points in your cupped hands, feeling each one's unique memory: the first sunrise, the first rainfall, the first tree sprouting from Bathala's planted dream. 5 Spirit Fragments crystallize from the collected starlight. These are fragments of creation itself — the oldest and purest power in the cosmos.";
        },
      },
      {
        text: "Shield the stars from corruption. (Heal 20 HP)",
        outcome: (context: EventContext) => {
          const { player } = context;
          player.currentHealth = Math.min(player.maxHealth, player.currentHealth + 20);
          return "Instead of taking the stars' power, you shelter them. You cup your hands around the nearest star-points and whisper reassurance: the False Bathala will fall, the corruption will end, they can return to their rightful sky. The stars pulse with gratitude and heal your wounds — 20 HP — before drifting back upward, reinforced by your faith. Sometimes the strongest act is protection.";
        },
      },
    ],
    dayEvent: false,
  },
  {
    id: "diwata_court",
    name: "Diwata's Court",
    description: [
      "A circle of light appears in the citadel air, and within it: a garden. Impossible flowers bloom in impossible colors. Deer with golden antlers graze beside fish that swim through the air.",
      "This is a diwata's court — the personal realm of a nature guardian who has retreated here to escape the corruption below. In Filipino mythology, diwata are divine beings who own forests, seas, and mountains. Each has a domain. Each has creatures in their care.",
      "The diwata herself sits at the center of her garden, weaving light between her fingers. She looks up as you approach, and her expression shifts from wariness to recognition.",
      "'You carry Diwa Shards,' she says. 'You have walked earth, water, and now sky. You are the one the anitos spoke of.'",
    ],
    choices: [
      {
        text: "Ask the diwata for her blessing. (Heal to full HP)",
        outcome: (context: EventContext) => {
          const { player } = context;
          player.currentHealth = player.maxHealth;
          return "The diwata rises and presses her palm to your forehead. Light floods through you — elemental, divine, warm. Every wound heals. Every ache vanishes. 'The false god cannot create,' she says. 'Only steal and combine. Remember this: creation is your weapon. Kapwa is your shield. And Bathala — the true Bathala — has never abandoned you.' You are fully healed.";
        },
      },
      {
        text: "Offer to carry the diwata's message to the other realms. (Gain 4 Spirit Fragments)",
        outcome: (context: EventContext) => {
          const { player } = context;
          player.diamante = (player.diamante || 0) + 4;
          return "The diwata's eyes fill with light. 'Tell them: the guardians remember. The sirena still sing. The tikbalang still guard their crossroads. The spirit of kapwa — shared being, mutual obligation — cannot be corrupted, only hidden.' She weaves her message into 4 Spirit Fragments and places them in your hand. 'Carry these. They contain hope.' The garden fades, but the fragments remain — heavy with purpose.";
        },
      },
    ],
    dayEvent: true,
  },
  {
    id: "eclipse_harbinger",
    name: "Eclipse Harbinger",
    description: [
      "The citadel sky splits: on one side, the sun blazes; on the other, the moon glows. And between them, a darkness grows — not the absence of light, but the presence of hunger.",
      "This is the Eclipse Harbinger — the echo of every Minokawa and Bakunawa that ever devoured a celestial body. In myth, the Filipino people would create tremendous noise during eclipses, banging pots and shouting, to frighten the devouring creatures and save the sun and moon.",
      "The darkness speaks. Not with words, but with gravity — pulling at your cards, your relics, your very will.",
      "You know this feeling. This is what the False Bathala does: it consumes. It takes the scattered, the broken, the slain, and fuses them into itself.",
      "The eclipse will pass. But what you do in its shadow matters.",
    ],
    choices: [
      {
        text: "Shout defiance at the eclipse. (Gain 30 block next combat)",
        outcome: () => {
          const overworldState = OverworldGameState.getInstance();
          overworldState.addNextCombatBlock(30);
          return "You do what the ancestors taught: you SHOUT. Not in fear, but in defiance. Your voice carries the weight of three realms' worth of journey, three chapters of struggle, three Diwa Shards that prove the world can be mended. The eclipse shudders. The darkness recoils. It passes faster than it should, and in its wake, a tremendous protective energy crystallizes around you — 30 block for your next combat. The old ways still work.";
        },
      },
      {
        text: "Meditate through the darkness. (Gain 3 Spirit Fragments, Heal 10 HP)",
        outcome: (context: EventContext) => {
          const { player } = context;
          player.diamante = (player.diamante || 0) + 3;
          player.currentHealth = Math.min(player.maxHealth, player.currentHealth + 10);
          return "You sit in the eclipse's shadow and breathe. In the darkness, you find not fear but clarity: the False Bathala feeds on division, on the separation of elements, of spirits, of communities. The cure is reunion. The cure is kapwa. 3 Spirit Fragments and 10 HP — gifts from the clarity of facing darkness without flinching.";
        },
      },
    ],
    dayEvent: false,
  },
];
