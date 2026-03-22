import { ai } from './src/ai/genkit';
async function run() {
  try {
    const res = await ai.generate('hello');
    console.log("SUCCESS:", res.text);
  } catch (err) {
    console.error("FULL ERROR:", err);
  }
}
run();
