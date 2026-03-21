
'use server';

/**
 * @fileOverview A flow that generates an idiom exercise.
 * - generateIdiomExercise - A function that generates an idiom exercise.
 */

import {ai} from '@/ai/genkit';
import { z } from 'zod';

const GenerateIdiomExerciseInputSchema = z.object({
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  usedIdioms: z.array(z.string()).optional().describe('A list of idioms that have already been used to avoid repetition.'),
});
export type GenerateIdiomExerciseInput = z.infer<typeof GenerateIdiomExerciseInputSchema>;

const GenerateIdiomExerciseOutputSchema = z.object({
    idiom: z.string().describe('A common English idiom.'),
    meaning: z.string().describe('The meaning of the idiom.'),
    exampleSentence: z.string().describe('An example sentence using the idiom.'),
    options: z.array(z.string()).length(4).describe('Four multiple choice options for the meaning of the idiom, one of which is correct.'),
});
export type GenerateIdiomExerciseOutput = z.infer<typeof GenerateIdiomExerciseOutputSchema>;


const prompt = ai.definePrompt({
  name: 'generateIdiomExercisePrompt',
  input: {schema: GenerateIdiomExerciseInputSchema},
  output: {schema: GenerateIdiomExerciseOutputSchema},
  prompt: `You are an expert ESL teacher. Generate an idiom exercise for an {{difficulty}}-level student. 
  
  Provide:
  1. A common English idiom.
  2. The correct meaning of the idiom.
  3. An example sentence using the idiom.
  4. A multiple-choice question with 4 options for the meaning of the idiom. One option must be the correct meaning, and the other three should be plausible but incorrect distractors.
  
  {{#if usedIdioms}}
  IMPORTANT: Do not generate any of the following idioms as they have already been used:
  {{#each usedIdioms}}
  - {{this}}
  {{/each}}
  {{/if}}
  `,
});

const generateIdiomExerciseFlow = ai.defineFlow(
  {
    name: 'generateIdiomExerciseFlow',
    inputSchema: GenerateIdiomExerciseInputSchema,
    outputSchema: GenerateIdiomExerciseOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

export async function generateIdiomExercise(
  input: GenerateIdiomExerciseInput
): Promise<GenerateIdiomExerciseOutput> {
  return generateIdiomExerciseFlow(input);
}
