'use server';

/**
 * @fileOverview A flow that generates a word morphology challenge.
 * - generateWordMorph - A function that creates a root word and a target morphed word.
 */

import { ai } from '@/ai/genkit';
import { 
  GenerateWordMorphInputSchema, 
  GenerateWordMorphOutputSchema, 
  type GenerateWordMorphInput, 
  type GenerateWordMorphOutput 
} from '@/ai/flows/schemas/word-morph-schema';

const prompt = ai.definePrompt({
  name: 'generateWordMorphPrompt',
  input: { schema: GenerateWordMorphInputSchema },
  output: { schema: GenerateWordMorphOutputSchema },
  prompt: `You are an expert ESL educator specializing in morphology (prefixes and suffixes).
  
  Your task is to generate a "Word Morph" challenge. 
  The student is given a "Root Word" and a "Definition" and must add a prefix or suffix to the root word to create the "Target Word".
  
  Difficulty Guidelines:
  - 'beginner': Simple suffixes like -s, -es, -ed, -ing, -er, -est (e.g., PLAY -> PLAYER, BIG -> BIGGEST).
  - 'intermediate': Common prefixes/suffixes like un-, re-, dis-, mis-, -ness, -ly, -ful, -less, -tion (e.g., HAPPY -> HAPPINESS, KIND -> UNKIND).
  - 'advanced': More complex transformations like inter-, intra-, sub-, -ism, -ify, -ize, -ate, -ity (e.g., NATION -> INTERNATIONAL, PURE -> PURIFY).

  {{#if usedWords}}
  IMPORTANT: Do not use any of the following as the Target Word:
  {{#each usedWords}}
  - {{this}}
  {{/each}}
  {{/if}}

  Provide the root word, the target word, a clear definition of the target, the type of morphology used, and a one-sentence explanation.
  `,
});

const generateWordMorphFlow = ai.defineFlow(
  {
    name: 'generateWordMorphFlow',
    inputSchema: GenerateWordMorphInputSchema,
    outputSchema: GenerateWordMorphOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return {
        ...output!,
        targetWord: output!.targetWord.trim().toLowerCase()
    };
  }
);

export async function generateWordMorph(
  input: GenerateWordMorphInput
): Promise<GenerateWordMorphOutput> {
  return generateWordMorphFlow(input);
}
