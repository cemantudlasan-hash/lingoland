'use server';

/**
 * @fileOverview A flow that generates a conversational English challenge.
 * - generateConversationChallenge - A function that creates a dialogue scenario and response options.
 */

import { ai } from '@/ai/genkit';
import { 
  GenerateConversationChallengeInputSchema, 
  GenerateConversationChallengeOutputSchema, 
  type GenerateConversationChallengeInput, 
  type GenerateConversationChallengeOutput 
} from '@/ai/flows/schemas/conversation-schema';

const prompt = ai.definePrompt({
  name: 'generateConversationChallengePrompt',
  input: { schema: GenerateConversationChallengeInputSchema },
  output: { schema: GenerateConversationChallengeOutputSchema },
  prompt: `You are an expert ESL teacher creating a "Dialogue Dojo" game.
  
  Your task is to generate a unique, creative, and realistic conversational challenge for a student at the {{difficulty}} level in the category of: {{category}}.
  
  CRITICAL: You must vary the scenarios significantly. Even within the same category, explore different sub-topics.
  - Restaurant: Don't just order coffee. Try: complaining about a cold soup, asking for a table for 10, ordering for someone with an allergy, or splitting the bill.
  - Travel: Try: asking for a seat change on a plane, reporting a lost suitcase at the hotel, asking a local for a recommendation for a hidden gem, or navigating a train station delay.
  - Work: Try: asking for clarification on a task, introducing yourself to a new colleague, politely declining a meeting, or discussing a weekend project.
  - School: Try: asking a librarian for help finding a source, discussing a group project workload, introducing yourself to a new teacher, or inquiring about club activities.
  - Social: Try: joining a conversation at a party, inviting someone to a movie, discussing a new book, or offering help to a neighbor.
  - Emergency: Try: describing symptoms at a pharmacy, reporting a lost wallet, asking for help with a flat tire, or explaining an accidental spill.
  - Shopping: Try: returning a defective item without a receipt, asking for a different size or color, negotiating at a flea market, or finding a specific grocery item.
  - Family: Try: discussing weekend chores, asking for permission for an outing, planning a surprise party for a relative, or resolving a small disagreement about what's for dinner.
  - Hobbies: Try: joining a local sports team, explaining the rules of your favorite game, discussing a creative project like painting or music, or planning a hiking trip.
  - Technology: Try: reporting a bug to tech support, asking for advice on a new gadget, discussing the pros and cons of social media, or explaining how to use a specific app.

  1. Create a "scenario" (1-2 sentences) describing the setting and the character's motivation.
  2. Provide a "characterName" and their "characterLine" (the prompt the student must respond to).
  3. Provide 4 "options" for the student's response.
     - ONE option must be the "correct" (most natural, polite, and grammatically accurate) response.
     - The other THREE options must be "incorrect" for different reasons:
       - One should be grammatically incorrect but relevant.
       - One should be socially inappropriate (too rude or too formal for the context).
       - One should be irrelevant or nonsensical.
  4. For EACH option, provide a clear "explanation" of why it was or wasn't the best choice.

  Difficulty Guidelines:
  - 'beginner': Simple everyday language, common greetings, basic needs.
  - 'intermediate': Nuanced social cues, phrasal verbs, expressing opinions, making requests.
  - 'advanced': Idioms, subtle professional etiquette, handling conflict, complex grammar.

  {{#if usedScenarios}}
  IMPORTANT: To ensure variety, do not generate a scenario similar to any of these previous ones:
  {{#each usedScenarios}}
  - {{this}}
  {{/each}}
  {{/if}}
  `,
});

const generateConversationChallengeFlow = ai.defineFlow(
  {
    name: 'generateConversationChallengeFlow',
    inputSchema: GenerateConversationChallengeInputSchema,
    outputSchema: GenerateConversationChallengeOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);

export async function generateConversationChallenge(
  input: GenerateConversationChallengeInput
): Promise<GenerateConversationChallengeOutput> {
  return generateConversationChallengeFlow(input);
}
