
'use server';

/**
 * @fileOverview A flow that generates a presentation from a topic.
 * - generatePresentation - A function that creates presentation content.
 */

import {ai} from '@/ai/genkit';
import { z } from 'zod';

const SlideSchema = z.object({
  title: z.string().describe('The title of the slide.'),
  content: z.array(z.string()).describe('An array of bullet points for the slide content. Each bullet point should be a complete sentence and be concise.'),
});

const GeneratePresentationInputSchema = z.object({
  topic: z.string().describe('The topic of the presentation.'),
  slideCount: z.number().int().min(3).max(20).describe('The desired number of slides.'),
});
export type GeneratePresentationInput = z.infer<typeof GeneratePresentationInputSchema>;

const GeneratePresentationOutputSchema = z.object({
  title: z.string().describe('The main title of the presentation.'),
  slides: z.array(SlideSchema).describe('An array of slides for the presentation.'),
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
  
  Generate a presentation about the topic: {{topic}}.
  The presentation should have a main title and exactly {{slideCount}} slides.
  
  For each slide, provide a short, clear title and a list of 3-5 bullet points.
  The content should be easy to understand, grammatically correct, and well-structured.
  Start with an introduction slide and end with a conclusion slide.
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
