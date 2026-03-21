
import { z } from 'zod';

export const GenerateAtmosphereChallengeInputSchema = z.object({
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
});
export type GenerateAtmosphereChallengeInput = z.infer<typeof GenerateAtmosphereChallengeInputSchema>;

export const GenerateAtmosphereChallengeOutputSchema = z.object({
  description: z.string().describe("A 2-3 sentence description of an atmospheric layer or weather phenomenon."),
  targetName: z.string().describe("The name of the layer or phenomenon."),
  options: z.array(z.string()).length(4).describe("Four multiple choice options, including the correct answer."),
  explanation: z.string().describe("A brief scientific explanation."),
});
export type GenerateAtmosphereChallengeOutput = z.infer<typeof GenerateAtmosphereChallengeOutputSchema>;
