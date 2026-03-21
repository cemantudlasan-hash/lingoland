'use server';

/**
 * @fileOverview A flow that generates an "Odd One Out" challenge.
 * - generateOddOneOut - A function that creates 4 items where one doesn't belong.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const OddOneOutInputSchema = z.object({
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  usedSets: z.array(z.string()).optional().describe('A list of explanations or themes already used to avoid repetition.'),
});
export type OddOneOutInput = z.infer<typeof OddOneOutInputSchema>;

const OddOneOutOutputSchema = z.object({
  items: z.array(z.string()).length(4).describe('Four words or phrases. Three belong to a theme, one does not.'),
  correctIndex: z.number().int().min(0).max(3).describe('The index of the odd item in the items array.'),
  theme: z.string().describe('The theme that the other three items share.'),
  explanation: z.string().describe('A brief explanation of why the odd item does not belong.'),
});
export type OddOneOutOutput = z.infer<typeof OddOneOutOutputSchema>;

const prompt = ai.definePrompt({
  name: 'generateOddOneOutPrompt',
  input: { schema: OddOneOutInputSchema },
  output: { schema: OddOneOutOutputSchema },
  prompt: `You are an expert ESL teacher creating a logic and vocabulary game called "Odd One Out".

  Your task is to generate a set of 4 items (words or short phrases) appropriate for a {{difficulty}} level student.
  - 3 items MUST share a clear, logical theme.
  - 1 item MUST be the "Odd One Out" that does not fit that theme.
  
  Difficulty Guidelines:
  - 'beginner': Simple concrete nouns, basic colors, animals, or common verbs (e.g., Apple, Banana, Orange, Chair).
  - 'intermediate': More abstract nouns, specific verb tenses, parts of speech, or categories (e.g., Quickly, Happily, Loudly, Green).
  - 'advanced': Idioms, nuanced grammar rules, subtle semantic differences, or cultural references.

  {{#if usedSets}}
  IMPORTANT: Do not generate a challenge with a similar theme or explanation to these:
  {{#each usedSets}}
  - {{this}}
  {{/each}}
  {{/if}}

  Provide the 4 items, the index of the odd one, the theme name, and a one-sentence explanation.
  `,
});

const generateOddOneOutFlow = ai.defineFlow(
  {
    name: 'generateOddOneOutFlow',
    inputSchema: OddOneOutInputSchema,
    outputSchema: OddOneOutOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);

export async function generateOddOneOut(
  input: OddOneOutInput
): Promise<OddOneOutOutput> {
  return generateOddOneOutFlow(input);
}
