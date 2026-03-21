
'use server';

/**
 * @fileOverview A flow that generates a word for a game of Hangman.
 * - generateHangmanWord - A function that generates a word and a hint.
 */

import {ai} from '@/ai/genkit';
import { z } from 'zod';

const GenerateHangmanWordInputSchema = z.object({
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  category: z.string().describe('The category for the word to be generated.'),
  usedWords: z.array(z.string()).optional().describe('A list of words that have already been used to avoid repetition.'),
});
export type GenerateHangmanWordInput = z.infer<typeof GenerateHangmanWordInputSchema>;

const GenerateHangmanWordOutputSchema = z.object({
  word: z.string().describe('A single English word for the hangman game. It should not contain spaces or hyphens.'),
  hint: z.string().describe('A short, one-sentence hint about the word.'),
});
export type GenerateHangmanWordOutput = z.infer<typeof GenerateHangmanWordOutputSchema>;

const prompt = ai.definePrompt({
  name: 'generateHangmanWordPrompt',
  input: {schema: GenerateHangmanWordInputSchema},
  output: {schema: GenerateHangmanWordOutputSchema},
  prompt: `You are a game master creating a Hangman game for ESL learners.
  
  Your task is to generate a single English word that strictly belongs to the category: **{{category}}**.
  You must also provide a simple hint for the word, suitable for the {{difficulty}} level.

  Difficulty Guidelines:
  - 'beginner': A common, short word (4-6 letters).
  - 'intermediate': A slightly less common word (6-9 letters).
  - 'advanced': A more complex or longer word (9+ letters).

  The word must be a single word with no spaces or hyphens.
  The hint should be a short, clear clue that helps the player guess the word.

  {{#if usedWords}}
  IMPORTANT: Do not generate any of the following words as they have already been used:
  {{#each usedWords}}
  - {{this}}
  {{/each}}
  {{/if}}
  `,
});

const generateHangmanWordFlow = ai.defineFlow(
  {
    name: 'generateHangmanWordFlow',
    inputSchema: GenerateHangmanWordInputSchema,
    outputSchema: GenerateHangmanWordOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    // Ensure the word is a single word and lowercase
    const cleanWord = output!.word.split(' ')[0].toLowerCase();
    return {
        word: cleanWord,
        hint: output!.hint,
    };
  }
);

export async function generateHangmanWord(
  input: GenerateHangmanWordInput
): Promise<GenerateHangmanWordOutput> {
  return generateHangmanWordFlow(input);
}
