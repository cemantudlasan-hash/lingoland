
'use server';

import { ai } from '@/ai/genkit';
import { GenerateLessonPlanInputSchema, GenerateLessonPlanOutputSchema, type GenerateLessonPlanInput, type GenerateLessonPlanOutput } from '@/ai/flows/schemas/lesson-plan-schema';


const prompt = ai.definePrompt({
  name: 'generateLessonPlanPrompt',
  input: { schema: GenerateLessonPlanInputSchema },
  output: { schema: GenerateLessonPlanOutputSchema },
  prompt: `You are an expert curriculum developer. Generate a detailed, single-day lesson plan for the following criteria:

Topic: {{topic}}
Student Type: {{studentType}}
Grade Level: {{grade}}
Subject: {{subject}}

The lesson plan should be structured and engaging. For the {{studentType}}s, adjust the complexity, vocabulary, and activity types accordingly.
Provide a clear objective, a list of materials, a warm-up activity, 2 to 4 main activities, a cool-down activity, an assessment method, and an optional homework assignment.
Include an estimated duration in minutes for the warm-up, each main activity, and the cool-down.
The total duration of all timed activities should be between 45 and 60 minutes.
`,
});

const generateLessonPlanFlow = ai.defineFlow(
  {
    name: 'generateLessonPlanFlow',
    inputSchema: GenerateLessonPlanInputSchema,
    outputSchema: GenerateLessonPlanOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return {
        ...output!,
        teacher: input.teacher || '',
        grade: input.grade || '',
        subject: input.subject || '',
        date: input.date || '',
    }
  }
);

export async function generateLessonPlan(
  input: GenerateLessonPlanInput
): Promise<GenerateLessonPlanOutput> {
  return generateLessonPlanFlow(input);
}

