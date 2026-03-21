
'use server';

/**
 * @fileOverview A flow that generates an item for the auction game.
 * - generateAuctionItem - A function that generates a sentence and its correctness.
 */

import {ai} from '@/ai/genkit';
import { z } from 'zod';

const GenerateAuctionItemInputSchema = z.object({
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
});
export type GenerateAuctionItemInput = z.infer<typeof GenerateAuctionItemInputSchema>;

const GenerateAuctionItemOutputSchema = z.object({
  sentence: z.string().describe("A sentence that is either grammatically correct or incorrect."),
  isCorrect: z.boolean().describe("Whether the provided sentence is grammatically correct."),
  explanation: z.string().describe("A brief explanation of the grammatical error if the sentence is incorrect, or an empty string if it is correct."),
});
export type GenerateAuctionItemOutput = z.infer<typeof GenerateAuctionItemOutputSchema>;

const prompt = ai.definePrompt({
  name: 'generateAuctionItemPrompt',
  input: {schema: GenerateAuctionItemInputSchema},
  output: {schema: GenerateAuctionItemOutputSchema},
  prompt: `You are an expert ESL teacher creating content for a game.
  
  Your task is to generate a single English sentence for a {{difficulty}}-level student.
  You have a 50% chance of making the sentence grammatically correct, and a 50% chance of introducing a single, subtle grammatical error.

  - If the sentence is grammatically correct, set 'isCorrect' to true and 'explanation' to an empty string.
  - If the sentence contains an error, set 'isCorrect' to false and provide a brief, clear explanation of the error.
  
  Do not make the error too obvious for the difficulty level.
  `,
});

const generateAuctionItemFlow = ai.defineFlow(
  {
    name: 'generateAuctionItemFlow',
    inputSchema: GenerateAuctionItemInputSchema,
    outputSchema: GenerateAuctionItemOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

export async function generateAuctionItem(
  input: GenerateAuctionItemInput
): Promise<GenerateAuctionItemOutput> {
  return generateAuctionItemFlow(input);
}
