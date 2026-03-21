'use server';

/**
 * @fileOverview A flow that generates a pair of sentences for the Choose Your Gift game.
 * - generateGrammarPair - A function that generates a correct and incorrect grammar sentence.
 */

import {ai} from '@/ai/genkit';
import { GenerateGrammarPairInputSchema, GenerateGrammarPairOutputSchema, type GenerateGrammarPairInput, type GenerateGrammarPairOutput } from '@/ai/flows/schemas/verb-pair-schema';

const prompt = ai.definePrompt({
  name: 'generateGrammarPairPrompt',
  input: {schema: GenerateGrammarPairInputSchema},
  output: {schema: GenerateGrammarPairOutputSchema},
  prompt: `You are an expert ESL teacher creating content for a classroom game.

  The grammar topic is: **{{grammarTopic}}**.

  Your task is to choose a single English word or concept related to this topic and create two sentences for it, appropriate for a {{difficulty}} level student.
  1.  One sentence must be grammatically correct.
  2.  The other sentence must have a single, subtle grammatical error related to the use of the item from the grammar topic.
  3.  Provide a simple, one-sentence explanation of the error.
  4.  Provide the base word/item that was used.

  For example, if the topic is 'Adjectives', you might choose the adjective 'beautiful' and create one correct sentence and one with an error like 'She has a beauty dog.'

  {{#if usedItems}}
  IMPORTANT: Do not use any of the following items:
  {{#each usedItems}}
  - {{this}}
  {{/each}}
  {{/if}}
  `,
});

const generateGrammarPairFlow = ai.defineFlow(
  {
    name: 'generateGrammarPairFlow',
    inputSchema: GenerateGrammarPairInputSchema,
    outputSchema: GenerateGrammarPairOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

export async function generateGrammarPair(
  input: GenerateGrammarPairInput
): Promise<GenerateGrammarPairOutput> {
  return generateGrammarPairFlow(input);
}
