'use server';

import {ai} from '@/ai/genkit';
import { z } from 'zod';

const GenerateGrammarExerciseInputSchema = z.object({
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  usedSentences: z.array(z.string()).optional().describe('A list of correct sentences that have already been used in this session to avoid repetition.'),
});
export type GenerateGrammarExerciseInput = z.infer<typeof GenerateGrammarExerciseInputSchema>;

const GenerateGrammarExerciseOutputSchema = z.object({
  incorrectSentence: z.string().describe('A sentence with a grammatical error.'),
  correctSentence: z.string().describe('The grammatically correct version of the sentence.'),
  explanation: z.string().describe('A brief explanation of the grammatical error.'),
});
export type GenerateGrammarExerciseOutput = z.infer<typeof GenerateGrammarExerciseOutputSchema>;


const prompt = ai.definePrompt({
  name: 'generateGrammarExercisePrompt',
  input: {schema: GenerateGrammarExerciseInputSchema},
  output: {schema: GenerateGrammarExerciseOutputSchema},
  prompt: `You are an expert ESL teacher. Create a single sentence with one grammatical error appropriate for a {{difficulty}} level student. 
  Provide the incorrect sentence, the correct version, and a simple, one-sentence explanation of the error.
  
  {{#if usedSentences}}
  IMPORTANT: Do not generate a sentence whose correct version is any of the following, as they have already been used:
  {{#each usedSentences}}
  - {{this}}
  {{/each}}
  {{/if}}
  `,
});

const generateGrammarExerciseFlow = ai.defineFlow(
  {
    name: 'generateGrammarExerciseFlow',
    inputSchema: GenerateGrammarExerciseInputSchema,
    outputSchema: GenerateGrammarExerciseOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);


export async function generateGrammarExercise(
  input: GenerateGrammarExerciseInput
): Promise<GenerateGrammarExerciseOutput> {
  return generateGrammarExerciseFlow(input);
}
