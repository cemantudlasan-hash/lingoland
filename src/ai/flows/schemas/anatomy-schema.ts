
import { z } from 'zod';

export const GenerateAnatomyChallengeInputSchema = z.object({
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  usedAnswers: z.array(z.string()).optional().describe('A list of answers that have already been used to avoid repetition.'),
});
export type GenerateAnatomyChallengeInput = z.infer<typeof GenerateAnatomyChallengeInputSchema>;

export const GenerateAnatomyChallengeOutputSchema = z.object({
  description: z.string().describe("A 2-3 sentence description of a human organ or body system."),
  answer: z.string().describe("The name of the organ or system."),
  options: z.array(z.string()).length(4).describe("Four multiple choice options, including the correct answer."),
  explanation: z.string().describe("A brief explanation of why this answer is correct."),
});
export type GenerateAnatomyChallengeOutput = z.infer<typeof GenerateAnatomyChallengeOutputSchema>;
