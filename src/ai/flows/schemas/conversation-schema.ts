import { z } from 'zod';

export const GenerateConversationChallengeInputSchema = z.object({
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  category: z.enum(['Restaurant', 'Travel', 'Work', 'School', 'Social', 'Emergency', 'Shopping', 'Family', 'Hobbies', 'Technology']),
  usedScenarios: z.array(z.string()).optional().describe('A list of scenario descriptions already used to avoid repetition.'),
});
export type GenerateConversationChallengeInput = z.infer<typeof GenerateConversationChallengeInputSchema>;

export const ConversationOptionSchema = z.object({
    text: z.string().describe("The text of the response option."),
    isCorrect: z.boolean().describe("Whether this is the best response."),
    explanation: z.string().describe("Explanation of why this response is good or why it is not the best choice (e.g. too rude, grammatically wrong, irrelevant)."),
});

export const GenerateConversationChallengeOutputSchema = z.object({
  scenario: z.string().describe("A brief description of the situation (e.g., 'You are at a cafe and want to order a coffee')."),
  characterName: z.string().describe("The name of the character speaking to the student."),
  characterLine: z.string().describe("The opening line spoken by the character."),
  options: z.array(ConversationOptionSchema).length(4).describe("Four possible responses for the student to choose from."),
});
export type GenerateConversationChallengeOutput = z.infer<typeof GenerateConversationChallengeOutputSchema>;
