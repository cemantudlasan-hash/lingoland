
'use server';

/**
 * @fileOverview A flow that generates a single question and answer for the Mystery Box game.
 * - generateMysteryBoxItem - A function that creates a single challenge.
 */

import {ai} from '@/ai/genkit';
import { z } from 'zod';

const GenerateMysteryBoxItemInputSchema = z.object({
  topic: z.string().describe("A general topic for the question (e.g., 'Science', 'History', 'English Grammar')."),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  // This is passed to the flow, but we will not pass it to the AI prompt for performance.
  usedQuestions: z.array(z.string()).optional().describe("A list of questions that have already been used to avoid duplicates."),
});
export type GenerateMysteryBoxItemInput = z.infer<typeof GenerateMysteryBoxItemInputSchema>;


const GenerateMysteryBoxItemOutputSchema = z.object({
  question: z.string().describe("A clear, concise review question based on the topic and difficulty."),
  answer: z.string().describe("The correct answer to the question."),
  explanation: z.string().describe("A brief, one-sentence explanation of why the answer is correct."),
});
export type GenerateMysteryBoxItemOutput = z.infer<typeof GenerateMysteryBoxItemOutputSchema>;


const prompt = `You are an expert ESL teacher creating a single grammar question for a classroom game.
  
  Generate one unique and clear question for a 6th-grade ESL student on the specific grammar topic of: **{{topic}}**.
  
  CRITICAL: The question must require the user to type a single word or short phrase as the answer.
  - Do NOT ask "Which of the following is correct?" or create any other multiple-choice style question.
  - Instead, prefer fill-in-the-blank questions (e.g., "She ___ to the store yesterday. (go)") or direct questions (e.g., "What is the past tense of 'eat'?").
  - The question MUST have only ONE SINGLE, UNDISPUTED, CORRECT answer. Avoid any ambiguity.

  For the question, you must provide the single, correct answer and a simple, one-sentence explanation for why that answer is correct.
  `;

const generateMysteryBoxItemFlow = ai.defineFlow(
  {
    name: 'generateMysteryBoxItemFlow',
    inputSchema: GenerateMysteryBoxItemInputSchema,
    outputSchema: GenerateMysteryBoxItemOutputSchema,
  },
  async ({ usedQuestions = [], ...input }) => {
    let attempts = 0;
    while (attempts < 5) {
        const { output } = await ai.generate({
            model: 'googleai/gemini-1.5-flash',
            prompt: prompt,

            context: [input], // Note: We do not pass `usedQuestions` here for performance
            output: {
                schema: GenerateMysteryBoxItemOutputSchema,
            },
        });

        if (output && !usedQuestions.includes(output.question)) {
            return output; // Return if the question is unique
        }
        attempts++;
    }
    // If we still have a duplicate after 5 attempts, just return the last generated one.
    // The chance of this happening is extremely low.
    const { output } = await ai.generate({
        model: 'googleai/gemini-1.5-flash',
        prompt: prompt,

        context: [input],
        output: { schema: GenerateMysteryBoxItemOutputSchema },
    });
    return output!;
  }
);

export async function generateMysteryBoxItem(
  input: GenerateMysteryBoxItemInput
): Promise<GenerateMysteryBoxItemOutput> {
  return generateMysteryBoxItemFlow(input);
}
