
'use server';

/**
 * @fileOverview A flow that generates and evaluates pronunciation exercises.
 *
 * - generatePronunciationPhrase - Generates a phrase for pronunciation practice.
 * - evaluatePronunciation - Evaluates a user's pronunciation against a phrase.
 */

import {ai} from '@/ai/genkit';
import { z } from 'zod';

const GeneratePronunciationPhraseInputSchema = z.object({
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  topic: z.string().optional().describe('An optional topic for the phrase.'),
  usedPhrases: z.array(z.string()).optional().describe('A list of phrases that have already been used in this session to avoid repetition.'),
});
export type GeneratePronunciationPhraseInput = z.infer<typeof GeneratePronunciationPhraseInputSchema>;

const GeneratePronunciationPhraseOutputSchema = z.object({
  phrase: z.string().describe('A short phrase or sentence for pronunciation practice.'),
});
export type GeneratePronunciationPhraseOutput = z.infer<typeof GeneratePronunciationPhraseOutputSchema>;

const WordFeedbackSchema = z.object({
    word: z.string(),
    correct: z.boolean(),
});

const EvaluatePronunciationInputSchema = z.object({
  phrase: z.string().describe('The target phrase the user was supposed to say.'),
  audioDataUri: z.string().describe("The user's recorded audio as a data URI, including a MIME type and Base64 encoding. e.g., 'data:audio/webm;base64,...'"),
});
export type EvaluatePronunciationInput = z.infer<typeof EvaluatePronunciationInputSchema>;

const EvaluatePronunciationOutputSchema = z.object({
    feedback: z.string().describe('Overall feedback for the user, summarizing their performance and giving tips.'),
    score: z.number().int().min(0).max(100).describe('A score from 0 to 100 representing the pronunciation accuracy.'),
    wordFeedback: z.array(WordFeedbackSchema).describe('Feedback on a per-word basis.'),
});
export type EvaluatePronunciationOutput = z.infer<typeof EvaluatePronunciationOutputSchema>;


const generatePronunciationPhraseFlow = ai.defineFlow(
  {
    name: 'generatePronunciationPhraseFlow',
    inputSchema: GeneratePronunciationPhraseInputSchema,
    outputSchema: GeneratePronunciationPhraseOutputSchema,
  },
  async (input) => {
    const {output} = await ai.generate({
        model: 'googleai/gemini-2.5-flash',
        prompt: `Generate a single, short, simple English phrase for a {{difficulty}}-level student to practice pronunciation.
    {{#if topic}} The phrase should be about {{topic}}.{{/if}}
    The phrase should be clear and easy to say. Do not include any special characters or punctuation other than a period at the end.
    
    {{#if usedPhrases}}
    IMPORTANT: Do not generate any of the following phrases as they have already been used:
    {{#each usedPhrases}}
    - {{this}}
    {{/each}}
    {{/if}}
    `,
        output: {
            schema: GeneratePronunciationPhraseOutputSchema
        },
        context: [input]
    });
    return output!;
  }
);

export async function generatePronunciationPhrase(
  input: GeneratePronunciationPhraseInput
): Promise<GeneratePronunciationPhraseOutput> {
  return generatePronunciationPhraseFlow(input);
}


const evaluatePronunciationFlow = ai.defineFlow({
    name: 'evaluatePronunciationFlow',
    inputSchema: EvaluatePronunciationInputSchema,
    outputSchema: EvaluatePronunciationOutputSchema,
}, async (input) => {
    const {output} = await ai.generate({
      model: 'googleai/gemini-2.5-flash',
      prompt: [

        {
          text: `You are an expert English pronunciation coach. Your task is to evaluate a student's pronunciation.
        The target phrase is: "${input.phrase}"
        
        Analyze the provided audio recording of the student speaking the phrase.
        
        Provide the following in your response:
        1.  **Overall Feedback**: A concise, encouraging, and helpful summary of the student's pronunciation.
        2.  **Score**: An overall accuracy score from 0 to 100.
        3.  **Word-by-word Feedback**: An array where each object contains a word from the original phrase and a boolean indicating if it was pronounced correctly.
        
        Be fair but accurate in your assessment. Focus on clarity and correctness of the sounds.`,
        },
        {media: {url: input.audioDataUri}},
      ],
      output: {
          schema: EvaluatePronunciationOutputSchema,
      },
  });

  return output!;
});


export async function evaluatePronunciation(
  input: EvaluatePronunciationInput
): Promise<EvaluatePronunciationOutput> {
  return evaluatePronunciationFlow(input);
}
