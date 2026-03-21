import { z } from 'zod';

export const GenerateGrammarPairInputSchema = z.object({
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  grammarTopic: z.string().describe("The specific grammar topic to focus on, e.g., 'Verbs', 'Adjectives', 'Prepositions'."),
  usedItems: z.array(z.string()).optional().describe('A list of base words/items that have already been used to avoid repetition.'),
});
export type GenerateGrammarPairInput = z.infer<typeof GenerateGrammarPairInputSchema>;

export const GenerateGrammarPairOutputSchema = z.object({
  item: z.string().describe("The base word/item being tested (e.g., the verb, adjective)."),
  goodSentence: z.string().describe("A grammatically correct sentence using the item."),
  badSentence: z.string().describe("A grammatically incorrect sentence using the item."),
  explanation: z.string().describe("A brief explanation of the error in the incorrect sentence."),
});
export type GenerateGrammarPairOutput = z.infer<typeof GenerateGrammarPairOutputSchema>;
