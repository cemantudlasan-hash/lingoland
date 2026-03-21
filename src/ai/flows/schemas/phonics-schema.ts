import { z } from 'zod';

export const GeneratePhonicsWordInputSchema = z.object({
  phonicsSound: z.string().describe('The specific phonics sound the word should contain (e.g., "ch", "sh", "th").'),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  count: z.number().int().positive().describe('The number of word/hint pairs to generate.'),
  usedWords: z.array(z.string()).optional().describe('A list of words that have already been used to avoid repetition.'),
});
export type GeneratePhonicsWordInput = z.infer<typeof GeneratePhonicsWordInputSchema>;

const WordHintPairSchema = z.object({
    word: z.string().describe('A single English word that prominently features the given phonics sound.'),
    hint: z.string().describe('A short, one-sentence hint that describes the word.'),
});

export const GeneratePhonicsWordOutputSchema = z.object({
    words: z.array(WordHintPairSchema)
});
export type GeneratePhonicsWordOutput = z.infer<typeof GeneratePhonicsWordOutputSchema>;
