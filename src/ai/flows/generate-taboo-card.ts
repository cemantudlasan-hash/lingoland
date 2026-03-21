
'use server';

/**
 * @fileOverview A flow that generates a card for a game of Taboo.
 * - generateTabooCard - A function that generates a Taboo card.
 */

import {ai} from '@/ai/genkit';
import { z } from 'zod';

const GenerateTabooCardInputSchema = z.object({
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  usedWords: z.array(z.string()).optional().describe('A list of words that have already been used in this session.'),
});
export type GenerateTabooCardInput = z.infer<typeof GenerateTabooCardInputSchema>;

const GenerateTabooCardOutputSchema = z.object({
  guessWord: z.string().describe('The word the player needs to get their team to guess.'),
  tabooWords: z.array(z.string()).min(4).max(6).describe('A list of 4-6 forbidden words that the player cannot use.'),
});
export type GenerateTabooCardOutput = z.infer<typeof GenerateTabooCardOutputSchema>;


const prompt = ai.definePrompt({
  name: 'generateTabooCardPrompt',
  input: {schema: GenerateTabooCardInputSchema},
  output: {schema: GenerateTabooCardOutputSchema},
  prompt: `You are a game designer creating cards for a game like Taboo, aimed at ESL learners.

  Generate a single card with a guess word and a list of 4-6 "taboo" (forbidden) words. The player giving clues must describe the guess word to their team without using any of the taboo words.

  Adjust the difficulty as follows:
  - 'beginner': Use simple, concrete nouns (e.g., guess word: "apple", taboo words: "red", "fruit", "eat", "pie", "tree").
  - 'intermediate': Use more complex nouns or verbs (e.g., guess word: "celebrate", taboo words: "party", "happy", "event", "birthday", "congratulations").
  - 'advanced': Use abstract concepts, adjectives, or more nuanced words (e.g., guess word: "curiosity", taboo words: "question", "ask", "wonder", "explore", "learn").

  The taboo words should be closely related to the guess word to make the game challenging.

  {{#if usedWords}}
  IMPORTANT: Do not use any of the following as the guessWord, as they have already been used:
  {{#each usedWords}}
  - {{this}}
  {{/each}}
  {{/if}}
  `,
});

const generateTabooCardFlow = ai.defineFlow(
  {
    name: 'generateTabooCardFlow',
    inputSchema: GenerateTabooCardInputSchema,
    outputSchema: GenerateTabooCardOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

export async function generateTabooCard(
  input: GenerateTabooCardInput
): Promise<GenerateTabooCardOutput> {
  return generateTabooCardFlow(input);
}
