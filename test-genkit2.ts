import { ai } from './src/ai/genkit';
const fs = require('fs');
async function run() {
  try {
    await ai.generate('hello');
  } catch (err) {
    fs.writeFileSync('error.json', JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
  }
}
run();
