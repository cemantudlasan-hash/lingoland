
'use server';

/**
 * @fileOverview Provides contextual hints for ESL exercises.
 *
 * - getContextualHint - A function that generates contextual hints.
 */

import {ai} from '@/ai/genkit';
import { z } from 'zod';

const GetContextualHintInputSchema = z.object({
  exerciseText: z
    .string()
    .describe('The text of the exercise or question the student is working on.'),
  studentAnswer: z
    .string()
    .optional()
    .describe('The student\'s attempt at answering the exercise, if any.'),
  difficultyLevel: z
    .enum(['beginner', 'intermediate', 'advanced'])
    .describe('The difficulty level of the exercise.'),
});
export type GetContextualHintInput = z.infer<typeof GetContextualHintInputSchema>;

const GetContextualHintOutputSchema = z.object({
  hint: z.string().describe('A contextual hint to help the student solve the exercise.'),
});
export type GetContextualHintOutput = z.infer<typeof GetContextualHintOutputSchema>;


export async function getContextualHint(input: GetContextualHintInput): Promise<GetContextualHintOutput> {
  return getContextualHintFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getContextualHintPrompt',
  input: {schema: GetContextualHintInputSchema},
  output: {schema: GetContextualHintOutputSchema},
  prompt: `You are an expert ESL tutor. Your goal is to provide helpful contextual hints to students who are stuck on an exercise.

  The exercise is:
  {{exerciseText}}

  The student\'s answer, if any, is:
  {{studentAnswer}}

  The difficulty level is: {{difficultyLevel}}

  Provide a hint that guides the student towards the correct answer without giving it away directly.  Focus on vocabulary, grammar, or a specific concept related to the exercise. The hint should be encouraging and supportive.

  Do not directly provide the answer; instead, prompt the student to think critically and try again.
  Confine yourself to a single sentence.`,
});

const getContextualHintFlow = ai.defineFlow(
  {
    name: 'getContextualHintFlow',
    inputSchema: GetContextualHintInputSchema,
    outputSchema: GetContextualHintOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
