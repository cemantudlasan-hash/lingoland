
import { z } from 'zod';

export const ClueSchemaForAI = z.object({
  clue: z.string().describe('The clue for the word.'),
  answer: z.string().describe('The word that is the answer to the clue. Must be a single English word without spaces or hyphens.'),
  direction: z.enum(['across', 'down']),
});

export const CrosswordDataSchemaForAI = z.object({
  theme: z.string().describe('The theme of the crossword puzzle (e.g., "Animals", "Food", "Travel").'),
  clues: z.array(ClueSchemaForAI).min(5).max(10).describe('An array of 5 to 10 interconnected clues.'),
});

export const GenerateCrosswordInputSchema = z.object({
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  theme: z.string().optional().describe('An optional theme for the puzzle.'),
  usedAnswers: z.array(z.string()).optional().describe('A list of answers that have already been used to avoid repetition.'),
});

// This is the final data structure that the flow will return to the client.
// It includes the row, col, and number which are calculated by our code, not the AI.
export const ClueSchema = ClueSchemaForAI.extend({
  row: z.number().int(),
  col: z.number().int(),
  number: z.number().int(),
})

export const CrosswordDataSchema = CrosswordDataSchemaForAI.extend({
    clues: z.array(ClueSchema),
});


export type Clue = z.infer<typeof ClueSchema>;
export type CrosswordData = z.infer<typeof CrosswordDataSchema>;
export type GenerateCrosswordInput = z.infer<typeof GenerateCrosswordInputSchema>;
