import { z } from 'zod';

export const GenerateEmojiEnigmaInputSchema = z.object({
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  category: z.enum(['Random', 'Movies', 'Idioms', 'Everyday Activities', 'Famous Places', 'Objects']),
  usedAnswers: z.array(z.string()).optional().describe('A list of answers that have already been used to avoid repetition.'),
});
export type GenerateEmojiEnigmaInput = z.infer<typeof GenerateEmojiEnigmaInputSchema>;

export const GenerateEmojiEnigmaOutputSchema = z.object({
  emojis: z.string().describe('A sequence of 2-5 emojis representing the secret phrase or word.'),
  answer: z.string().describe('The correct English word or phrase.'),
  clue: z.string().describe('A short, helpful clue or category description.'),
  explanation: z.string().describe('A one-sentence explanation of why these emojis represent the answer.'),
});
export type GenerateEmojiEnigmaOutput = z.infer<typeof GenerateEmojiEnigmaOutputSchema>;
