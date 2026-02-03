// Test file to verify relic imports work correctly
import { act1CommonRelics, act2CommonRelics, act3CommonRelics } from "./bathala/src/data/relics";

console.log("Act 1 Common Relics:", act1CommonRelics.length);
console.log("Act 2 Common Relics:", act2CommonRelics.length);
console.log("Act 3 Common Relics:", act3CommonRelics.length);

// Verify that each act has the expected relics
if (act1CommonRelics.length > 0 && act2CommonRelics.length > 0 && act3CommonRelics.length > 0) {
  console.log("✓ All relic files imported successfully");
} else {
  console.log("✗ Error importing relic files");
}