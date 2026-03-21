import { z } from 'zod';

export const ExamQuestionSchema = z.object({
  type: z.enum(['multiple_choice', 'fill_in_the_blank', 'unscramble']),
  question: z.string().describe('The question text or the sentence to be unscrambled.'),
  options: z.array(z.string()).optional().describe('Required for multiple choice. Provide 4 options.'),
  correctAnswer: z.string().describe('The correct answer (the full correct sentence for unscramble).'),
  explanation: z.string().describe('A brief explanation of why the answer is correct.'),
});

export const GenerateExamInputSchema = z.object({
  topic: z.string().min(3, "Topic is required."),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  itemCount: z.number().int().min(10).max(50),
  usedQuestions: z.array(z.string()).optional().describe('A list of questions already used for this topic to avoid repetition.'),
});

export const GenerateExamOutputSchema = z.object({
  title: z.string(),
  questions: z.array(ExamQuestionSchema),
});

export type ExamQuestion = z.infer<typeof ExamQuestionSchema>;
export type GenerateExamInput = z.infer<typeof GenerateExamInputSchema>;
export type GenerateExamOutput = z.infer<typeof GenerateExamOutputSchema>;
