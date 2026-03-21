
'use server';

/**
 * @fileOverview A flow that scores the grammar of a story.
 * - scoreStoryGrammar - A function that evaluates the story.
 */

import {ai} from '@/ai/genkit';
import { z } from 'zod';

const ScoreStoryGrammarInputSchema = z.object({
  story: z.string().describe('The complete story text to be evaluated.'),
});
export type ScoreStoryGrammarInput = z.infer<typeof ScoreStoryGrammarInputSchema>;

const ScoreStoryGrammarOutputSchema = z.object({
  score: z.number().int().min(0).max(100).describe('A grammar score for the story, from 0 to 100.'),
  feedback: z.string().describe('Constructive feedback on the grammar, pointing out specific errors and suggesting improvements.'),
});
export type ScoreStoryGrammarOutput = z.infer<typeof ScoreStoryGrammarOutputSchema>;


const prompt = ai.definePrompt({
  name: 'scoreStoryGrammarPrompt',
  input: {schema: ScoreStoryGrammarInputSchema},
  output: {schema: ScoreStoryGrammarOutputSchema},
  prompt: `You are an expert English grammar checker. You will be given a story written collaboratively by one or more people.
  
  Your task is to analyze the story for grammatical errors, spelling mistakes, and awkward phrasing.
  
  Please provide:
  1. A grammar score from 0 to 100, where 100 is a perfect, grammatically correct story.
  2. Constructive feedback that identifies the key errors in the story and explains how to correct them. Be encouraging and focus on the most important learning opportunities.

  Here is the story:
  "{{story}}"
  `,
});

const scoreStoryGrammarFlow = ai.defineFlow(
  {
    name: 'scoreStoryGrammarFlow',
    inputSchema: ScoreStoryGrammarInputSchema,
    outputSchema: ScoreStoryGrammarOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

export async function scoreStoryGrammar(
  input: ScoreStoryGrammarInput
): Promise<ScoreStoryGrammarOutput> {
  return scoreStoryGrammarFlow(input);
}
