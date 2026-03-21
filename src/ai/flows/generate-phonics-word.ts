
'use server';

/**
 * @fileOverview A flow that generates words for a phonics game.
 * - generatePhonicsWords - A function that generates words based on a phonics sound.
 */

import {ai} from '@/ai/genkit';
import { GeneratePhonicsWordInputSchema, GeneratePhonicsWordOutputSchema, type GeneratePhonicsWordInput, type GeneratePhonicsWordOutput } from '@/ai/flows/schemas/phonics-schema';


const prompt = ai.definePrompt({
  name: 'generatePhonicsWordPrompt',
  input: {schema: GeneratePhonicsWordInputSchema},
  output: {schema: GeneratePhonicsWordOutputSchema},
  prompt: `You are a creative game master for an ESL phonics game.

  Your task is to generate {{count}} unique, common English words appropriate for a {{difficulty}} level student that contains the phonics sound: **"{{phonicsSound}}"**.
  
  For each word, provide a short, clear hint that describes the word without using the word itself or the phonics sound.

  Difficulty Guidelines:
  - 'beginner': Short, concrete nouns (e.g., for 'ch', "cheese", "chair").
  - 'intermediate': Slightly more complex words, could be verbs or adjectives (e.g., for 'sh', "share", "shiny").
  - 'advanced': Longer or more abstract words (e.g., for 'th', "thoughtful", "thunder").

  {{#if usedWords}}
  IMPORTANT: Do not generate any of the following words as they have already been used:
  {{#each usedWords}}
  - {{this}}
  {{/each}}
  {{/if}}
  `,
});

const generatePhonicsWordsFlow = ai.defineFlow(
  {
    name: 'generatePhonicsWordsFlow',
    inputSchema: GeneratePhonicsWordInputSchema,
    outputSchema: GeneratePhonicsWordOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    // Ensure the words are single words and lowercase
    const cleanedWords = output!.words.map(pair => ({
        word: pair.word.split(' ')[0].toLowerCase(),
        hint: pair.hint
    }));
    return {
        words: cleanedWords
    };
  }
);

export async function generatePhonicsWords(
  input: GeneratePhonicsWordInput
): Promise<GeneratePhonicsWordOutput> {
  return generatePhonicsWordsFlow(input);
}
