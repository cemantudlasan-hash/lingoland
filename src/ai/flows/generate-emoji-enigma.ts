'use server';

/**
 * @fileOverview A flow that generates an emoji-based riddle.
 * - generateEmojiEnigma - A function that creates a sequence of emojis and its meaning.
 */

import { ai } from '@/ai/genkit';
import { 
  GenerateEmojiEnigmaInputSchema, 
  GenerateEmojiEnigmaOutputSchema, 
  type GenerateEmojiEnigmaInput, 
  type GenerateEmojiEnigmaOutput 
} from '@/ai/flows/schemas/emoji-enigma-schema';
import { EMOJI_ENIGMA_DATA } from '@/lib/emoji-enigma-data';

// Re-export output type for UI components
export type { GenerateEmojiEnigmaOutput };

const prompt = ai.definePrompt({
  name: 'generateEmojiEnigmaPrompt',
  input: { schema: GenerateEmojiEnigmaInputSchema },
  output: { schema: GenerateEmojiEnigmaOutputSchema },
  prompt: `You are a creative game designer for an ESL classroom.
  
  Your task is to generate a "Emoji Enigma" riddle.
  1. Choose a well-known English phrase, movie title, activity, or object based on the category: {{category}} and difficulty: {{difficulty}}.
  2. Represent this answer using a sequence of 2 to 5 emojis.
  3. Provide the answer, a short clue, and a brief explanation.

  Difficulty Guidelines:
  - 'beginner': Very common words or simple activities (e.g., 🍎🥧 for "Apple Pie", 🏃‍♂️💨 for "Running").
  - 'intermediate': Common idioms, famous movies, or slightly more complex concepts (e.g., 🐱🐶🌧️ for "Raining cats and dogs", 🎥🚢❄️ for "Titanic").
  - 'advanced': Nuanced idioms, abstract concepts, or less obvious associations.

  {{#if usedAnswers}}
  IMPORTANT: Do not use any of the following as the answer:
  {{#each usedAnswers}}
  - {{this}}
  {{/each}}
  {{/if}}

  Ensure the emojis are widely recognized and the association is logical for an English learner.
  `,
});

const generateEmojiEnigmaFlow = ai.defineFlow(
  {
    name: 'generateEmojiEnigmaFlow',
    inputSchema: GenerateEmojiEnigmaInputSchema,
    outputSchema: GenerateEmojiEnigmaOutputSchema,
  },
  async input => {
    const { difficulty, category, usedAnswers = [] } = input;

    // Filter local dataset to find matches
    const candidates = EMOJI_ENIGMA_DATA.filter(item => {
      const matchDifficulty = item.difficulty === difficulty;
      const matchCategory = category === 'Random' || item.category === category;
      const notUsed = !usedAnswers.includes(item.answer);
      return matchDifficulty && matchCategory && notUsed;
    });

    if (candidates.length > 0) {
      // Pick a random candidate from local dataset
      const chosen = candidates[Math.floor(Math.random() * candidates.length)];
      return {
        emojis: chosen.emojis,
        answer: chosen.answer,
        clue: chosen.clue,
        explanation: chosen.explanation,
      };
    }

    // Fallback to LLM if local candidates are exhausted
    const { output } = await prompt(input);
    return output!;
  }
);

export async function generateEmojiEnigma(
  input: GenerateEmojiEnigmaInput
): Promise<GenerateEmojiEnigmaOutput> {
  return generateEmojiEnigmaFlow(input);
}
