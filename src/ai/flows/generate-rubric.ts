'use server';

/**
 * @fileOverview A flow that generates a scoring rubric.
 * - generateRubric - A function that creates rubric content.
 */

import {ai} from '@/ai/genkit';
import {GenerateRubricInputSchema, GenerateRubricOutputSchema, type GenerateRubricInput, type GenerateRubricOutput } from '@/ai/flows/schemas/rubric-schema';


const prompt = ai.definePrompt({
  name: 'generateRubricPrompt',
  input: {schema: GenerateRubricInputSchema},
  output: {schema: GenerateRubricOutputSchema},
  prompt: `You are an expert educator who specializes in creating detailed, clear, and fair scoring rubrics.

Generate a rubric based on the following specifications:
- Rubric for: {{rubricType}}
- Student/Group: {{#if studentName}}{{studentName}}{{else}}N/A{{/if}}
- Class: {{#if className}}{{className}}{{else}}N/A{{/if}}
- Grade Level: {{gradeLevel}}
- Scoring Focus: {{scoringUse}}

The rubric must have a clear title.
The rubric must also return the studentName, className, and gradeLevel as provided in the input.
The rubric must have between 3 and 6 distinct evaluation criteria.
For each criterion, you must define exactly 4 performance levels (e.g., Exemplary, Proficient, Developing, Beginning).
Each performance level must include a name, a detailed description of expectations, and a point value. The point values should descend logically from the highest level to the lowest.
The language used should be appropriate for the specified grade level.
`,
});

const generateRubricFlow = ai.defineFlow(
  {
    name: 'generateRubricFlow',
    inputSchema: GenerateRubricInputSchema,
    outputSchema: GenerateRubricOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error("The AI failed to generate a valid rubric structure.");
    }
    // Manually add studentName and className to the output as the AI might not always include it
    return {
      ...output,
      studentName: input.studentName,
      className: input.className,
      gradeLevel: input.gradeLevel,
    };
  }
);


export async function generateRubric(
  input: GenerateRubricInput
): Promise<GenerateRubricOutput> {
  return generateRubricFlow(input);
}
