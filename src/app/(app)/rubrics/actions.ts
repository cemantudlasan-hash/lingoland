'use server';

import { generateRubric } from '@/ai/flows/generate-rubric';
import type { GenerateRubricInput, GenerateRubricOutput } from '@/ai/flows/schemas/rubric-schema';

export async function generateRubricAction(
  input: GenerateRubricInput
): Promise<GenerateRubricOutput> {
  try {
    const result = await generateRubric(input);
    return result;
  } catch (e) {
    const error = e instanceof Error ? e.message : 'An unknown error occurred.';
    // Re-throw the error to be caught by the client-side try-catch block
    throw new Error(`Failed to generate rubric: ${error}`);
  }
}
