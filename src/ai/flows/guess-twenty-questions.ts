
'use server';

/**
 * @fileOverview A flow to handle a turn in a game of Twenty Questions.
 * - guessTwentyQuestions - The AI answers a user's yes/no question.
 */

import {ai} from '@/ai/genkit';
import { z } from 'zod';

const GuessTwentyQuestionsInputSchema = z.object({
  secretObject: z.string().describe("The secret object the AI is thinking of."),
  questionHistory: z.array(z.object({
    question: z.string(),
    answer: z.enum(['Yes', 'No', 'Maybe', "I don't know"]),
  })).describe("A history of the questions asked so far and the AI's answers."),
  userQuestion: z.string().describe("The user's latest yes/no question."),
});
export type GuessTwentyQuestionsInput = z.infer<typeof GuessTwentyQuestionsInputSchema>;

const GuessTwentyQuestionsOutputSchema = z.object({
  answer: z.enum(['Yes', 'No', 'Maybe', "I don't know"]).describe("The AI's answer to the user's question."),
  comment: z.string().optional().describe("An optional, brief, helpful comment ONLY if the user's question is not in a yes/no format."),
});
export type GuessTwentyQuestionsOutput = z.infer<typeof GuessTwentyQuestionsOutputSchema>;


const prompt = ai.definePrompt({
  name: 'guessTwentyQuestionsPrompt',
  input: {schema: GuessTwentyQuestionsInputSchema},
  output: {schema: GuessTwentyQuestionsOutputSchema},
  prompt: `You are the host of a "Twenty Questions" game for an ESL learner.
  You are thinking of the secret object: **{{secretObject}}**.

  The user has asked the following question: "{{userQuestion}}"

  Your task is to answer the question with only one of: "Yes," "No," "Maybe," or "I don't know."
  - Answer "Yes" or "No" if it's a clear factual question about the secret object.
  - Answer "Maybe" if the answer could be true in some situations but not others.
  - Answer "I don't know" if the question is completely irrelevant or unanswerable (e.g., "Is it happy?").
  - If the user's question is not a clear yes/no question (e.g., "What color is it?"), you MUST answer "I don't know" and you can add a helpful comment guiding them to rephrase it (e.g., "That's a good question, but I can only answer with 'yes' or 'no'. Try asking 'Is it red?'").
  - DO NOT provide any other explanation or reveal the secret object.

  Here is the history of questions and answers so far, for context:
  {{#each questionHistory}}
  Q: {{this.question}}
  A: {{this.answer}}
  {{/each}}

  Based on the secret object **{{secretObject}}**, answer the user's new question.
  `,
});

const guessTwentyQuestionsFlow = ai.defineFlow(
  {
    name: 'guessTwentyQuestionsFlow',
    inputSchema: GuessTwentyQuestionsInputSchema,
    outputSchema: GuessTwentyQuestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

export async function guessTwentyQuestions(
  input: GuessTwentyQuestionsInput
): Promise<GuessTwentyQuestionsOutput> {
  return guessTwentyQuestionsFlow(input);
}
