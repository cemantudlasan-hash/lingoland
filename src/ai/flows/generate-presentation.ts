'use server';

/**
 * @fileOverview A flow that generates a presentation from a topic or an uploaded document.
 * - generatePresentation - A function that creates presentation content.
 */

import {ai} from '@/ai/genkit';
import { z } from 'zod';

const SlideSchema = z.object({
  title: z.string().describe('The title of the slide.'),
  content: z.array(z.string()).describe('An array of bullet points for the slide content. Each bullet point should be a complete sentence and be concise.'),
  imageQuery: z.string().optional().describe('A 1-3 word search query to find a photo related to this slide content.'),
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
  prompt: `You are an expert at creating concise and informative presentations for English language learners.
  
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
  1. Provide a short, clear title and a list of 3-5 bullet points.
  2. The content should be easy to understand, grammatically correct, and well-structured.
  3. Provide an 'imageQuery' representing a 1-3 word search query to find a photo related to the slide's content.
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
