# Bathala: A Filipino-Mythology Roguelike Card Game

This is the implementation of **Bathala**, a Filipino mythology-inspired roguelike card game featuring poker-based combat, deck-sculpting mechanics, status effects, elemental weaknesses, and a rule-based Dynamic Difficulty Adjustment (DDA) system. This project serves as a thesis focusing on the design and validation of a transparent, rule-based DDA system to maintain player "flow" through measurable performance metrics.

Built with [Phaser 3.90.0](https://github.com/phaserjs/phaser) and [Vite 6.3.1](https://github.com/vitejs/vite) for bundling with TypeScript support.

![screenshot](screenshot.png)

## 🎓 Thesis Project

This project is part of a thesis on game design and dynamic difficulty adjustment systems. The core research focuses on maintaining player "flow" using a rule-based system that adapts to performance metrics without affecting the core game experience.

## 🎮 Combat Mechanics

### Poker-Based Combat System

Bathala features a unique poker-based combat system where players form poker hands from a deck of Filipino-themed cards to execute actions:

- **Attack**: Deal damage to enemies based on hand strength
- **Defend**: Gain block (temporary shield) to absorb incoming damage
- **Special**: Execute elemental abilities with status effect applications

### Status Effects

The game includes 8 core status effects inspired by Slay the Spire:

**Buffs:**
- **💪 Strength**: Attack actions deal +3 damage per stack
- **🛡️ Plated Armor**: Gain block at start of turn, then reduces by 1 stack
- **💚 Regeneration**: Heal HP at start of turn, then reduces by 1 stack
- **✨ Ritual**: Gain +1 Strength at end of turn

**Debuffs:**
- **☠️ Poison**: Takes damage at start of turn, then reduces by 1 stack
- **⚠️ Weak**: Attack actions deal 25% less damage per stack (max 3 stacks)
- **🛡️💔 Vulnerable**: Takes 50% more damage from all sources
- **🔻 Frail**: Defend actions grant 25% less block per stack (max 3 stacks)

### Elemental System

Each enemy has predefined elemental weaknesses and resistances based on Filipino mythology:

**Elements:**
- **🔥 Apoy (Fire)**: Special action applies 3 stacks of Poison
- **💧 Tubig (Water)**: Special action heals 8 HP
- **🌿 Lupa (Earth)**: Special action grants 3 stacks of Plated Armor
- **💨 Hangin (Air)**: Special action applies 2 stacks of Weak

**Elemental Multipliers:**
- **Weakness**: 1.5× damage when using the enemy's weak element
- **Resistance**: 0.75× damage when using the enemy's resistant element
- **Neutral**: 1.0× damage for all other elements

The dominant element in your hand determines which elemental multiplier applies, adding strategic depth to card selection beyond just poker hand strength.

**For a comprehensive guide to combat mechanics, status effects, and strategies, see [COMBAT_MECHANICS_GUIDE.md](COMBAT_MECHANICS_GUIDE.md)**

## Requirements

[Node.js](https://nodejs.org) is required to install dependencies and run scripts via `npm`.

## Available Commands

| Command | Description |
|---------|-------------|
| `npm install` | Install project dependencies |
| `npm run dev` | Launch a development web server |
| `npm run build` | Create a production build in the `dist` folder |
| `npm run dev-nolog` | Launch a development web server without sending anonymous data |
| `npm run build-nolog` | Create a production build without sending anonymous data |

## Getting Started

After cloning the repo, run `npm install` from your project directory. Then, you can start the local development server by running `npm run dev`.

The local development server runs on `http://localhost:8080` by default. Please see the Vite documentation if you wish to change this, or add SSL support.

Once the server is running you can edit any of the files in the `src` folder. Vite will automatically recompile your code and then reload the browser.

## Project Structure

We have adapted the default template structure to fit our thesis project:

| Path                         | Description                                                |
|------------------------------|------------------------------------------------------------|
| `index.html`                 | Main HTML page containing the game canvas                  |
| `public/assets`              | Game sprites, audio, etc. Served directly at runtime       |
| `public/style.css`           | Global layout styles                                       |
| `src/main.ts`                | Application bootstrap                                      |
| `src/core`                   | Core game systems (combat, DDA, progression)               |
| `src/core/managers`          | Status effects, elemental affinities, relics               |
| `src/data`                   | Game data (cards, enemies, relics, potions)                |
| `src/utils`                  | Utility functions and helpers                              |
| `src/game/scenes`            | Phaser scenes (Combat, Overworld, etc.)                    |

## Documentation

- **[COMBAT_MECHANICS_GUIDE.md](COMBAT_MECHANICS_GUIDE.md)**: Player-facing guide to combat mechanics, status effects, and strategies
- **[COMBAT_SYSTEM_ARCHITECTURE.md](COMBAT_SYSTEM_ARCHITECTURE.md)**: Developer documentation for the combat system architecture
- **[PLAYTEST_GUIDE.md](PLAYTEST_GUIDE.md)**: Guide for playtesting and providing feedback

## Handling Assets

Vite supports loading assets via JavaScript module `import` statements.

This template provides support for both embedding assets and also loading them from a static folder. To embed an asset, you can import it at the top of the JavaScript file you are using it in:

```js
import logoImg from './assets/logo.png'
```

To load static files such as audio files, videos, etc place them into the `public/assets` folder. Then you can use this path in the Loader calls within Phaser:

```js
preload ()
{
    //  This is an example of an imported bundled image.
    //  Remember to import it at the top of this file
    this.load.image('logo', logoImg);

    //  This is an example of loading a static image
    //  from the public/assets folder:
    this.load.image('background', 'assets/bg.png');
}
```

When you issue the `npm run build` command, all static assets are automatically copied to the `dist/assets` folder.

## Deploying to Production

After you run the `npm run build` command, your code will be built into a single bundle and saved to the `dist` folder, along with any other assets your project imported, or stored in the public assets folder.

In order to deploy your game, you will need to upload *all* of the contents of the `dist` folder to a public facing web server.

## About log.js

If you inspect our node scripts you will see there is a file called `log.js`. This file makes a single silent API call to a domain called `gryzor.co`. This domain is owned by Phaser Studio Inc. The domain name is a homage to one of our favorite retro games.

We send the following 3 pieces of data to this API: The name of the template being used (vue, react, etc). If the build was 'dev' or 'prod' and finally the version of Phaser being used.

At no point is any personal data collected or sent. We don't know about your project files, device, browser or anything else. Feel free to inspect the `log.js` file to confirm this.

Why do we do this? Because being open source means we have no visible metrics about which of our templates are being used. We work hard to maintain a large and diverse set of templates for Phaser developers and this is our small anonymous way to determine if that work is actually paying off, or not. In short, it helps us ensure we're building the tools for you.

However, if you don't want to send any data, you can use these commands instead:

Dev:

```bash
npm run dev-nolog
```

Build:

```bash
npm run build-nolog
```

Or, to disable the log entirely, simply delete the file `log.js` and remove the call to it in the `scripts` section of `package.json`:

Before:

```json
"scripts": {
    "dev": "node log.js dev & dev-template-script",
    "build": "node log.js build & build-template-script"
},
```

After:

```json
"scripts": {
    "dev": "dev-template-script",
    "build": "build-template-script"
},
```

Either of these will stop `log.js` from running. If you do decide to do this, please could you at least join our Discord and tell us which template you're using! Or send us a quick email. Either will be super-helpful, thank you.

## Join the Phaser Community!

We love to see what developers like you create with Phaser! It really motivates us to keep improving. So please join our community and show-off your work 😄

**Visit:** The [Phaser website](https://phaser.io) and follow on [Phaser Twitter](https://twitter.com/phaser_)<br />
**Play:** Some of the amazing games [#madewithphaser](https://twitter.com/search?q=%23madewithphaser&src=typed_query&f=live)<br />
**Learn:** [API Docs](https://newdocs.phaser.io), [Support Forum](https://phaser.discourse.group/) and [StackOverflow](https://stackoverflow.com/questions/tagged/phaser-framework)<br />
**Discord:** Join us on [Discord](https://discord.gg/phaser)<br />
**Code:** 2000+ [Examples](https://labs.phaser.io)<br />
**Read:** The [Phaser World](https://phaser.io/community/newsletter) Newsletter<br />

Created by [Phaser Studio](mailto:support@phaser.io). Powered by coffee, anime, pixels and love.

The Phaser logo and characters are &copy; 2011 - 2025 Phaser Studio Inc.

All rights reserved.
