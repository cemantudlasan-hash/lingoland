
'use server';

/**
 * @fileOverview A flow that generates a reading comprehension exercise.
 * - generateReadingComprehension - A function that generates a passage and a question.
 */

import {ai} from '@/ai/genkit';
import { z } from 'zod';

const GenerateReadingComprehensionInputSchema = z.object({
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  usedTopics: z.array(z.string()).optional().describe('A list of topics already used to ensure variety.'),
});
export type GenerateReadingComprehensionInput = z.infer<typeof GenerateReadingComprehensionInputSchema>;

const GenerateReadingComprehensionOutputSchema = z.object({
  passage: z.string().describe('A short reading passage appropriate for the difficulty level.'),
  topic: z.string().describe('The topic of the passage.'),
  question: z.string().describe('A multiple-choice question about the passage.'),
  options: z.array(z.string()).length(4).describe('An array of 4 possible answers for the question.'),
  correctAnswer: z.string().describe('The correct answer from the options array.'),
});
export type GenerateReadingComprehensionOutput = z.infer<typeof GenerateReadingComprehensionOutputSchema>;


const prompt = ai.definePrompt({
  name: 'generateReadingComprehensionPrompt',
  input: {schema: GenerateReadingComprehensionInputSchema},
  output: {schema: GenerateReadingComprehensionOutputSchema},
  prompt: `You are an expert ESL teacher. Generate a short reading comprehension exercise for a {{difficulty}}-level student.
  
  Please provide:
  1. A short, engaging reading passage.
  2. A short, one or two word topic for the passage.
  3. A multiple-choice question that tests understanding of the main idea or a key detail in the passage.
  4. Four answer options. One must be correct, and the other three should be plausible but incorrect distractors.
  5. The correct answer.

  The length and complexity should be appropriate for the {{difficulty}} level.
  
  {{#if usedTopics}}
  The passage should be on a different topic than the following:
  {{#each usedTopics}}
  - {{this}}
  {{/each}}
  {{/if}}
  `,
});

const generateReadingComprehensionFlow = ai.defineFlow(
  {
    name: 'generateReadingComprehensionFlow',
    inputSchema: GenerateReadingComprehensionInputSchema,
    outputSchema: GenerateReadingComprehensionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);


export async function generateReadingComprehension(
  input: GenerateReadingComprehensionInput
): Promise<GenerateReadingComprehensionOutput> {
  return generateReadingComprehensionFlow(input);
}
