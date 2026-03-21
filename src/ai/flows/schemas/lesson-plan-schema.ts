
import { z } from 'zod';

const LessonPlanSchema = z.object({
  title: z.string().describe('The title of the lesson plan.'),
  objective: z.string().describe('The main learning objective for the lesson.'),
  materials: z.array(z.string()).describe('A list of materials needed for the lesson.'),
  warmUp: z.object({
    activity: z.string().describe('A short warm-up activity.'),
    duration: z.number().int().describe('Estimated duration in minutes.'),
  }),
  mainActivities: z.array(z.object({
    activity: z.string().describe('A description of a main activity.'),
    duration: z.number().int().describe('Estimated duration in minutes.'),
  })).describe('An array of 2 to 4 main activities for the lesson.'),
  coolDown: z.object({
    activity: z.string().describe('A short cool-down or wrap-up activity.'),
    duration: z.number().int().describe('Estimated duration in minutes.'),
  }),
  assessment: z.string().describe('How student understanding will be assessed.'),
  homework: z.string().optional().describe('Optional homework assignment.'),
  teacher: z.string().optional().describe("The teacher's name."),
  grade: z.string().optional().describe("The grade level for the lesson."),
  subject: z.string().optional().describe("The subject of the lesson."),
  date: z.string().optional().describe("The date for the lesson.")
});

export const GenerateLessonPlanInputSchema = z.object({
  topic: z.string().describe('The main topic of the lesson.'),
  studentType: z.enum(['ESL Student', 'Native English Student']),
  teacher: z.string().optional(),
  grade: z.string().optional(),
  subject: z.string().optional(),
  date: z.string().optional(),
});
export type GenerateLessonPlanInput = z.infer<typeof GenerateLessonPlanInputSchema>;

export const GenerateLessonPlanOutputSchema = LessonPlanSchema;
export type GenerateLessonPlanOutput = z.infer<typeof GenerateLessonPlanOutputSchema>;
