import { ai } from './src/ai/genkit';
const fs = require('fs');
require('dotenv').config();

async function run() {
  try {
    await ai.generate('hello');
    console.log("SUCCESS");
  } catch (err) {
    fs.writeFileSync('error2.json', JSON.stringify({ message: err.message, status: err.status, code: err.code }, null, 2));
    console.log("ERROR SAVED");
  }
}
run();
