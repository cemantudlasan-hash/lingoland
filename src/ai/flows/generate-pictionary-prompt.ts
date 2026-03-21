
'use server';

/**
 * @fileOverview A flow that generates a prompt for a game of Pictionary.
 * - generatePictionaryPrompt - A function that generates a Pictionary prompt.
 */

import {ai} from '@/ai/genkit';
import { z } from 'zod';

const GeneratePictionaryPromptInputSchema = z.object({
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  usedPrompts: z.array(z.string()).optional().describe('A list of prompts that have already been used in this session.'),
});
export type GeneratePictionaryPromptInput = z.infer<typeof GeneratePictionaryPromptInputSchema>;

const GeneratePictionaryPromptOutputSchema = z.object({
  prompt: z.string().describe('A word or short phrase representing a drawable concept.'),
  category: z.string().describe('The category of the prompt (e.g., "Object", "Animal", "Place").'),
});
export type GeneratePictionaryPromptOutput = z.infer<typeof GeneratePictionaryPromptOutputSchema>;


const prompt = ai.definePrompt({
  name: 'generatePictionaryPrompt',
  input: {schema: GeneratePictionaryPromptInputSchema},
  output: {schema: GeneratePictionaryPromptOutputSchema},
  prompt: `You are a fun game designer. Generate a single, random, and creative prompt for a game of Pictionary suitable for an English learner at the {{difficulty}} level.
  
  The prompt must be something that can be drawn.
  Also provide a category for the prompt.
  
  For 'beginner' difficulty, stick to simple, concrete objects or animals (e.g., "apple", "dog", "house").
  For 'intermediate', you can use more complex objects, actions, or places (e.g., "reading a book", "camping", "supermarket").
  For 'advanced', you can use idioms or more abstract concepts that are still drawable (e.g., "time is flying", "a bright idea", "success").
  
  {{#if usedPrompts}}
  IMPORTANT: Do not generate any of the following prompts as they have already been used:
  {{#each usedPrompts}}
  - {{this}}
  {{/each}}
  {{/if}}

  Ensure the generated prompt is different from previous ones. Be creative and surprising!
  `,
});

const generatePictionaryPromptFlow = ai.defineFlow(
  {
    name: 'generatePictionaryPromptFlow',
    inputSchema: GeneratePictionaryPromptInputSchema,
    outputSchema: GeneratePictionaryPromptOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

export async function generatePictionaryPrompt(
  input: GeneratePictionaryPromptInput
): Promise<GeneratePictionaryPromptOutput> {
  return generatePictionaryPromptFlow(input);
}
