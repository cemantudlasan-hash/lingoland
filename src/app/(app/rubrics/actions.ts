'use server';

import { generateRubric } from '@/ai/flows/generate-rubric';
import type {
  GenerateRubricInput,
  GenerateRubricOutput,
} from '@/ai/flows/schemas/rubric-schema';

export async function generateRubricAction(
  input: GenerateRubricInput
): Promise<GenerateRubricOutput> {
  return generateRubric(input);
}
