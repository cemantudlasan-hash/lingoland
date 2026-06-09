
'use server';

/**
 * @fileOverview A flow that generates a vocabulary exercise with word-definition pairs.
 * - generateVocabExercise - A function that generates a vocabulary exercise.
 */

import {ai} from '@/ai/genkit';
import { z } from 'zod';

const GenerateVocabExerciseInputSchema = z.object({
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  count: z.number().int().positive().describe('The number of word-definition pairs to generate.'),
  usedWords: z.array(z.string()).optional().describe('A list of words that have already been used in this session to avoid repetition.'),
  category: z.string().optional().describe('An optional category or theme to focus the vocabulary on.'),
  salt: z.number().optional().describe('A random value to prevent cached or repetitive responses.'),
});
export type GenerateVocabExerciseInput = z.infer<typeof GenerateVocabExerciseInputSchema>;

const WordDefinitionPairSchema = z.object({
    word: z.string().describe('A single vocabulary word.'),
    definition: z.string().describe('The definition of the word.'),
});

const GenerateVocabExerciseOutputSchema = z.object({
  pairs: z.array(WordDefinitionPairSchema).describe('An array of word-definition pairs.'),
});
export type GenerateVocabExerciseOutput = z.infer<typeof GenerateVocabExerciseOutputSchema>;


const prompt = ai.definePrompt({
  name: 'generateVocabExercisePrompt',
  input: {schema: GenerateVocabExerciseInputSchema},
  output: {schema: GenerateVocabExerciseOutputSchema},
  prompt: `You are an expert ESL teacher. Generate {{count}} vocabulary words with their corresponding definitions, appropriate for a {{difficulty}} level student.
  
  {{#if category}}
  The words should be strictly related to the theme or category: **{{category}}**.
  {{/if}}

  Ensure the words are distinct and the definitions are clear and concise. 
  
  {{#if usedWords}}
  IMPORTANT: Do not generate any of the following words as they have already been used:
  {{#each usedWords}}
  - {{this}}
  {{/each}}
  {{/if}}

  Be creative! Avoid using the same basic words repeatedly. Try to find interesting but level-appropriate synonyms and concepts.
  `,
});

const generateVocabExerciseFlow = ai.defineFlow(
  {
    name: 'generateVocabExerciseFlow',
    inputSchema: GenerateVocabExerciseInputSchema,
    outputSchema: GenerateVocabExerciseOutputSchema,
  },
  async input => {
    const {output} = await prompt(input, { config: { temperature: 1.2 } });
    return output!;
  }
);

export async function generateVocabExercise(
  input: GenerateVocabExerciseInput
): Promise<GenerateVocabExerciseOutput> {
  return generateVocabExerciseFlow(input);
}
