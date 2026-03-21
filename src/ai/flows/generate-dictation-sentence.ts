
'use server';

/**
 * @fileOverview A flow that generates a sentence for a running dictation game.
 * - generateDictationSentence - A function that generates a sentence.
 */

import {ai} from '@/ai/genkit';
import { z } from 'zod';

const GenerateDictationSentenceInputSchema = z.object({
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  usedSentences: z.array(z.string()).optional().describe('A list of sentences that have already been used to avoid repetition.'),
});
export type GenerateDictationSentenceInput = z.infer<typeof GenerateDictationSentenceInputSchema>;

const GenerateDictationSentenceOutputSchema = z.object({
  sentence: z.string().describe('A single, grammatically correct sentence appropriate for the difficulty level.'),
});
export type GenerateDictationSentenceOutput = z.infer<typeof GenerateDictationSentenceOutputSchema>;


const prompt = ai.definePrompt({
  name: 'generateDictationSentencePrompt',
  input: {schema: GenerateDictationSentenceInputSchema},
  output: {schema: GenerateDictationSentenceOutputSchema},
  prompt: `You are an expert ESL teacher. Create a single sentence for a running dictation game for a {{difficulty}}-level student.
  
  The sentence should be grammatically correct and easy to remember after seeing it for a few seconds.
  - For 'beginner', use 5-7 words.
  - For 'intermediate', use 8-12 words.
  - For 'advanced', use 12-16 words with more complex structure.
  
  Do not include any special characters like quotes.

  {{#if usedSentences}}
  IMPORTANT: Do not generate any of the following sentences as they have already been used:
  {{#each usedSentences}}
  - {{this}}
  {{/each}}
  {{/if}}
  `,
});

const generateDictationSentenceFlow = ai.defineFlow(
  {
    name: 'generateDictationSentenceFlow',
    inputSchema: GenerateDictationSentenceInputSchema,
    outputSchema: GenerateDictationSentenceOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

export async function generateDictationSentence(
  input: GenerateDictationSentenceInput
): Promise<GenerateDictationSentenceOutput> {
  return generateDictationSentenceFlow(input);
}
