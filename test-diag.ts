import { ai } from './src/ai/genkit';
const fs = require('fs');

async function test() {
  try {
    // Just try a simple generation with a model name that is known to work
    const { text } = await ai.generate({
        model: 'googleai/gemini-1.5-flash',
        prompt: 'say hi'
    });
    console.log("SUCCESS:", text);
    fs.writeFileSync('diag.txt', "SUCCESS: " + text);
  } catch (err) {
    console.error("DIAG ERROR:", err.message);
    fs.writeFileSync('diag.txt', "ERROR: " + err.message);
  }
}
test();
