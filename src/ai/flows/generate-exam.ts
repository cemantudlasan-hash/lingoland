
'use server';

/**
 * @fileOverview A flow that generates a complete ESL exam.
 * - generateExam - A function that creates a multi-item exam.
 */

import { ai } from '@/ai/genkit';
import { GenerateExamInputSchema, GenerateExamOutputSchema, type GenerateExamInput, type GenerateExamOutput } from '@/ai/flows/schemas/exam-schema';

const prompt = ai.definePrompt({
  name: 'generateExamPrompt',
  input: { schema: GenerateExamInputSchema },
  output: { schema: GenerateExamOutputSchema },
  prompt: `You are an expert ESL examiner. Create a professional, high-quality exam about the topic: **{{topic}}** for a **{{difficulty}}** level student.
  
  The exam must contain exactly {{itemCount}} items.
  
  CRITICAL SYSTEM INSTRUCTIONS:
  1. **Option Consistency**: 
     - For 'multiple_choice' and 'fill_in_the_blank' questions: MUST include exactly 4 multiple-choice options in the 'options' array.
     - For 'unscramble' questions: Do NOT provide options! Omit the 'options' field or leave it empty. Unscramble questions must NEVER have multiple-choice choices.
  2. **Answer Distribution**: Randomize the position of the correct answer within the 'options' list for multiple_choice and fill_in_the_blank questions. Ensure there is a roughly even distribution of correct answers across letters A, B, C, and D throughout the entire exam.
  3. **Difficulty Scaling**: Adjust the complexity of vocabulary, sentence structure, and distractor subtlety strictly to the {{difficulty}} level.
  
  Please vary the question types between:
  
  1. **Multiple Choice**: Standard trivia or grammar questions about the topic.
  
  2. **Fill in the Blanks**: A sentence with '___' for the missing part. Provide the correct word and 3 plausible distractors in the 'options' field.
  
  3. **Word Unscramble**: 
     - Choose a specific vocabulary word directly related to the topic: **{{topic}}**.
     - Provide the scrambled version of that word as the 'question' text (e.g., for 'PENGUIN', use 'NUEPGIN').
     - **CRITICAL ACCURACY**: The scrambled string MUST contain the EXACT same letters with the EXACT same frequency as the correct word. Do NOT include spaces, dashes, or extra letters.
     - **NO CHOICES**: Do NOT provide choices or distractors in 'options'. Leave 'options' omitted or empty.
     - **TIP OF THE WORD**: Provide a 'tip' field containing a clear, educational clue, tip, or definition describing the secret word that the student needs to unscramble (e.g. tip: "A flightless bird living in cold polar regions that loves to swim").
     - **CORRECT ANSWER**: Set 'correctAnswer' to the unscrambled correct word (e.g. "PENGUIN"). It will be shown in the answer key.
  
  {{#if usedQuestions}}
  IMPORTANT: To ensure variety, do not use any of the following specific questions or unscramble words which have been used in previous sessions for this topic:
  {{#each usedQuestions}}
  - {{this}}
  {{/each}}
  {{/if}}

  Ensure the exam is engaging and educational. Provide a concise, helpful explanation for each answer.
  `,
});

const generateExamFlow = ai.defineFlow(
  {
    name: 'generateExamFlow',
    inputSchema: GenerateExamInputSchema,
    outputSchema: GenerateExamOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);

export async function generateExam(
  input: GenerateExamInput
): Promise<GenerateExamOutput> {
  return generateExamFlow(input);
}
