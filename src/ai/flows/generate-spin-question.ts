'use server';

/**
 * @fileOverview A flow that generates a question for the Spin the Wheel game.
 * - generateSpinQuestion - A function that creates a fill-in-the-blank question.
 */

import {ai} from '@/ai/genkit';
import { z } from 'zod';

const GenerateSpinQuestionInputSchema = z.object({
  count: z.number().int().positive().describe('The number of questions to generate.'),
  usedQuestions: z.array(z.string()).optional().describe('A list of questions that have already been used to avoid repetition.'),
});
export type GenerateSpinQuestionInput = z.infer<typeof GenerateSpinQuestionInputSchema>;

const QuestionAnswerPairSchema = z.object({
    question: z.string().describe("A fill-in-the-blank question using 'going to' for the future tense. The blank should indicate where the verb goes."),
    answer: z.string().describe("The correct verb to complete the sentence."),
});

const GenerateSpinQuestionOutputSchema = z.object({
    questions: z.array(QuestionAnswerPairSchema)
});
export type GenerateSpinQuestionOutput = z.infer<typeof GenerateSpinQuestionOutputSchema>;


const prompt = ai.definePrompt({
  name: 'generateSpinQuestionPrompt',
  input: {schema: GenerateSpinQuestionInputSchema},
  output: {schema: GenerateSpinQuestionOutputSchema},
  prompt: `You are an expert ESL teacher creating simple questions for a game.
  
  Your task is to create {{count}} unique fill-in-the-blank questions to practice the "going to" future tense.
  Each sentence should be simple and clear for beginner to intermediate students.
  For each, provide the question with a blank (e.g., "She is going to ___ a book tomorrow.") and the correct verb that fills the blank (e.g., "read").

  {{#if usedQuestions}}
  IMPORTANT: Do not generate any of the following questions:
  {{#each usedQuestions}}
  - {{this}}
  {{/each}}
  {{/if}}
  `,
});

const generateSpinQuestionFlow = ai.defineFlow(
  {
    name: 'generateSpinQuestionFlow',
    inputSchema: GenerateSpinQuestionInputSchema,
    outputSchema: GenerateSpinQuestionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);


export async function generateSpinQuestion(
  input: GenerateSpinQuestionInput
): Promise<GenerateSpinQuestionOutput> {
  return generateSpinQuestionFlow(input);
}
