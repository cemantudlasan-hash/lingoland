
'use server';

/**
 * @fileOverview A flow that generates ESL exercises based on a topic and difficulty level.
 *
 * - generateEslExercise - A function that generates ESL exercises.
 */

import {ai} from '@/ai/genkit';
import { z } from 'zod';

const GenerateEslExerciseInputSchema = z.object({
  topic: z.string().describe('The topic of the ESL exercise.'),
  difficultyLevel: z
    .enum(['beginner', 'intermediate', 'advanced'])
    .describe('The difficulty level of the ESL exercise.'),
  exerciseLength: z
    .enum(['short', 'medium', 'long'])
    .describe('The desired length of the exercise.'),
});
export type GenerateEslExerciseInput = z.infer<typeof GenerateEslExerciseInputSchema>;

const GenerateEslExerciseOutputSchema = z.object({
  exercise: z.string().describe('The generated ESL exercise.'),
});
export type GenerateEslExerciseOutput = z.infer<typeof GenerateEslExerciseOutputSchema>;


export async function generateEslExercise(input: GenerateEslExerciseInput): Promise<GenerateEslExerciseOutput> {
  try {
    return await generateEslExerciseFlow(input);
  } catch (err: any) {
    console.error("🔴 GENKIT_ERROR:", err?.message || err);
    throw err;
  }
}












const generateEslExercisePrompt = ai.definePrompt({
  name: 'generateEslExercisePrompt',
  input: {schema: GenerateEslExerciseInputSchema},
  output: {schema: GenerateEslExerciseOutputSchema},
  prompt: `You are an experienced ESL teacher. Generate a {{exerciseLength}}-length ESL exercise on the topic of "{{topic}}" for {{difficultyLevel}} level students.

CRITICAL: You must output the exercise in standard, semantic HTML format within the JSON "exercise" string.
- Do NOT use markdown.
- Use <h2> for the main exercise title (e.g., "My Daily Routine - Beginner ESL Exercise").
- Use <h3> for the parts/sections (e.g., "Part 1: Reading Passage", "Part 2: Comprehension Questions", "Part 3: Vocabulary Practice").
- Use <p> for paragraphs, reading text, or instructions.
- Use <ol> or <ul> and <li> for list items, questions, or exercise choices.
- Use <b> or <strong> for key words, bolded terms, or blank guides.
- For fill-in-the-blank items, use "_______" (multiple underscores) to represent the blanks.
- Ensure all HTML tags are correctly opened and closed. Do not include markdown code block wrappers (like \`\`\`html) inside the string.`,
});

const generateEslExerciseFlow = ai.defineFlow(
  {
    name: 'generateEslExerciseFlow',
    inputSchema: GenerateEslExerciseInputSchema,
    outputSchema: GenerateEslExerciseOutputSchema,
  },
  async input => {
    const {output} = await generateEslExercisePrompt(input);
    return output!;
  }
);
