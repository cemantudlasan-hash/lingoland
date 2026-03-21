
import { z } from 'zod';

export const GenerateRiddleInputSchema = z.object({
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  usedAnswers: z.array(z.string()).optional().describe('A list of answers that have already been used to avoid repetition.'),
});
export type GenerateRiddleInput = z.infer<typeof GenerateRiddleInputSchema>;

export const GenerateRiddleOutputSchema = z.object({
  riddle: z.string().describe("The text of the riddle."),
  answer: z.string().describe("The correct answer to the riddle."),
  options: z.array(z.string()).length(4).describe("Four multiple choice options, including the correct answer."),
  explanation: z.string().describe("A brief explanation of why this answer is correct."),
});
export type GenerateRiddleOutput = z.infer<typeof GenerateRiddleOutputSchema>;
