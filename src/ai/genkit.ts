import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [googleAI({ apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY_ALT || process.env.GOOGLE_GENAI_API_KEY_ALT })],
  model: 'googleai/gemini-2.5-flash',
});

// Deployment Version: 2.5.3 (Final Restoration)





