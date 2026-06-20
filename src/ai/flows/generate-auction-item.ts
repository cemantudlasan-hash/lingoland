
'use server';

/**
 * @fileOverview A flow that generates an item for the auction game.
 * - generateAuctionItem - A function that generates a sentence and its correctness.
 */

import {ai} from '@/ai/genkit';
import { z } from 'zod';

const GenerateAuctionItemInputSchema = z.object({
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  forcedIsCorrect: z.boolean().describe("Whether the generated sentence must be grammatically correct (true) or must contain an error (false)."),
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
  
  You MUST follow this instruction exactly:
  {{#if forcedIsCorrect}}
  - Generate a sentence that is GRAMMATICALLY CORRECT. Set 'isCorrect' to true and 'explanation' to an empty string.
  {{else}}
  - Generate a sentence that contains a single, subtle GRAMMATICAL ERROR appropriate for the difficulty level. Set 'isCorrect' to false and provide a brief, clear explanation of the error. Do not make the error too obvious.
  {{/if}}
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
  input: Omit<GenerateAuctionItemInput, 'forcedIsCorrect'>
): Promise<GenerateAuctionItemOutput> {
  // Decide correctness randomly in code — not in the AI prompt —
  // so the result is truly 50/50 and not subject to LLM bias.
  const forcedIsCorrect = Math.random() < 0.5;
  return generateAuctionItemFlow({ ...input, forcedIsCorrect });
}
