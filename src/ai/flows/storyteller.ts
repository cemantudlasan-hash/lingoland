'use server';

/**
 * @fileOverview A flow that generates procedural story chapters with language learning challenges.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const StoryChoiceSchema = z.object({
  label: z.string().describe('A brief, exciting action button label (e.g., "Sneak past the guard", "Decipher the runes").'),
  description: z.string().describe('A short, one-sentence description of the action.'),
  challengeSentence: z.string().describe('A grammatically incorrect sentence that the user must correct to unlock this choice.'),
  correctAnswer: z.string().describe('The grammatically correct version of the sentence.'),
});

const GenerateStoryChapterInputSchema = z.object({
  genre: z.string().describe('The genre of the story (e.g. Fantasy, Sci-Fi, Cyberpunk, Mystery, Mythical, Adventure).'),
  theme: z.string().describe('The theme or overarching goal of the narrative.'),
  chapterNumber: z.number().int().describe('The current chapter number (1, 2, 3, etc.).'),
  previousStory: z.string().optional().describe('The cumulative narrative of previous chapters.'),
  userChoice: z.string().optional().describe('The action the user chose in the previous chapter.'),
  difficulty: z.enum(['easy', 'medium', 'hard']).describe('The difficulty level for the grammar correction riddles.'),
});
export type GenerateStoryChapterInput = z.infer<typeof GenerateStoryChapterInputSchema>;

const GenerateStoryChapterOutputSchema = z.object({
  chapterTitle: z.string().describe('An evocative and rich title for this chapter (e.g. "Chapter 1: The Whispering Ruins").'),
  storyText: z.string().describe('A highly engaging, immersive narrative (150-250 words) appropriate for ESL learners. It must continue logically and resolve/reflect the userChoice if provided.'),
  choices: z.array(StoryChoiceSchema).length(3).describe('Exactly 3 paths the user can take, each with its own language challenge.'),
});
export type GenerateStoryChapterOutput = z.infer<typeof GenerateStoryChapterOutputSchema>;

const storytellerPrompt = `You are a legendary master storyteller and expert ESL educator running a Choose-Your-Own-Adventure language game.
The genre is: {{genre}}
The overarching theme/goal is: "{{theme}}"
Currently generating Chapter: {{chapterNumber}}
Language challenge difficulty level: {{difficulty}}

{{#if previousStory}}
The story so far:
"{{previousStory}}"
{{/if}}

{{#if userChoice}}
The user recently chose this action to proceed:
"{{userChoice}}"
{{/if}}

Please write the next chapter of this continuous narrative. 

CRITICAL REQUIREMENTS:
1. Provide a beautiful and evocative chapterTitle.
2. Provide 150-250 words of highly engaging narrative in storyText. The narrative should adapt to and reflect the user's previous choice if they made one, and advance the story towards the overarching goal.
3. Provide EXACTLY 3 unique choices for how the user can proceed.
4. For each choice, generate a unique grammar/spelling challengeSentence and its correctAnswer based on the selected difficulty:
   - "easy": Basic tense issues, pluralization, or common word spellings (e.g. "She like banana" -> "She likes bananas", "He runned fast" -> "He ran fast").
   - "medium": Subject-verb agreement, common prepositions, correct verb patterns (e.g. "I am looking forward to meet you" -> "I am looking forward to meeting you", "She is good in math" -> "She is good at math").
   - "hard": Perfect conditionals, passive voice errors, inversion, or advanced word choice (e.g. "Had I realized, I would have stay" -> "Had I realized, I would have stayed", "She was accusated of lying" -> "She was accused of lying").

Return the output matching the schema.`;

const generateStoryChapterFlow = ai.defineFlow(
  {
    name: 'generateStoryChapterFlow',
    inputSchema: GenerateStoryChapterInputSchema,
    outputSchema: GenerateStoryChapterOutputSchema,
  },
  async (input) => {
    const { output } = await ai.generate({
      model: 'googleai/gemini-2.5-flash',
      prompt: storytellerPrompt,
      context: [input],
      output: {
        schema: GenerateStoryChapterOutputSchema,
      },
    });

    return output!;
  }
);

export async function generateStoryChapter(
  input: GenerateStoryChapterInput
): Promise<GenerateStoryChapterOutput> {
  return generateStoryChapterFlow(input);
}


// --- Visual Click-by-Click Story Reader Flow ---

const ReaderVocabularySchema = z.object({
  word: z.string().describe('A key vocabulary word from the story.'),
  definition: z.string().describe('Clear English definition.'),
  translation: z.string().describe('Thai translation/meaning.'),
});

const GenerateReaderStoryInputSchema = z.object({
  genre: z.string().describe('The genre of the story (e.g., Comedy, Horror, Adventure, Fantasy, Romance, Sci-Fi).'),
  length: z.enum(['short', 'long']).describe('The length of the story.'),
  theme: z.string().describe('A specific theme, topic, or custom prompt for the story.'),
  episodeNumber: z.number().int().optional().describe('The episode or part number (1, 2, 3) if multi-part.'),
});
export type GenerateReaderStoryInput = z.infer<typeof GenerateReaderStoryInputSchema>;

const GenerateReaderStoryOutputSchema = z.object({
  title: z.string().describe('An engaging and creative title for this story or episode.'),
  narrativeBlocks: z.array(z.string()).describe('An array of 8 to 15 narrative blocks (each 1-2 sentences long). These will be read click-by-click by the user. Ensure they build an engaging, cohesive story.'),
  vocabulary: z.array(ReaderVocabularySchema).describe('A list of 3-5 useful vocabulary words featured in the story for learners.'),
});
export type GenerateReaderStoryOutput = z.infer<typeof GenerateReaderStoryOutputSchema>;

const readerStoryPrompt = `You are a master creative writer and ESL language instructor.
Generate a captivating story in the {{genre}} genre.
Overarching Theme/Idea: "{{theme}}"
Story Length: {{length}} (Short story should be a self-contained single part. Long story represents Part/Episode {{episodeNumber}} of a larger serial story.)
Language Level: Premium ESL intermediate/advanced, using interesting vocabulary.

CRITICAL REQUIREMENTS:
1. Generate an awesome title (e.g., "The Comedy of Errors at School" or "Part 1: The Dark Forest").
2. Segment the narrative into an array of EXACTLY 8 to 14 narrativeBlocks. Each block must be 1 to 3 sentences long. This allows the user to read the story click-by-click in a visual novel layout. The sequence of blocks must form a fully completed, engaging story (or episode).
3. Select 3 to 5 key vocabulary words from the story. For each word, provide a clear definition and a Thai translation.

Return the output matching the schema.`;

const generateReaderStoryFlow = ai.defineFlow(
  {
    name: 'generateReaderStoryFlow',
    inputSchema: GenerateReaderStoryInputSchema,
    outputSchema: GenerateReaderStoryOutputSchema,
  },
  async (input) => {
    const { output } = await ai.generate({
      model: 'googleai/gemini-2.5-flash',
      prompt: readerStoryPrompt,
      context: [input],
      output: {
        schema: GenerateReaderStoryOutputSchema,
      },
    });

    return output!;
  }
);

export async function generateReaderStory(
  input: GenerateReaderStoryInput
): Promise<GenerateReaderStoryOutput> {
  return generateReaderStoryFlow(input);
}

