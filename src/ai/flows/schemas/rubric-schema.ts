import { z } from 'zod';

const RubricLevelSchema = z.object({
  levelName: z.string().describe("The name of the performance level (e.g., 'Exemplary', 'Proficient', 'Developing')."),
  description: z.string().describe("A detailed description of the performance expected at this level for a specific criterion."),
  points: z.number().int().describe("The points awarded for this level."),
});

const RubricCriterionSchema = z.object({
  name: z.string().describe("The name of the criterion to be evaluated (e.g., 'Clarity', 'Organization')."),
  levels: z.array(RubricLevelSchema).length(4).describe("An array of exactly 4 performance levels for this criterion, from highest to lowest score."),
});

export const GenerateRubricInputSchema = z.object({
  studentName: z.string().optional().describe("The name of the student or group being evaluated."),
  className: z.string().optional().describe("The name of the class or section."),
  rubricType: z.string().min(1, "Rubric type is required.").describe("The type of work the rubric is for (e.g., 'Essay', 'Oral Presentation', 'Group Project')."),
  gradeLevel: z.string().min(1, "Grade level is required.").describe("The grade level of the students (e.g., '5th Grade', 'High School', 'University')."),
  scoringUse: z.string().min(1, "Scoring focus is required.").describe("The specific purpose of the scoring (e.g., 'Clarity and grammar')."),
});
export type GenerateRubricInput = z.infer<typeof GenerateRubricInputSchema>;

export const GenerateRubricOutputSchema = z.object({
  title: z.string().describe("A descriptive title for the generated rubric."),
  studentName: z.string().optional().describe("The name of the student or group being evaluated. Should be returned exactly as provided in the input."),
  className: z.string().optional().describe("The name of the class or section. Should be returned exactly as provided in the input."),
  gradeLevel: z.string().describe("The grade level of the students. Should be returned exactly as provided in the input."),
  criteria: z.array(RubricCriterionSchema).min(3).max(6).describe("An array of 3 to 6 evaluation criteria."),
});
export type GenerateRubricOutput = z.infer<typeof GenerateRubricOutputSchema>;
