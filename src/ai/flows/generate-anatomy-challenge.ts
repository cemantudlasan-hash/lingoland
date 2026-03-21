
'use server';

/**
 * @fileOverview A flow that generates an anatomy identification challenge.
 */

import { ai } from '@/ai/genkit';
import { 
  GenerateAnatomyChallengeInputSchema, 
  GenerateAnatomyChallengeOutputSchema, 
  type GenerateAnatomyChallengeInput, 
  type GenerateAnatomyChallengeOutput 
} from '@/ai/flows/schemas/anatomy-schema';

const prompt = ai.definePrompt({
  name: 'generateAnatomyChallengePrompt',
  input: { schema: GenerateAnatomyChallengeInputSchema },
  output: { schema: GenerateAnatomyChallengeOutputSchema },
  prompt: `You are an expert biology teacher creating a game for the "Anatomy Academy".
  
  Your task is to generate a identification challenge about the human body.
  
  1. Choose a human organ (e.g., heart, lungs, liver) or a body system (e.g., circulatory system, nervous system).
  2. Provide a detailed, level-appropriate description of its vital role or physical characteristics.
  3. Provide 4 multiple-choice options. Shuffled.
  4. Provide a clear explanation of its function.

  Difficulty Guidelines:
  - 'beginner': Very common organs like heart, brain, stomach. Use simple language.
  - 'intermediate': Includes systems like respiratory or skeletal, and organs like kidneys or pancreas.
  - 'advanced': Nuanced structures like pituitary gland, endocrine system, or specific layers of tissue.

  {{#if usedAnswers}}
  IMPORTANT: Do not use any of the following as the correct answer:
  {{#each usedAnswers}}
  - {{this}}
  {{/each}}
  {{/if}}
  `,
});

const generateAnatomyChallengeFlow = ai.defineFlow(
  {
    name: 'generateAnatomyChallengeFlow',
    inputSchema: GenerateAnatomyChallengeInputSchema,
    outputSchema: GenerateAnatomyChallengeOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);

export async function generateAnatomyChallenge(
  input: GenerateAnatomyChallengeInput
): Promise<GenerateAnatomyChallengeOutput> {
  return generateAnatomyChallengeFlow(input);
}
