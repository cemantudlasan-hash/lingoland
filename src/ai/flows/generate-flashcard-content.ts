'use server';

/**
 * @fileOverview A flow that generates flashcard definitions, translations, and context clues.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GenerateFlashcardInputSchema = z.object({
  word: z.string().describe('The unknown word or phrase highlighted by the student.'),
  context: z.string().optional().describe('The surrounding sentence or paragraph where the word was found, to provide context.'),
});
export type GenerateFlashcardInput = z.infer<typeof GenerateFlashcardInputSchema>;

const FlashcardContentSchema = z.object({
  definition: z.string().describe('A simple, clear English definition of the word or phrase.'),
  translation: z.string().describe('A brief translation or simple explanation of the word in Thai, or a simple English synonym if it cannot be translated.'),
  exampleSentence: z.string().describe('An example sentence showing the word used in a natural context (different from the highlighted context, but matching its grammatical usage).'),
  hint: z.string().describe('A short mnemonic or memory aid to help the student learn and recall this word.'),
  emoji: z.string().describe('A single representative emoji that visually captures the meaning of this word or phrase. E.g. "happy" -> "😊", "tree" -> "🌳", "science" -> "🔬".'),
});

const GenerateFlashcardOutputSchema = z.object({
  card: FlashcardContentSchema,
});
export type GenerateFlashcardOutput = z.infer<typeof GenerateFlashcardOutputSchema>;

const prompt = ai.definePrompt({
  name: 'generateFlashcardPrompt',
  input: { schema: GenerateFlashcardInputSchema },
  output: { schema: GenerateFlashcardOutputSchema },
  prompt: `You are an expert ESL tutor and language coach.
Generate flashcard learning content for the word or phrase: "{{word}}"

{{#if context}}
The word was found in this context:
"{{context}}"
Please use this context to determine the correct meaning and grammatical part of speech of "{{word}}".
{{/if}}

Provide:
1. A simple, clear definition in English.
2. A brief translation or simple explanation of the word in Thai.
3. A brand new example sentence demonstrating its usage.
4. A memorable, creative mnemonic hint or memory aid.
5. A single representative emoji that visually represents the word or phrase.
`,
});

const generateFlashcardFlow = ai.defineFlow(
  {
    name: 'generateFlashcardFlow',
    inputSchema: GenerateFlashcardInputSchema,
    outputSchema: GenerateFlashcardOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);

export async function generateFlashcardContent(
  input: GenerateFlashcardInput
): Promise<GenerateFlashcardOutput> {
  return generateFlashcardFlow(input);
}
