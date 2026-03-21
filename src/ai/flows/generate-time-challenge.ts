
'use server';

/**
 * @fileOverview A flow that generates a time-calculation math challenge.
 */

import { ai } from '@/ai/genkit';
import { 
  GenerateTimeChallengeInputSchema, 
  GenerateTimeChallengeOutputSchema, 
  type GenerateTimeChallengeInput, 
  type GenerateTimeChallengeOutput 
} from '@/ai/flows/schemas/time-traveler-schema';

const prompt = ai.definePrompt({
  name: 'generateTimeChallengePrompt',
  input: { schema: GenerateTimeChallengeInputSchema },
  output: { schema: GenerateTimeChallengeOutputSchema },
  prompt: `You are an expert math educator creating a game called "Time Traveler".
  
  Your task is to generate a word problem involving clocks and durations.
  
  1. Create an engaging scenario (e.g., catching a flight, starting a movie, a school schedule).
  2. The student must calculate either the Start Time, End Time, or the Duration (Elapsed Time).
  3. Provide 4 multiple-choice options. Shuffled.
  4. Provide a clear, step-by-step mathematical explanation.

  Difficulty Guidelines:
  - 'beginner': Simple whole hours or half-hours (e.g., 2:00 to 4:30).
  - 'intermediate': Scenarios involving minutes like 15, 45, or spanning across midday (AM to PM).
  - 'advanced': Multiple legs of a journey, complex crossing of midnight, or using 24-hour clock formats.

  Ensure the correct answer is accurately calculated.
  `,
});

const generateTimeChallengeFlow = ai.defineFlow(
  {
    name: 'generateTimeChallengeFlow',
    inputSchema: GenerateTimeChallengeInputSchema,
    outputSchema: GenerateTimeChallengeOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);

export async function generateTimeChallenge(
  input: GenerateTimeChallengeInput
): Promise<GenerateTimeChallengeOutput> {
  return generateTimeChallengeFlow(input);
}
