import { z } from 'zod';

export const GenerateArticleExerciseInputSchema = z.object({
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  usedSentences: z.array(z.string()).optional().describe('A list of sentences that have already been used to avoid repetition.'),
});
export type GenerateArticleExerciseInput = z.infer<typeof GenerateArticleExerciseInputSchema>;

export const GenerateArticleExerciseOutputSchema = z.object({
  sentenceWithBlank: z.string().describe("A sentence with '___' where the article should be."),
  correctAnswer: z.enum(['a', 'an', 'the', 'no article']).describe("The correct article for the blank."),
  options: z.array(z.string()).length(4).describe("An array of 4 options, including the correct answer."),
  explanation: z.string().describe("A brief explanation of why the correct article is the right choice."),
});
export type GenerateArticleExerciseOutput = z.infer<typeof GenerateArticleExerciseOutputSchema>;
