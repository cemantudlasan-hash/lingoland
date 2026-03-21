
'use server';

/**
 * @fileOverview A flow to start a game of Twenty Questions.
 * - startTwentyQuestions - The AI thinks of an object.
 */

import {ai} from '@/ai/genkit';
import { z } from 'zod';

const StartTwentyQuestionsInputSchema = z.object({
  difficulty: z.enum(['easy', 'medium', 'hard']),
  topic: z.string().optional().describe('An optional topic for the object (e.g., "kitchen items", "animals", "sports equipment").'),
  usedObjects: z.array(z.string()).optional().describe("A list of secret objects that have already been used in this session to avoid repetition."),
});
export type StartTwentyQuestionsInput = z.infer<typeof StartTwentyQuestionsInputSchema>;

const StartTwentyQuestionsOutputSchema = z.object({
  secretObject: z.string().describe("The secret object the AI is thinking of. This should NOT be revealed to the user until the end."),
  initialClue: z.string().describe("An initial clue about the object, like its category (e.g., 'I am an animal', 'I am a type of food')."),
});
export type StartTwentyQuestionsOutput = z.infer<typeof StartTwentyQuestionsOutputSchema>;


const prompt = ai.definePrompt({
  name: 'startTwentyQuestionsPrompt',
  input: {schema: StartTwentyQuestionsInputSchema},
  output: {schema: StartTwentyQuestionsOutputSchema},
  prompt: `You are the host of a "Twenty Questions" game for an ESL learner.

  Your task is to think of a secret object based on the requested difficulty and topic.

  - For 'easy' difficulty, choose a very common, simple object (e.g., "banana", "chair", "cat").
  - For 'medium' difficulty, choose a slightly more complex or specific object (e.g., "stapler", "penguin", "bicycle").
  - For 'hard' difficulty, choose a more challenging or less common object (e.g., "compass", "chameleon", "metronome").
  
  {{#if topic}}
  The object must be related to the topic: {{topic}}.
  {{/if}}

  {{#if usedObjects}}
  IMPORTANT: Do not choose any of the following objects as they have already been used:
  {{#each usedObjects}}
  - {{this}}
  {{/each}}
  {{/if}}

  Once you have chosen your secret object, provide an initial clue to the user. The clue should state the object's general category. For example: "I am a piece of fruit," or "I am a household appliance."
  
  Do not reveal the secret object in the initial clue.
  `,
});

const startTwentyQuestionsFlow = ai.defineFlow(
  {
    name: 'startTwentyQuestionsFlow',
    inputSchema: StartTwentyQuestionsInputSchema,
    outputSchema: StartTwentyQuestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

export async function startTwentyQuestions(
  input: StartTwentyQuestionsInput
): Promise<StartTwentyQuestionsOutput> {
  return startTwentyQuestionsFlow(input);
}
