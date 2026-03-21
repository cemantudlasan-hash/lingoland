'use server';

import { ai } from '@/ai/genkit';
import { GenerateSpellingBeeWordInputSchema, GenerateSpellingBeeWordOutputSchema, type GenerateSpellingBeeWordInput, type GenerateSpellingBeeWordOutput } from '@/ai/flows/schemas/spelling-bee-schema';

const prompt = ai.definePrompt({
  name: 'generateSpellingBeeWordPrompt',
  input: {schema: GenerateSpellingBeeWordInputSchema},
  output: {schema: GenerateSpellingBeeWordOutputSchema},
  prompt: `You are an expert ESL teacher creating a word for a Spelling Bee.

  Your task is to generate a single, common English word appropriate for a {{difficulty}} level student.

  Difficulty Guidelines:
  - 'beginner': A simple, short word (4-6 letters) that is easy to spell.
  - 'intermediate': A slightly more complex word (6-9 letters) with common spelling patterns.
  - 'advanced': A more challenging word (9+ letters) that may have tricky spelling.

  For the word, you must provide:
  1.  The word itself (no spaces or hyphens).
  2.  A simple definition of the word.
  3.  An example sentence that uses the word in context.

  {{#if usedWords}}
  IMPORTANT: Do not generate any of the following words as they have already been used:
  {{#each usedWords}}
  - {{this}}
  {{/each}}
  {{/if}}
  `,
});

const generateSpellingBeeWordFlow = ai.defineFlow(
  {
    name: 'generateSpellingBeeWordFlow',
    inputSchema: GenerateSpellingBeeWordInputSchema,
    outputSchema: GenerateSpellingBeeWordOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return {
        word: output!.word.trim().split(' ')[0], // Ensure single word
        definition: output!.definition,
        exampleSentence: output!.exampleSentence,
    };
  }
);

export async function generateSpellingBeeWord(
  input: GenerateSpellingBeeWordInput
): Promise<GenerateSpellingBeeWordOutput> {
  return generateSpellingBeeWordFlow(input);
}
