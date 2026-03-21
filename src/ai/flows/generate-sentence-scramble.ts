
'use server';

/**
 * @fileOverview A flow that generates a sentence scramble exercise.
 * - generateSentenceScramble - A function that generates a sentence scramble exercise.
 */

import {ai} from '@/ai/genkit';
import { z } from 'zod';

const GenerateSentenceScrambleInputSchema = z.object({
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  usedSentences: z.array(z.string()).optional().describe('A list of correct sentences that have already been used to avoid repetition.'),
});
export type GenerateSentenceScrambleInput = z.infer<typeof GenerateSentenceScrambleInputSchema>;

const GenerateSentenceScrambleOutputSchema = z.object({
  scrambledSentence: z.array(z.string()).describe('An array of words representing the scrambled sentence.'),
  correctSentence: z.string().describe('The correct, unscrambled sentence.'),
});
export type GenerateSentenceScrambleOutput = z.infer<typeof GenerateSentenceScrambleOutputSchema>;


const prompt = ai.definePrompt({
  name: 'generateSentenceScramblePrompt',
  input: {schema: GenerateSentenceScrambleInputSchema},
  output: {schema: GenerateSentenceScrambleOutputSchema},
  prompt: `You are an expert ESL teacher. Create a sentence scramble exercise for a {{difficulty}}-level student.
  
  Generate a single, grammatically correct sentence appropriate for the difficulty level.
  Then, scramble the words of that sentence.
  
  - For 'beginner', use 5-7 words.
  - For 'intermediate', use 8-12 words.
  - For 'advanced', use 12-16 words and a more complex sentence structure.

  Provide the scrambled words as an array of strings and the original correct sentence as a string.

  {{#if usedSentences}}
  IMPORTANT: Do not generate a sentence that has already been used. Avoid these correct sentences:
  {{#each usedSentences}}
  - {{this}}
  {{/each}}
  {{/if}}
  `,
});

const generateSentenceScrambleFlow = ai.defineFlow(
  {
    name: 'generateSentenceScrambleFlow',
    inputSchema: GenerateSentenceScrambleInputSchema,
    outputSchema: GenerateSentenceScrambleOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

export async function generateSentenceScramble(
  input: GenerateSentenceScrambleInput
): Promise<GenerateSentenceScrambleOutput> {
  return generateSentenceScrambleFlow(input);
}
