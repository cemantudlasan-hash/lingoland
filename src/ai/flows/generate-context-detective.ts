'use server';

/**
 * @fileOverview A flow that generates a context clue challenge.
 * - generateContextDetective - A function that creates a paragraph with a missing word.
 */

import { ai } from '@/ai/genkit';
import { 
  GenerateContextDetectiveInputSchema, 
  GenerateContextDetectiveOutputSchema, 
  type GenerateContextDetectiveInput, 
  type GenerateContextDetectiveOutput 
} from '@/ai/flows/schemas/context-detective-schema';

const prompt = ai.definePrompt({
  name: 'generateContextDetectivePrompt',
  input: { schema: GenerateContextDetectiveInputSchema },
  output: { schema: GenerateContextDetectiveOutputSchema },
  prompt: `You are an expert ESL educator creating a reading comprehension game called "Context Detective".
  
  Your task is to generate a challenge where a student must guess a missing word based on context clues.
  
  1. Write a short, engaging paragraph (2-4 sentences) appropriate for a {{difficulty}} level student.
  2. Choose ONE significant vocabulary word (noun, verb, or adjective) and replace it with '____'.
  3. The word should be clearly guessable from the other words in the sentences.
  
  Difficulty Guidelines:
  - 'beginner': Simple sentences about daily life, family, or basic activities (e.g., "The sun was very ____, so I wore my sunglasses.").
  - 'intermediate': More descriptive paragraphs about travel, work, or hobbies (e.g., "The weather was unpredictable, so the pilot decided to ____ the flight until it was safe to fly.").
  - 'advanced': Nuanced paragraphs about science, history, or abstract concepts.

  {{#if usedAnswers}}
  IMPORTANT: Do not use any of the following as the answer:
  {{#each usedAnswers}}
  - {{this}}
  {{/each}}
  {{/if}}

  Provide the paragraph with the blank, the correct answer, a helpful hint, and an explanation of the context clues.
  `,
});

const generateContextDetectiveFlow = ai.defineFlow(
  {
    name: 'generateContextDetectiveFlow',
    inputSchema: GenerateContextDetectiveInputSchema,
    outputSchema: GenerateContextDetectiveOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return {
        ...output!,
        answer: output!.answer.trim().toLowerCase()
    };
  }
);

export async function generateContextDetective(
  input: GenerateContextDetectiveInput
): Promise<GenerateContextDetectiveOutput> {
  return generateContextDetectiveFlow(input);
}
