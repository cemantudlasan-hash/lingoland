
'use server';

/**
 * @fileOverview A flow that generates a prompt for a game of charades.
 * - generateCharadesPrompt - A function that generates a charades prompt.
 */

import {ai} from '@/ai/genkit';
import { z } from 'zod';

const GenerateCharadesPromptInputSchema = z.object({
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  usedPrompts: z.array(z.string()).optional().describe('A list of prompts that have already been used in this session.'),
});
export type GenerateCharadesPromptInput = z.infer<typeof GenerateCharadesPromptInputSchema>;

const GenerateCharadesPromptOutputSchema = z.object({
  prompt: z.string().describe('A word or short phrase for a player to act out. Should be an action, object, or well-known character.'),
  category: z.string().describe('The category of the prompt (e.g., "Action", "Object", "Movie", "Animal").'),
});
export type GenerateCharadesPromptOutput = z.infer<typeof GenerateCharadesPromptOutputSchema>;


const prompt = ai.definePrompt({
  name: 'generateCharadesPrompt',
  input: {schema: GenerateCharadesPromptInputSchema},
  output: {schema: GenerateCharadesPromptOutputSchema},
  prompt: `You are a creative game master. Generate a single prompt for a game of charades suitable for an English learner at the {{difficulty}} level.
  
  The prompt should be a word or short, common phrase.
  Also provide a category for the prompt.
  
  Example categories:
  - Object
  - Animal
  - Action
  - Food
  - Movie Title
  - Character
  
  Make the prompts fun and easy to act out. Adjust the difficulty as follows:
  - For 'beginner' difficulty, stick to simple, concrete nouns or verbs (e.g., "eating an apple", "dog", "car").
  - For 'intermediate' difficulty, use slightly more complex actions, objects, or common two-word phrases (e.g., "mowing the lawn", "birthday party", "reading a book"). Use famous but not overly simple movie titles.
  - For 'advanced' difficulty, you can use more abstract concepts, idioms, or longer phrases (e.g., "a blessing in disguise", "first day of school", "winning a trophy").

  {{#if usedPrompts}}
  IMPORTANT: Do not generate any of the following prompts as they have already been used:
  {{#each usedPrompts}}
  - {{this}}
  {{/each}}
  {{/if}}
  `,
});

const generateCharadesPromptFlow = ai.defineFlow(
  {
    name: 'generateCharadesPromptFlow',
    inputSchema: GenerateCharadesPromptInputSchema,
    outputSchema: GenerateCharadesPromptOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

export async function generateCharadesPrompt(
  input: GenerateCharadesPromptInput
): Promise<GenerateCharadesPromptOutput> {
  return generateCharadesPromptFlow(input);
}
