
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
  1. **Option Consistency**: Every question type MUST include exactly 4 multiple-choice options.
  2. **Answer Distribution**: Randomize the position of the correct answer within the 'options' list for EVERY question. Ensure there is a roughly even distribution of correct answers across letters A, B, C, and D throughout the entire exam.
  3. **Difficulty Scaling**: Adjust the complexity of vocabulary, sentence structure, and distractor subtlety strictly to the {{difficulty}} level.
  
  Please vary the question types between:
  
  1. **Multiple Choice**: Standard trivia or grammar questions about the topic.
  
  2. **Fill in the Blanks**: A sentence with '___' for the missing part. Provide the correct word and 3 plausible distractors in the 'options' field.
  
  3. **Word Unscramble**: 
     - Choose a specific vocabulary word directly related to the topic: **{{topic}}**.
     - Provide the scrambled version of that word as the 'question' text.
     - **CRITICAL ACCURACY**: The scrambled string MUST contain the EXACT same letters with the EXACT same frequency as the correct word. Do NOT include spaces, dashes, or extra letters. (e.g., for 'QUEEN', use 'EEQUN', NOT 'EEQU N').
     - **CHALLENGING OPTIONS**: In the 'options' field, provide the correct word and 3 distractors. The distractors MUST be real words that are:
        a) Related to the topic: **{{topic}}**.
        b) **EXACTLY the same number of letters** as the correct word.
        c) Plausible guesses given the scrambled letters.
  
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
