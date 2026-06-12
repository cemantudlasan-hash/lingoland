'use server';

/**
 * @fileOverview A flow that scans a student's worksheet from an image and grades the answers.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const ScanWorksheetInputSchema = z.object({
  imageDataUri: z.string().describe("The base64 encoded image data URI of the worksheet. e.g., 'data:image/jpeg;base64,...'"),
  additionalInstructions: z.string().optional().describe("Optional answer key or specific grading guidelines for the AI."),
});
export type ScanWorksheetInput = z.infer<typeof ScanWorksheetInputSchema>;

const GradedQuestionSchema = z.object({
  questionNumber: z.number().nullable().describe("The number of the question if visible (e.g. 1, 2, 3)"),
  questionText: z.string().describe("The text of the question or prompt being evaluated"),
  studentAnswer: z.string().describe("The student's written or selected response"),
  correctAnswer: z.string().describe("The expected correct answer key for this question"),
  isCorrect: z.boolean().describe("Whether the student's answer is correct or not"),
  feedback: z.string().optional().describe("Specific short feedback for this question (e.g. 'Spelling error', 'Correct')"),
});

const ScanWorksheetOutputSchema = z.object({
  score: z.object({
    correctCount: z.number().describe("The number of questions answered correctly"),
    totalCount: z.number().describe("The total number of questions detected and evaluated"),
    percentage: z.number().describe("The calculated percentage score (0 to 100)"),
  }),
  questions: z.array(GradedQuestionSchema).describe("The list of graded questions detected on the worksheet"),
  generalFeedback: z.string().describe("General assessment of the worksheet performance"),
});
export type ScanWorksheetOutput = z.infer<typeof ScanWorksheetOutputSchema>;

const scanWorksheetFlow = ai.defineFlow({
  name: 'scanWorksheetFlow',
  inputSchema: ScanWorksheetInputSchema,
  outputSchema: ScanWorksheetOutputSchema,
}, async (input) => {
  const { output } = await ai.generate({
    model: 'googleai/gemini-2.5-flash',
    prompt: [
      {
        text: `You are an expert grading assistant. Your task is to analyze the provided image of a student's worksheet or English homework.
        Read each question, the student's handwritten or typed response, and evaluate if it is correct or incorrect.

        For each question:
        1. Identify the question number and text.
        2. Detect the student's written response.
        3. Determine the expected correct answer key.
        4. Determine if it is correct (true) or incorrect (false).
        5. Provide a short, constructive feedback note for that question.

        Then, calculate:
        - Total correct questions count.
        - Total detected questions count.
        - The overall percentage score (correct / total * 100).
        
        Write a brief general feedback summary describing the student's performance.

        ${input.additionalInstructions ? `
        IMPORTANT: Adhere strictly to the following grading guidelines or answer key details provided by the teacher:
        "${input.additionalInstructions}"
        ` : ''}
        
        Be fair, accurate, and supportive. If some text is unreadable, make a reasonable guess or flag it in the question feedback.`,
      },
      { media: { url: input.imageDataUri } },
    ],
    output: {
      schema: ScanWorksheetOutputSchema,
    },
  });

  return output!;
});

export async function scanWorksheet(input: ScanWorksheetInput): Promise<ScanWorksheetOutput> {
  return scanWorksheetFlow(input);
}
