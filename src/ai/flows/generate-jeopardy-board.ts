
'use server';

import { ai } from '@/ai/genkit';
import { GenerateJeopardyBoardInputSchema, GenerateJeopardyBoardOutputSchema, type GenerateJeopardyBoardInput, type GenerateJeopardyBoardOutput } from '@/ai/flows/schemas/jeopardy-schema';

const prompt = ai.definePrompt({
  name: 'generateJeopardyBoardPrompt',
  input: {schema: GenerateJeopardyBoardInputSchema},
  output: {schema: GenerateJeopardyBoardOutputSchema},
  prompt: `You are an expert game show creator. Generate a complete Jeopardy-style game board for ESL students with a {{difficulty}} level of English proficiency.

  The board must have exactly 5 categories.
  Each category must have exactly 5 questions.
  The questions in each category must be for 100, 200, 300, 400, and 500 points, increasing in difficulty.

  {{#if customCategories}}
  Use the following category names:
  {{#each customCategories}}
  - {{this}}
  {{/each}}
  {{else}}
  Generate 5 interesting and varied school-appropriate category names (e.g., "World Capitals", "Simple Science", "Animals", "Famous People", "English Grammar").
  {{/if}}

  The questions and answers should be concise and clear. The answers should be a single word or a short phrase.
  `,
});

const generateJeopardyBoardFlow = ai.defineFlow(
  {
    name: 'generateJeopardyBoardFlow',
    inputSchema: GenerateJeopardyBoardInputSchema,
    outputSchema: GenerateJeopardyBoardOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);


export async function generateJeopardyBoard(
  input: GenerateJeopardyBoardInput
): Promise<GenerateJeopardyBoardOutput> {
  return generateJeopardyBoardFlow(input);
}
