import { z } from 'zod';

export const GenerateContextDetectiveInputSchema = z.object({
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  usedAnswers: z.array(z.string()).optional().describe('A list of answers that have already been used to avoid repetition.'),
});
export type GenerateContextDetectiveInput = z.infer<typeof GenerateContextDetectiveInputSchema>;

export const GenerateContextDetectiveOutputSchema = z.object({
  paragraphWithBlank: z.string().describe("A short story (2-4 sentences) with '____' where the target word should be."),
  answer: z.string().describe("The correct English word that fills the blank."),
  hint: z.string().describe("A one-sentence clue that describes the word without giving it away."),
  explanation: z.string().describe("A brief explanation of which context clues in the paragraph point to the answer."),
});
export type GenerateContextDetectiveOutput = z.infer<typeof GenerateContextDetectiveOutputSchema>;
