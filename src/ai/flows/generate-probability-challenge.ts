
'use server';

import { ai } from '@/ai/genkit';
import { 
  GenerateProbabilityChallengeInputSchema, 
  GenerateProbabilityChallengeOutputSchema, 
  type GenerateProbabilityChallengeInput, 
  type GenerateProbabilityChallengeOutput 
} from '@/ai/flows/schemas/probability-schema';

const prompt = ai.definePrompt({
  name: 'generateProbabilityChallengePrompt',
  input: { schema: GenerateProbabilityChallengeInputSchema },
  output: { schema: GenerateProbabilityChallengeOutputSchema },
  prompt: `You are a statistics professor creating a mission for the "Probability Pilot" game.
  
  Your task is to generate a situational probability word problem.
  
  1. Create a scenario involving chance (picking items from a bag, rolling dice, cards, or weather probability).
  2. Ask a specific question about the likelihood of an event.
  3. Provide 4 multiple-choice options. Shuffled. Options can be in fractions, percentages, or decimals.
  4. Provide a clear, step-by-step mathematical explanation.

  Difficulty Guidelines:
  - 'beginner': Simple "1 out of X" scenarios, coins, or basic 6-sided dice.
  - 'intermediate': Scenarios with multiple items (e.g., 3 red and 5 blue balls) or independent events.
  - 'advanced': Dependent events (without replacement), conditional probability, or complex combinations.
  `,
});

const generateProbabilityChallengeFlow = ai.defineFlow(
  {
    name: 'generateProbabilityChallengeFlow',
    inputSchema: GenerateProbabilityChallengeInputSchema,
    outputSchema: GenerateProbabilityChallengeOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);

export async function generateProbabilityChallenge(
  input: GenerateProbabilityChallengeInput
): Promise<GenerateProbabilityChallengeOutput> {
  return generateProbabilityChallengeFlow(input);
}
