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
  userLanguage: z.string().optional().describe('The language for translating the response (e.g. Thai).'),
});
export type TutorChatInput = z.infer<typeof TutorChatInputSchema>;

const TutorChatOutputSchema = z.object({
  replyText: z.string().describe('The persona-aligned, educational response from the tutor, styled with markdown.'),
  translationText: z.string().optional().describe('Translation of replyText into the userLanguage.'),
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

    let translationText = '';
    if (input.userLanguage && input.userLanguage.toLowerCase() !== 'english') {
      try {
        const transRes = await ai.generate({
          model: 'googleai/gemini-2.5-flash',
          prompt: `Translate the following text into ${input.userLanguage}. Keep markdown formatting intact. Only return the translated text:\n\n${response.text}`,
        });
        translationText = transRes.text;
      } catch (err) {
        console.error("Translation generation failed:", err);
      }
    }

    return {
      replyText: response.text,
      translationText,
    };
  }
);

export async function chatWithTutor(
  input: TutorChatInput
): Promise<TutorChatOutput> {
  return tutorChatFlow(input);
}

export async function translateText(
  text: string,
  targetLanguage: string
): Promise<string> {
  if (!text || !targetLanguage || targetLanguage.toLowerCase() === 'english') {
    return '';
  }
  try {
    const transRes = await ai.generate({
      model: 'googleai/gemini-2.5-flash',
      prompt: `Translate the following text into ${targetLanguage}. Keep markdown formatting (like bolding, lists) intact. Only return the translated text:\n\n${text}`,
    });
    return transRes.text;
  } catch (err) {
    console.error("Manual translation failed:", err);
    return '';
  }
}
