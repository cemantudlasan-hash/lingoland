'use server';

/**
 * @fileOverview A flow that generates a presentation from a topic or an uploaded document.
 * Supports both English and Thai (ภาษาไทย) for school subjects, business, and general presentations.
 * - generatePresentation - A function that creates presentation content.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const SlideSchema = z.object({
  title: z.string().describe('The title of the slide in the requested language (English or Thai).'),
  content: z.array(z.string()).describe('An array of bullet points for the slide content in the requested language (English or Thai). Each bullet point should be a complete sentence and be concise.'),
  imageQuery: z.string().optional().describe('A precise 2-4 word English search query to find a high-quality photograph or realistic illustration directly depicting this slide subject (e.g., "morning routine breakfast people", "solar system earth space", "doctor healthcare clinic"). Must be strictly English only, even when the presentation is in Thai. Never use meta words like "slide", "presentation", "clipart", "worksheet", "diagram", "image", or foreign words.'),
  threeDObjectStyle: z.string().optional().describe('A suggested 3D object shape/color/style for this slide background (e.g. "floating gold cube", "cyan neon sphere", "bouncing blue torus", "spinning green cone").'),
});

const GeneratePresentationInputSchema = z.object({
  topic: z.string().optional().describe('The topic of the presentation.'),
  slideCount: z.number().int().min(3).max(20).describe('The desired number of slides.'),
  documentText: z.string().optional().describe('The extracted text content of the uploaded lesson plan or document.'),
  documentName: z.string().optional().describe('The name of the uploaded document.'),
  insertPhotos: z.boolean().optional().describe('Whether to insert photos.'),
  enable3D: z.boolean().optional().describe('Whether to enable 3D animations.'),
  language: z.enum(['en', 'th']).optional().default('en').describe('The presentation language: "en" for English, "th" for Thai (ภาษาไทย).'),
  category: z.enum(['school_subject', 'business', 'general', 'other']).optional().describe('The category: school subject, business, general, or other.'),
});
export type GeneratePresentationInput = z.infer<typeof GeneratePresentationInputSchema>;

const GeneratePresentationOutputSchema = z.object({
  title: z.string().describe('The main title of the presentation in the requested language.'),
  slides: z.array(SlideSchema).describe('An array of slides for the presentation.'),
  suggestedTheme: z.string().optional().describe('A suggested visual theme style for the presentation, matching the document content.'),
  language: z.string().optional().describe('The language used for this presentation (e.g. "th" or "en").'),
});
export type GeneratePresentationOutput = z.infer<typeof GeneratePresentationOutputSchema>;

const PromptInputSchema = GeneratePresentationInputSchema.extend({
  isThai: z.boolean().optional(),
});

const prompt = ai.definePrompt({
  name: 'generatePresentationPrompt',
  input: { schema: PromptInputSchema },
  output: { schema: GeneratePresentationOutputSchema },
  prompt: `{{#if isThai}}
You are an expert instructional designer, school educator, and professional Thai communicator.
Generate a structured, visually engaging, and comprehensive presentation strictly in fluent, natural Thai (ภาษาไทย).
All titles, slide titles, bullet points, and descriptions MUST be written in Thai.
- For School Subjects (วิชาเรียน/วิชาการ): Ensure high pedagogical value, aligning with modern Thai school curriculum standards (เช่น วิทยาศาสตร์, คณิตศาสตร์, ประวัติศาสตร์, สังคมศึกษา, ภาษาไทย, ภาษาอังกฤษ, วิทยาการคำนวณ, ชีววิทยา, ฟิสิกส์, เคมี, สุขศึกษา). Content should be clear, educational, and inspiring for students.
- For Business & Professional (ธุรกิจและการนำเสนอ): Use authoritative, professional, and actionable business Thai terms (เช่น แผนกลยุทธ์, การตลาดดิจิทัล, การวิเคราะห์กลุ่มเป้าหมาย, การบริหารโครงการ, การเงินและการลงทุน, การวัดผลด้วย KPIs/OKRs).
- For Other & General Topics: Use engaging, well-researched, and culturally appropriate Thai.
{{else}}
You are an expert at creating concise, informative, and visually engaging presentations for educational learners and professionals. All generated presentation titles, slide titles, and bullet points must be strictly in English.
- For School Subjects: Tailored to academic curriculum standards with clear explanations, foundational principles, and real-world examples.
- For Business & Professional: Professional, concise, data-driven, and focused on strategic outcomes.
- For Other & General Topics: Highly informative and engaging.
{{/if}}

{{#if documentText}}
Generate a presentation based on the following uploaded document/lesson plan (Document name: {{documentName}}):
---
{{documentText}}
---
If a topic is also specified: "{{topic}}", focus the presentation around that aspect of the document.
{{else}}
Generate a presentation about the topic: {{topic}}.
{{/if}}

The presentation should have a main title and exactly {{slideCount}} slides.

For each slide:
1. Provide a short, clear title and a list of 3-5 bullet points in {{#if isThai}}fluent, natural Thai (ภาษาไทย){{else}}English{{/if}}.
2. The content should be easy to understand, grammatically accurate, and well-structured.
3. Provide an 'imageQuery' representing 2-4 descriptive English keywords to find a high-quality, authentic real-world photograph directly visualizing the specific subject and concept of this slide (e.g. for "การสังเคราะห์ด้วยแสงของพืช" use "plant photosynthesis sunlight leaves"; for "ระบบสุริยะ" use "solar system planets orbit space"; for "กลยุทธ์การตลาดดิจิทัล" use "digital marketing team strategy analytics"; for "การบริหารโครงการ" use "project management planning whiteboard").
   CRITICAL RULES FOR imageQuery:
   - Must ALWAYS be in the English language ONLY. Even for Thai presentations, imageQuery must be in English so global photo search engines (Unsplash, Google, Bing) return accurate real-world photography.
   - Must accurately, realistically, and specifically depict the real-world subject concept.
   - NEVER use queries that could return sketches, anime drawings, cartoons, clipart, worksheets, diagrams, or meta words like "slide", "test", "assignment".
   - Always focus on real-world nature, environments, objects, people, or places.
4. Provide a 'threeDObjectStyle' indicating a 3D element style to render in the background (e.g. "floating gold cube", "cyan neon sphere", "bouncing blue torus", "spinning green cone").

Start with an introduction slide and end with a conclusion/summary slide.
Also provide a 'suggestedTheme' that fits the overall subject matter of the presentation.
Set the 'language' field to {{#if isThai}}"th"{{else}}"en"{{/if}}.
`,
});

const generatePresentationFlow = ai.defineFlow(
  {
    name: 'generatePresentationFlow',
    inputSchema: GeneratePresentationInputSchema,
    outputSchema: GeneratePresentationOutputSchema,
  },
  async input => {
    const isThai = input.language === 'th';
    const { output } = await prompt({
      ...input,
      isThai,
      category: input.category || 'general'
    });
    return output!;
  }
);

export async function generatePresentation(input: GeneratePresentationInput): Promise<GeneratePresentationOutput> {
  return generatePresentationFlow(input);
}
