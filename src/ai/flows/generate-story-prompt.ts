
'use server';

/**
 * @fileOverview A flow that generates a starting prompt for a story chain game.
 * - generateStoryPrompt - A function that generates a story prompt.
 */

import {ai} from '@/ai/genkit';
import { z } from 'zod';

const GenerateStoryPromptInputSchema = z.object({
  genre: z.string().describe('The genre of the story (e.g., Fantasy, Sci-Fi, Mystery, Comedy).'),
});
export type GenerateStoryPromptInput = z.infer<typeof GenerateStoryPromptInputSchema>;

const GenerateStoryPromptOutputSchema = z.object({
  prompt: z.string().describe('A single, engaging opening sentence for a story.'),
});
export type GenerateStoryPromptOutput = z.infer<typeof GenerateStoryPromptOutputSchema>;


const prompt = ai.definePrompt({
  name: 'generateStoryPrompt',
  input: {schema: GenerateStoryPromptInputSchema},
  output: {schema: GenerateStoryPromptOutputSchema},
  prompt: `You are a creative author. Generate a single, interesting opening sentence for a story in the {{genre}} genre.
  This sentence will be the start of a collaborative story chain game. Make it intriguing!`,
});

const generateStoryPromptFlow = ai.defineFlow(
  {
    name: 'generateStoryPromptFlow',
    inputSchema: GenerateStoryPromptInputSchema,
    outputSchema: GenerateStoryPromptOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

export async function generateStoryPrompt(
  input: GenerateStoryPromptInput
): Promise<GenerateStoryPromptOutput> {
  return generateStoryPromptFlow(input);
}
