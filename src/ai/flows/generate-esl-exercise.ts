
'use server';

/**
 * @fileOverview A flow that generates ESL exercises based on a topic and difficulty level.
 *
 * - generateEslExercise - A function that generates ESL exercises.
 */

import {ai} from '@/ai/genkit';
import { z } from 'zod';

const GenerateEslExerciseInputSchema = z.object({
  topic: z.string().describe('The topic of the ESL exercise.'),
  difficultyLevel: z
    .enum(['beginner', 'intermediate', 'advanced'])
    .describe('The difficulty level of the ESL exercise.'),
  exerciseLength: z
    .enum(['short', 'medium', 'long'])
    .describe('The desired length of the exercise.'),
});
export type GenerateEslExerciseInput = z.infer<typeof GenerateEslExerciseInputSchema>;

const GenerateEslExerciseOutputSchema = z.object({
  exercise: z.string().describe('The generated ESL exercise.'),
});
export type GenerateEslExerciseOutput = z.infer<typeof GenerateEslExerciseOutputSchema>;


export async function generateEslExercise(input: GenerateEslExerciseInput): Promise<GenerateEslExerciseOutput> {
  try {
    return await generateEslExerciseFlow(input);
  } catch (err: any) {
    const errorMsg = err?.message || String(err);
    console.error("🔴 GENKIT_ERROR FULL DUMP:", errorMsg);
    // Explicitly returning the error message in a way that might be helpful if caught by the client
    throw new Error(`AI Generation Failed: ${errorMsg}`);
  }
}



const generateEslExercisePrompt = ai.definePrompt({
  name: 'generateEslExercisePrompt',
  input: {schema: GenerateEslExerciseInputSchema},
  output: {schema: GenerateEslExerciseOutputSchema},
  prompt: `You are an experienced ESL teacher. Generate a {{exerciseLength}}-length ESL exercise on the topic of {{topic}} for {{difficultyLevel}} level students.`,
});

const generateEslExerciseFlow = ai.defineFlow(
  {
    name: 'generateEslExerciseFlow',
    inputSchema: GenerateEslExerciseInputSchema,
    outputSchema: GenerateEslExerciseOutputSchema,
  },
  async input => {
    const {output} = await generateEslExercisePrompt(input);
    return output!;
  }
);
