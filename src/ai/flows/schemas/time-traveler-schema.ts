
import { z } from 'zod';

export const GenerateTimeChallengeInputSchema = z.object({
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
});
export type GenerateTimeChallengeInput = z.infer<typeof GenerateTimeChallengeInputSchema>;

export const GenerateTimeChallengeOutputSchema = z.object({
  scenario: z.string().describe("A situational word problem involving elapsed time, start times, or end times."),
  answer: z.string().describe("The correct time or duration."),
  options: z.array(z.string()).length(4).describe("Four multiple choice options, including the correct answer."),
  explanation: z.string().describe("A step-by-step mathematical breakdown of the solution."),
});
export type GenerateTimeChallengeOutput = z.infer<typeof GenerateTimeChallengeOutputSchema>;
