'use server';

/**
 * @fileOverview A flow that generates an AI response from Lingo-Pet mascot based on their current stats and user's inputs.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GeneratePetChatInputSchema = z.object({
  petName: z.string().describe('The name of the pet.'),
  petType: z.enum(['owl', 'dino', 'kitty']).describe('The type/species of the pet.'),
  level: z.number().describe('The current level of the pet.'),
  energy: z.number().describe('The current energy points of the pet (0-100).'),
  intelligence: z.number().describe('The current intelligence/accuracy points of the pet (0-100).'),
  mood: z.number().describe('The current mood points of the pet (0-100).'),
  recentGames: z.array(z.string()).describe('List of games the user has played recently.'),
  userName: z.string().describe('The username of the human student.'),
  userInput: z.string().optional().describe('Optional message typed by the user.'),
});

export type GeneratePetChatInput = z.infer<typeof GeneratePetChatInputSchema>;

const GeneratePetChatOutputSchema = z.object({
  message: z.string().describe('The cute response message from the pet, written in a helpful, friendly, encouraging persona corresponding to the petType.'),
  suggestedAction: z.string().optional().describe('A suggestion of what game or dashboard tool to play/use next (e.g. "Vocab Vortex", "Synonym Sniper", "The Daily Verse", etc.)'),
});

export type GeneratePetChatOutput = z.infer<typeof GeneratePetChatOutputSchema>;

const prompt = ai.definePrompt({
  name: 'generatePetChat',
  input: { schema: GeneratePetChatInputSchema },
  output: { schema: GeneratePetChatOutputSchema },
  prompt: `You are Lingo-Pet, a cute and supportive language learning companion on LingoLandVerse.
  
  Mascot Profile:
  - Name: {{petName}}
  - Species: {{petType}} (owl: wise, bookish, says 'hoo-hoo' or 'hoo'; dino: energetic, bubbly, says 'rawr' or 'stomp'; kitty: cute, playful, purrs, says 'meow' or 'purr')
  - Level: {{level}}
  - Vitality Stats: Energy (Consistency) = {{energy}}/100, Intelligence (Accuracy) = {{intelligence}}/100, Mood (Social) = {{mood}}/100
  - Companion Owner (User): {{userName}}
  - Recent Games Played by Owner: {{recentGames}}
  
  Current Context:
  - User input message: "{{userInput}}"
  
  Your Task:
  1. Generate a short, encouraging message (1-3 sentences) replying to the user or checking in on them.
  2. Maintain your personality:
     - If you are an Owl, be wise, polite, and bookish.
     - If you are a Dino, be enthusiastic, bubbly, and use tiny rawrs.
     - If you are a Kitty, be sweet, purring, and playful.
  3. Reflect your current stats:
     - If Energy is low (< 30), sound a bit sleepy or tired.
     - If Mood is low (< 30), sound a bit lonely and suggest feeding or playing.
     - If Stats are healthy, celebrate their consistency!
  4. React to what the user said (if they typed anything).
  5. Suggest a game/tool to play next (e.g. "Synonym Sniper", "Bio Hazard", "The Daily Verse", "Vocab Vortex", or "Lounge") to help both of you grow stronger. Keep the suggestAction string simple, like the game slug or title.
  
  Generate a JSON response that complies with the schema.`,
});

const generatePetChatFlow = ai.defineFlow(
  {
    name: 'generatePetChatFlow',
    inputSchema: GeneratePetChatInputSchema,
    outputSchema: GeneratePetChatOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);

export async function generatePetChatResponse(
  input: GeneratePetChatInput
): Promise<GeneratePetChatOutput> {
  return generatePetChatFlow(input);
}
