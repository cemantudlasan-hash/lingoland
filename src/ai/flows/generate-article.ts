
'use server';

/**
 * @fileOverview A flow that generates an ESL article.
 * - generateArticle - A function that creates an article.
 * - GenerateArticleInput - The input type for the function.
 * - GenerateArticleOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import { z } from 'zod';

const ArticleSchema = z.object({
  title: z.string().describe('The title of the article.'),
  description: z.string().describe('A short, one-sentence description of the article.'),
  content: z.string().describe('The full content of the article, consisting of several paragraphs.'),
  imageHint: z.string().max(20).describe('One or two keywords for a stock photo that represents the article (e.g., "park nature").'),
});

const GenerateArticleInputSchema = z.object({
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  existingTitles: z.array(z.string()).optional().describe('A list of existing article titles to avoid generating duplicates.'),
});
export type GenerateArticleInput = z.infer<typeof GenerateArticleInputSchema>;

const GenerateArticleOutputSchema = z.object({
    article: ArticleSchema
});
export type GenerateArticleOutput = z.infer<typeof GenerateArticleOutputSchema>;


const prompt = ai.definePrompt({
  name: 'generateArticlePrompt',
  input: {schema: GenerateArticleInputSchema},
  output: {schema: GenerateArticleOutputSchema},
  prompt: `You are an expert ESL content creator. Generate a short, engaging, and original article suitable for an English learner at the {{difficulty}} level.

The article must have:
1.  A short, catchy title.
2.  A one-sentence description summarizing the article.
3.  The full article content, with 3-5 paragraphs. The content should be grammatically correct and appropriate for the difficulty level.
4.  A one or two-word hint for a relevant stock photo.

{{#if existingTitles}}
Do not generate an article with any of the following titles:
{{#each existingTitles}}
- {{this}}
{{/each}}
{{/if}}

Choose a topic that is interesting and informative for a general audience. Example topics could include: science, history, travel, technology, daily life, or culture.
`,
});

const generateArticleFlow = ai.defineFlow(
  {
    name: 'generateArticleFlow',
    inputSchema: GenerateArticleInputSchema,
    outputSchema: GenerateArticleOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);


export async function generateArticle(
  input: GenerateArticleInput
): Promise<GenerateArticleOutput> {
  return generateArticleFlow(input);
}
