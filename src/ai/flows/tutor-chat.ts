'use server';

/**
 * @fileOverview A flow that handles interactive, multi-turn chat sessions with specialized AI marketplace tutors.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const ChatMessageSchema = z.object({
  role: z.enum(['user', 'model']),
  text: z.string(),
});

const TutorChatInputSchema = z.object({
  tutorName: z.string().describe('The name of the specialized AI tutor.'),
  tutorPrompt: z.string().describe('System prompt instructing the AI how to behave and teach.'),
  latestMessage: z.string().describe('The new message typed by the user.'),
  messageHistory: z.array(ChatMessageSchema).describe('The historical chat exchanges in this session.'),
});
export type TutorChatInput = z.infer<typeof TutorChatInputSchema>;

const TutorChatOutputSchema = z.object({
  replyText: z.string().describe('The persona-aligned, educational response from the tutor, styled with markdown.'),
});
export type TutorChatOutput = z.infer<typeof TutorChatOutputSchema>;

const tutorChatFlow = ai.defineFlow(
  {
    name: 'tutorChatFlow',
    inputSchema: TutorChatInputSchema,
    outputSchema: TutorChatOutputSchema,
  },
  async (input) => {
    // We map the message history into the standard Genkit messages format,
    // placing the specialized tutor prompt inside the system prompt.
    const messages = [
      {
        role: 'system',
        content: [
          {
            text: `You are "${input.tutorName}", a highly specialized AI tutor/subject module in the LingoLand marketplace.
Your instructions are:
"${input.tutorPrompt}"

Guidelines:
1. Always stay in character and maintain this persona.
2. Keep your answers engaging, educational, clear, and encouraging.
3. Use markdown formatting (bolding, lists, code blocks, tables) to make your teaching visually beautiful and readable.
4. Correct any grammatical or spelling mistakes the user makes politely, providing a quick, helpful tip.`
          }
        ]
      },
      ...input.messageHistory.map((m) => ({
        role: m.role,
        content: [{ text: m.text }],
      })),
      {
        role: 'user',
        content: [{ text: input.latestMessage }],
      }
    ];

    const response = await ai.generate({
      model: 'googleai/gemini-2.5-flash',
      // @ts-ignore
      messages: messages,
    });

    return {
      replyText: response.text,
    };
  }
);

export async function chatWithTutor(
  input: TutorChatInput
): Promise<TutorChatOutput> {
  return tutorChatFlow(input);
}
