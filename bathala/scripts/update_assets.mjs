import fs from 'fs';

const preloaderPath = 'src/game/scenes/Preloader.ts';
let preloaderCode = fs.readFileSync(preloaderPath, 'utf8');

// Match everything between "// Act 2 overworld tile set - submerged village" and the end of the load section
const startMarker = '// Act 2 overworld tile set - submerged village';
const endMarker = '    // Act 3 overworld tile set - skyward citadel (cloud platforms)';

const startIndex = preloaderCode.indexOf(startMarker);
const endIndex = preloaderCode.indexOf(endMarker, startIndex);

if (startIndex !== -1 && endIndex !== -1) {
  const act2Section = preloaderCode.slice(startIndex, endIndex);
  
  const act3Section = act2Section
    .replace(/\/\/ Act 2 overworld tile set - submerged village/g, '// Act 3 overworld tile set - skyward citadel')
    .replace(/"sv_/g, '"sc_')
    .replace(/submergedvillageAssets/g, 'skywardcitadelAssets')
    .replace(/Act 2/g, 'Act 3')
    .replace(/Submerged Village/g, 'Skyward Citadel');

  preloaderCode = preloaderCode.slice(0, endIndex) + '\n' + act3Section + preloaderCode.slice(endIndex);
  fs.writeFileSync(preloaderPath, preloaderCode, 'utf8');
  console.log('Preloader updated successfully.');
} else {
  console.log('Could not find markers in Preloader.ts');
}

// Now update MazeGenSystem to handle both
const mazeGenPath = 'src/systems/generation/MazeGenSystem.ts';
let mazeGenCode = fs.readFileSync(mazeGenPath, 'utf8');

// We need to revert the isAct2Chapter() unity and introduce getThemePrefix()
mazeGenCode = mazeGenCode.replace(
  `private isAct2Chapter(): boolean {
    const chapter = GameState.getInstance().getCurrentChapter();
    const normalized = String(chapter).toLowerCase();
    return chapter === 2 || normalized === '2' || normalized.includes('act2') || normalized.includes('chapter2') ||
           chapter === 3 || normalized === '3' || normalized.includes('act3') || normalized.includes('chapter3');
  }`,
  `private isAct2Chapter(): boolean {
    const chapter = GameState.getInstance().getCurrentChapter();
    const normalized = String(chapter).toLowerCase();
    return chapter === 2 || normalized === '2' || normalized.includes('act2') || normalized.includes('chapter2');
  }`
);

// We need to introduce isOrganicVillage() or something
mazeGenCode = mazeGenCode.replace(
  `const isAct2 = this.isAct2Chapter();`,
  `const isAct2 = this.isAct2Chapter();
    const isAct3 = this.isAct3Chapter();
    const isOrganicVillage = isAct2 || isAct3;
    const themePrefix = isAct3 ? 'sc_' : 'sv_';`
);

// And replace "isAct2" with "isOrganicVillage" where relevant for generation rendering.
// It's too complex to safely regex everything in MazeGenSystem.ts from this script.
// I'll do MazeGenSystem manually via the agent.
fs.writeFileSync(mazeGenPath, mazeGenCode, 'utf8');
console.log('MazeGenSystem partially updated. Please complete manually.');

