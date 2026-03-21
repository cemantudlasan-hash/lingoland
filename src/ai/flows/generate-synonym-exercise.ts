
'use server';

/**
 * @fileOverview A flow that generates a synonym-matching exercise.
 * - generateSynonymExercise - A function that creates a word, its synonym, and distractors.
 */

import {ai} from '@/ai/genkit';
import { z } from 'zod';

const GenerateSynonymExerciseInputSchema = z.object({
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  usedWords: z.array(z.string()).optional().describe('A list of words already used in this session to ensure variety.'),
});
export type GenerateSynonymExerciseInput = z.infer<typeof GenerateSynonymExerciseInputSchema>;

const GenerateSynonymExerciseOutputSchema = z.object({
  word: z.string().describe('The target word for which a synonym is needed.'),
  correctSynonym: z.string().describe('The correct synonym for the target word.'),
  options: z.array(z.string()).length(4).describe('An array of 4 words, including the correct synonym and three incorrect but plausible distractors.'),
});
export type GenerateSynonymExerciseOutput = z.infer<typeof GenerateSynonymExerciseOutputSchema>;


const prompt = ai.definePrompt({
  name: 'generateSynonymExercisePrompt',
  input: {schema: GenerateSynonymExerciseInputSchema},
  output: {schema: GenerateSynonymExerciseOutputSchema},
  prompt: `You are an expert ESL teacher creating a vocabulary quiz.
  
  Please generate a synonym-matching question for a {{difficulty}}-level student.

  Provide:
  1. A target word.
  2. The correct synonym for that word.
  3. A list of 4 multiple-choice options, which includes the correct synonym and three other plausible but incorrect words (distractors). Ensure the options are shuffled.

  The complexity of the word and the subtlety of the distractors should be appropriate for the {{difficulty}} level.
  
  {{#if usedWords}}
  The target word should not be any of the following:
  {{#each usedWords}}
  - {{this}}
  {{/each}}
  {{/if}}
  `,
});

const generateSynonymExerciseFlow = ai.defineFlow(
  {
    name: 'generateSynonymExerciseFlow',
    inputSchema: GenerateSynonymExerciseInputSchema,
    outputSchema: GenerateSynonymExerciseOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);


export async function generateSynonymExercise(
  input: GenerateSynonymExerciseInput
): Promise<GenerateSynonymExerciseOutput> {
  return generateSynonymExerciseFlow(input);
}
