
'use server';

/**
 * @fileOverview A flow that generates student performance comments.
 */

import { ai } from '@/ai/genkit';
import { 
  GenerateStudentCommentInputSchema, 
  GenerateStudentCommentOutputSchema, 
  type GenerateStudentCommentInput, 
  type GenerateStudentCommentOutput 
} from '@/ai/flows/schemas/comment-generator-schema';

const prompt = ai.definePrompt({
  name: 'generateStudentCommentPrompt',
  input: { schema: GenerateStudentCommentInputSchema },
  output: { schema: GenerateStudentCommentOutputSchema },
  prompt: `You are an expert educator writing performance comments for a student named {{studentName}}.
  
  The student's current level in {{subject}} is {{performanceLevel}}.
  Your tone should be {{tone}}.
  The requested length for each descriptive section (Strengths, Challenges, Next Steps) is approximately: {{commentLength}}.

  {{#if isConcise}}
  CRITICAL INSTRUCTION: Brevity Mode is ENABLED. 
  Keep all feedback ultra-concise and to the point. 
  Avoid introductory phrases or elaborate explanations. 
  Focus on high-impact keywords and essential observations only.
  {{/if}}

  Please generate:
  1. **Strengths**: What are they doing well? (The "Good" comments)
  2. **Challenges**: What are they struggling with? (Constructive "Bad" comments that are honest but professional)
  3. **Next Steps**: What specific things should they focus on to improve? (The "To Improve" path)
  4. **Summary**: A cohesive 1-2 sentence summary that ties it all together for a report card.

  Avoid generic clichés. Make the comments feel specific to the {{performanceLevel}} level and {{subject}} context.
  Ensure each section follows the {{commentLength}} guideline where applicable (excluding the summary).
  `,
});

const generateStudentCommentFlow = ai.defineFlow(
  {
    name: 'generateStudentCommentFlow',
    inputSchema: GenerateStudentCommentInputSchema,
    outputSchema: GenerateStudentCommentOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);

export async function generateStudentComment(
  input: GenerateStudentCommentInput
): Promise<GenerateStudentCommentOutput> {
  return generateStudentCommentFlow(input);
}
