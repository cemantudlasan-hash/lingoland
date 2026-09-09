'use server';

/**
 * @fileOverview A flow that generates a presentation from a topic or an uploaded document.
 * - generatePresentation - A function that creates presentation content.
 */

import {ai} from '@/ai/genkit';
import { z } from 'zod';

const SlideSchema = z.object({
  title: z.string().describe('The title of the slide in English.'),
  content: z.array(z.string()).describe('An array of bullet points for the slide content in English. Each bullet point should be a complete sentence and be concise.'),
  imageQuery: z.string().optional().describe('A precise 2-4 word English search query to find a high-quality photograph or realistic illustration directly depicting this slide subject (e.g., "morning routine breakfast people", "solar system earth space", "doctor healthcare clinic"). Must be strictly English only. Never use meta words like "slide", "presentation", "clipart", "worksheet", "diagram", "image", or foreign words.'),
  threeDObjectStyle: z.string().optional().describe('A suggested 3D object shape/color/style for this slide background (e.g. "floating gold cube", "cyan neon sphere", "bouncing blue torus", "spinning green cone").'),
});

const GeneratePresentationInputSchema = z.object({
  topic: z.string().optional().describe('The topic of the presentation.'),
  slideCount: z.number().int().min(3).max(20).describe('The desired number of slides.'),
  documentText: z.string().optional().describe('The extracted text content of the uploaded lesson plan or document.'),
  documentName: z.string().optional().describe('The name of the uploaded document.'),
  insertPhotos: z.boolean().optional().describe('Whether to insert photos.'),
  enable3D: z.boolean().optional().describe('Whether to enable 3D animations.'),
});
export type GeneratePresentationInput = z.infer<typeof GeneratePresentationInputSchema>;

const GeneratePresentationOutputSchema = z.object({
  title: z.string().describe('The main title of the presentation.'),
  slides: z.array(SlideSchema).describe('An array of slides for the presentation.'),
  suggestedTheme: z.string().optional().describe('A suggested visual theme style for the presentation, matching the document content.'),
});
export type GeneratePresentationOutput = z.infer<typeof GeneratePresentationOutputSchema>;


export async function generatePresentation(input: GeneratePresentationInput): Promise<GeneratePresentationOutput> {
  return generatePresentationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePresentationPrompt',
  input: {schema: GeneratePresentationInputSchema},
  output: {schema: GeneratePresentationOutputSchema},
  prompt: `You are an expert at creating concise, informative, and visually engaging presentations for English language learners. All generated text must be strictly in English.
  
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
  1. Provide a short, clear title and a list of 3-5 bullet points in English.
  2. The content should be easy to understand, grammatically correct, and well-structured.
  3. Provide an 'imageQuery' representing 2-4 descriptive English keywords to find a high-quality, authentic real-world photograph directly visualizing the specific subject and topic of this slide (e.g. for "Outdoors and Indoors", use "outdoor nature forest landscape" for outdoor slides, and "indoor living room architecture" for indoor slides; for "Daily Routines", use "morning routine breakfast people").
     CRITICAL RULES FOR imageQuery:
     - Must be in the English language ONLY. No other languages or regional terms.
     - Must accurately, realistically, and specifically depict the real-world subject concept.
     - NEVER use queries that could return sketches, anime drawings, drawing tutorials, facial sketches, cartoons, clipart, worksheets, diagrams, or meta words like "slide", "test", "assignment".
     - Always focus on real-world nature, environments, objects, people, or places.
  4. Provide a 'threeDObjectStyle' indicating a 3D element style to render in the background (e.g. "floating gold cube", "cyan neon sphere", "bouncing blue torus").
  
  Start with an introduction slide and end with a conclusion slide.
  Also provide a 'suggestedTheme' that fits the overall subject matter of the presentation.
  `,
});

const generatePresentationFlow = ai.defineFlow(
  {
    name: 'generatePresentationFlow',
    inputSchema: GeneratePresentationInputSchema,
    outputSchema: GeneratePresentationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
