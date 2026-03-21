
import { z } from 'zod';

export const GenerateStudentCommentInputSchema = z.object({
  studentName: z.string().describe('The name of the student.'),
  performanceLevel: z.enum(['Excellent', 'Good', 'Satisfactory', 'Needs Improvement']).describe('The overall performance level.'),
  subject: z.string().describe('The subject or specific skill being assessed.'),
  tone: z.enum(['Professional', 'Friendly', 'Encouraging']).describe('The tone of the comments.'),
  commentLength: z.enum(['1-2 sentences', '2-3 sentences', '3-5 sentences', '4-6 sentences', 'Normal']).describe('The desired length of the generated comments.'),
  isConcise: z.boolean().optional().describe('Whether to make the output ultra-concise and brief.'),
});

export type GenerateStudentCommentInput = z.infer<typeof GenerateStudentCommentInputSchema>;

export const GenerateStudentCommentOutputSchema = z.object({
  strengths: z.string().describe('Positive feedback regarding the student\'s performance.'),
  challenges: z.string().describe('Critical but constructive feedback regarding current difficulties.'),
  nextSteps: z.string().describe('Specific actions the student can take to improve.'),
  summary: z.string().describe('A 1-2 sentence summary comment for report cards.'),
});

export type GenerateStudentCommentOutput = z.infer<typeof GenerateStudentCommentOutputSchema>;
