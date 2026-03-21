import { z } from 'zod';

export const GenerateSpellingBeeWordInputSchema = z.object({
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  usedWords: z.array(z.string()).optional().describe('A list of words that have already been used to avoid repetition.'),
});
export type GenerateSpellingBeeWordInput = z.infer<typeof GenerateSpellingBeeWordInputSchema>;

export const GenerateSpellingBeeWordOutputSchema = z.object({
  word: z.string().describe('A single English word appropriate for the difficulty level. The word should not contain spaces or hyphens.'),
  definition: z.string().describe('A simple, clear definition of the word to be used as a hint.'),
  exampleSentence: z.string().describe('An example sentence using the word.'),
});
export type GenerateSpellingBeeWordOutput = z.infer<typeof GenerateSpellingBeeWordOutputSchema>;
