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
    const { output } = await prompt(input);
    return output!;
  }
);

export async function generateEmojiEnigma(
  input: GenerateEmojiEnigmaInput
): Promise<GenerateEmojiEnigmaOutput> {
  return generateEmojiEnigmaFlow(input);
}
