
import { z } from 'zod';

export const GenerateProbabilityChallengeInputSchema = z.object({
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
});
export type GenerateProbabilityChallengeInput = z.infer<typeof GenerateProbabilityChallengeInputSchema>;

export const GenerateProbabilityChallengeOutputSchema = z.object({
  scenario: z.string().describe("A situational probability word problem (e.g., picking marbles from a bag, spinning a wheel)."),
  question: z.string().describe("The specific probability question being asked."),
  answer: z.string().describe("The correct probability (e.g., '1/4', '50%', '0.2')."),
  options: z.array(z.string()).length(4).describe("Four multiple choice options, including the correct answer."),
  explanation: z.string().describe("A step-by-step breakdown of the calculation."),
});
export type GenerateProbabilityChallengeOutput = z.infer<typeof GenerateProbabilityChallengeOutputSchema>;
