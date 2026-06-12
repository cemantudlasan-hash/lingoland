
import { config } from 'dotenv';
config();

// This file is the single source of truth for importing AI flows.
// It is used by the main development server (`genkit:dev` script).

import '@/ai/flows/get-contextual-hint.ts';
import '@/ai/flows/generate-esl-exercise.ts';
import '@/ai/flows/generate-grammar-exercise.ts';
import '@/ai/flows/generate-vocab-exercise.ts';
import '@/ai/flows/generate-sentence-scramble.ts';
import '@/ai/flows/generate-idiom-exercise.ts';
import '@/ai/flows/generate-pronunciation-exercise.ts';
import '@/ai/flows/text-to-speech.ts';
import '@/ai/flows/generate-pictionary-prompt.ts';
import '@/ai/flows/generate-charades-prompt.ts';
import '@/ai/flows/generate-dictation-sentence.ts';
import '@/ai/flows/generate-word-morph.ts';
import '@/ai/flows/generate-auction-item.ts';
import '@/ai/flows/generate-story-prompt.ts';
import '@/ai/flows/continue-story-chain.ts';
import '@/ai/flows/score-story-grammar.ts';
import '@/ai/flows/generate-taboo-card.ts';
import '@/ai/flows/start-twenty-questions.ts';
import '@/ai/flows/guess-twenty-questions.ts';
import '@/ai/flows/generate-presentation.ts';
import '@/ai/flows/generate-synonym-exercise.ts';
import '@/ai/flows/generate-reading-comprehension.ts';
import '@/ai/flows/generate-hangman-word.ts';
import '@/ai/flows/generate-article.ts';
import '@/ai/flows/generate-rubric.ts';
import '@/ai/flows/generate-mystery-box-item.ts';
import '@/ai/flows/generate-crossword-puzzle.ts';
import '@/ai/flows/generate-lesson-plan.ts';
import '@/ai/flows/generate-phonics-word.ts';
import '@/ai/flows/generate-article-exercise.ts';
import '@/ai/flows/generate-jeopardy-board.ts';
import '@/ai/flows/generate-verb-pair.ts';
import '@/ai/flows/generate-spin-question.ts';
import '@/ai/flows/generate-spelling-bee-word.ts';
import '@/ai/flows/generate-odd-one-out.ts';
import '@/ai/flows/generate-emoji-enigma.ts';
import '@/ai/flows/generate-context-detective.ts';
import '@/ai/flows/generate-exam.ts';
import '@/ai/flows/generate-conversation-challenge.ts';
import '@/ai/flows/generate-anatomy-challenge.ts';
import '@/ai/flows/generate-time-challenge.ts';
import '@/ai/flows/generate-riddle.ts';
import '@/ai/flows/generate-atmosphere-challenge.ts';
import '@/ai/flows/generate-probability-challenge.ts';
import '@/ai/flows/generate-student-comment.ts';
import '@/ai/flows/scan-worksheet.ts';

// Schemas
import '@/ai/flows/schemas/article-exercise-schema';
import '@/ai/flows/schemas/crossword-schema';
import '@/ai/flows/schemas/jeopardy-schema';
import '@/ai/flows/schemas/lesson-plan-schema';
import '@/ai/flows/schemas/phonics-schema';
import '@/ai/flows/schemas/rubric-schema';
import '@/ai/flows/schemas/verb-pair-schema';
import '@/ai/flows/schemas/spelling-bee-schema';
import '@/ai/flows/schemas/emoji-enigma-schema';
import '@/ai/flows/schemas/context-detective-schema';
import '@/ai/flows/schemas/word-morph-schema';
import '@/ai/flows/schemas/exam-schema';
import '@/ai/flows/schemas/conversation-schema';
import '@/ai/flows/schemas/anatomy-schema';
import '@/ai/flows/schemas/time-traveler-schema';
import '@/ai/flows/schemas/riddle-schema';
import '@/ai/flows/schemas/atmosphere-schema';
import '@/ai/flows/schemas/probability-schema';
import '@/ai/flows/schemas/comment-generator-schema';
