
'use server';

import { ai } from '@/ai/genkit';
import { 
  GenerateRiddleInputSchema, 
  GenerateRiddleOutputSchema, 
  type GenerateRiddleInput, 
  type GenerateRiddleOutput 
} from '@/ai/flows/schemas/riddle-schema';

const prompt = ai.definePrompt({
  name: 'generateRiddlePrompt',
  input: { schema: GenerateRiddleInputSchema },
  output: { schema: GenerateRiddleOutputSchema },
  prompt: `You are the AI Oracle, a mystical riddler.
  
  Your task is to generate a clever English riddle appropriate for a {{difficulty}} level student.
  
  1. Write a riddle that describes an object, animal, or concept without naming it.
  2. Provide 4 multiple-choice options. Shuffled.
  3. Provide a clear explanation of the wordplay or logic used.

  Difficulty Guidelines:
  - 'beginner': Simple concrete nouns like "shadow", "clock", "river", "envelope". Use simple language.
  - 'intermediate': Slightly more abstract or metaphorical riddles (e.g., "keyboard", "map", "towel").
  - 'advanced': Nuanced wordplay or abstract concepts (e.g., "echo", "breath", "silence").

  {{#if usedAnswers}}
  IMPORTANT: Do not use any of the following as the correct answer:
  {{#each usedAnswers}}
  - {{this}}
  {{/each}}
  {{/if}}
  `,
});

const generateRiddleFlow = ai.defineFlow(
  {
    name: 'generateRiddleFlow',
    inputSchema: GenerateRiddleInputSchema,
    outputSchema: GenerateRiddleOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);

export async function generateRiddle(
  input: GenerateRiddleInput
): Promise<GenerateRiddleOutput> {
  return generateRiddleFlow(input);
}
