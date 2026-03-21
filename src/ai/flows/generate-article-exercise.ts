
'use server';

import {ai} from '@/ai/genkit';
import { GenerateArticleExerciseInputSchema, GenerateArticleExerciseOutputSchema, type GenerateArticleExerciseInput, type GenerateArticleExerciseOutput } from '@/ai/flows/schemas/article-exercise-schema';

const prompt = ai.definePrompt({
  name: 'generateArticleExercisePrompt',
  input: {schema: GenerateArticleExerciseInputSchema},
  output: {schema: GenerateArticleExerciseOutputSchema},
  prompt: `You are an expert ESL teacher creating an exercise about English articles (a, an, the, no article).

  Your task is to:
  1.  Create a single, grammatically correct sentence appropriate for an {{difficulty}} level student.
  2.  Remove one article from the sentence and replace it with '___'. The article could be 'a', 'an', 'the', or even the absence of an article (zero article).
  3.  Provide the correct article that was removed.
  4.  Provide a set of 4 multiple-choice options. These must include the correct answer and plausible distractors from 'a', 'an', 'the', and 'no article'.
  5.  Provide a clear, one-sentence explanation for why the correct article should be used.

  Example:
  - Sentence: "I saw ___ eagle flying high in the sky."
  - Correct Answer: "an"
  - Options: ["a", "an", "the", "no article"]
  - Explanation: "Use 'an' before a word that starts with a vowel sound, like 'eagle'."

  {{#if usedSentences}}
  IMPORTANT: Do not generate an exercise based on any of the following original sentences:
  {{#each usedSentences}}
  - {{this}}
  {{/each}}
  {{/if}}
  `,
});

const generateArticleExerciseFlow = ai.defineFlow(
  {
    name: 'generateArticleExerciseFlow',
    inputSchema: GenerateArticleExerciseInputSchema,
    outputSchema: GenerateArticleExerciseOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

export async function generateArticleExercise(
  input: GenerateArticleExerciseInput
): Promise<GenerateArticleExerciseOutput> {
  return generateArticleExerciseFlow(input);
}
