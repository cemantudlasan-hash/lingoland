
'use server';

import { ai } from '@/ai/genkit';
import { 
  GenerateAtmosphereChallengeInputSchema, 
  GenerateAtmosphereChallengeOutputSchema, 
  type GenerateAtmosphereChallengeInput, 
  type GenerateAtmosphereChallengeOutput 
} from '@/ai/flows/schemas/atmosphere-schema';

const prompt = ai.definePrompt({
  name: 'generateAtmosphereChallengePrompt',
  input: { schema: GenerateAtmosphereChallengeInputSchema },
  output: { schema: GenerateAtmosphereChallengeOutputSchema },
  prompt: `You are a NASA flight controller creating a game for the "Atmospheric Ace" mission.
  
  Your task is to generate a sensor data challenge about Earth's atmosphere or weather phenomena.
  
  1. Describe an atmospheric layer (Exosphere, Thermosphere, Mesosphere, Stratosphere, Troposphere) or a weather event (Tornado, Hurricane, condensation, aurora).
  2. Provide 4 multiple-choice options. Shuffled.
  3. Provide a clear scientific explanation.

  Difficulty Guidelines:
  - 'beginner': Common layers like Troposphere or basic weather like Rain/Clouds.
  - 'intermediate': Stratosphere (ozone layer), Mesosphere (meteors), or specific wind patterns.
  - 'advanced': Ionosphere, Thermosphere properties, or complex meteorological concepts like the Coriolis effect.
  `,
});

const generateAtmosphereChallengeFlow = ai.defineFlow(
  {
    name: 'generateAtmosphereChallengeFlow',
    inputSchema: GenerateAtmosphereChallengeInputSchema,
    outputSchema: GenerateAtmosphereChallengeOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);

export async function generateAtmosphereChallenge(
  input: GenerateAtmosphereChallengeInput
): Promise<GenerateAtmosphereChallengeOutput> {
  return generateAtmosphereChallengeFlow(input);
}
