import { z } from 'zod';

export const GenerateWordMorphInputSchema = z.object({
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  usedWords: z.array(z.string()).optional().describe('A list of target words already used to avoid repetition.'),
});
export type GenerateWordMorphInput = z.infer<typeof GenerateWordMorphInputSchema>;

export const GenerateWordMorphOutputSchema = z.object({
  rootWord: z.string().describe("The base word provided to the student (e.g., 'HAPPY')."),
  targetWord: z.string().describe("The correct transformed word (e.g., 'HAPPINESS')."),
  definition: z.string().describe("A clear definition of the target word."),
  morphType: z.string().describe("The type of change made (e.g., 'added suffix -ness')."),
  explanation: z.string().describe("A brief explanation of how the prefix/suffix changed the meaning or part of speech."),
});
export type GenerateWordMorphOutput = z.infer<typeof GenerateWordMorphOutputSchema>;
