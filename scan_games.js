const fs = require('fs');
const path = require('path');

const gamesDir = './src/components/games';
const outputFile = './game_states.json';

const files = fs.readdirSync(gamesDir);
const results = [];

for (const file of files) {
  if (file.endsWith('.tsx') || file.endsWith('.ts')) {
    const content = fs.readFileSync(path.join(gamesDir, file), 'utf8');
    const hasFinishedState = content.includes("'finished'") || content.includes('"finished"');
    const setFinishedCalls = [];
    
    // Find lines setting state to finished
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('finished') && (lines[i].includes('setGameState') || lines[i].includes('setGameState('))) {
        setFinishedCalls.push({ line: i + 1, text: lines[i].trim() });
      }
    }
    
    results.push({
      file,
      hasFinishedState,
      setFinishedCalls
    });
  }
}

fs.writeFileSync(outputFile, JSON.stringify(results, null, 2), 'utf8');
console.log('Done scanning game states. Output written to:', outputFile);
