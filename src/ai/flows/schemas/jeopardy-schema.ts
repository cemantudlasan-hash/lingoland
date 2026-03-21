
import { z } from 'zod';

export const JeopardyQuestionSchema = z.object({
  question: z.string().describe('A trivia question.'),
  answer: z.string().describe('The correct answer to the question.'),
  points: z.number().int().describe('The point value for the question (e.g., 100, 200, 300, 400, 500).'),
});

export const JeopardyCategorySchema = z.object({
  categoryName: z.string().describe('The name of the category.'),
  questions: z.array(JeopardyQuestionSchema).length(5).describe('An array of 5 questions for this category, in increasing order of difficulty and points.'),
});

export const GenerateJeopardyBoardInputSchema = z.object({
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
    customCategories: z.array(z.string()).optional().describe('A list of 5 optional custom category names.'),
});
export type GenerateJeopardyBoardInput = z.infer<typeof GenerateJeopardyBoardInputSchema>;

export const GenerateJeopardyBoardOutputSchema = z.object({
    categories: z.array(JeopardyCategorySchema).length(5).describe('An array of 5 categories, each with 5 questions.'),
});
export type GenerateJeopardyBoardOutput = z.infer<typeof GenerateJeopardyBoardOutputSchema>;
