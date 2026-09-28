'use server';

/**
 * @fileOverview AI flows for the Speed Debater game engine.
 * Handles the 3-round rapid debate turns and final judging breakdown,
 * supporting customizable word limit modes (e.g. 20, 30, 50, 100 words or custom).
 *
 * NOTE: Next.js 'use server' files can ONLY export async functions!
 * Do NOT export const schemas or objects here.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const DebateMessageSchema = z.object({
  round: z.number(),
  roundType: z.enum(['Opening', 'Rebuttal', 'Closing']),
  speaker: z.enum(['player', 'ai']),
  text: z.string(),
  wordCount: z.number().optional(),
});

const DebateTurnInputSchema = z.object({
  topic: z.string(),
  playerStance: z.enum(['PRO', 'CON']),
  aiStance: z.enum(['PRO', 'CON']),
  round: z.number().min(1).max(3),
  roundType: z.enum(['Opening', 'Rebuttal', 'Closing']),
  playerArgument: z.string(),
  playerWordCount: z.number(),
  wordLimit: z.number().optional().default(100),
  history: z.array(DebateMessageSchema),
});
export type DebateTurnInput = z.infer<typeof DebateTurnInputSchema>;

const DebateTurnOutputSchema = z.object({
  aiResponse: z.string(),
  wordCount: z.number(),
  isPlayerOverLimit: z.boolean(),
  round: z.number(),
});
export type DebateTurnOutput = z.infer<typeof DebateTurnOutputSchema>;

const DebateJudgeInputSchema = z.object({
  topic: z.string(),
  playerStance: z.enum(['PRO', 'CON']),
  aiStance: z.enum(['PRO', 'CON']),
  wordLimit: z.number().optional().default(100),
  history: z.array(DebateMessageSchema),
});
export type DebateJudgeInput = z.infer<typeof DebateJudgeInputSchema>;

const DebateJudgeOutputSchema = z.object({
  logicScore: z.number().min(0).max(40),
  grammarScore: z.number().min(0).max(30),
  constraintsScore: z.number().min(0).max(30),
  totalScore: z.number().min(0).max(100),
  winner: z.enum(['Player', 'AI', 'Tie']),
  coachingTip: z.string(),
  feedbackSummary: z.string(),
  strengths: z.array(z.string()),
  improvements: z.array(z.string()),
});
export type DebateJudgeOutput = z.infer<typeof DebateJudgeOutputSchema>;

const countWords = (text: string) => {
  return text.trim().split(/\s+/).filter(Boolean).length;
};

export async function submitDebateTurn(input: DebateTurnInput): Promise<DebateTurnOutput> {
  const targetLimit = input.wordLimit || 100;
  const isOverLimit = input.playerWordCount > targetLimit;
  const roundNames = {
    1: 'Opening Argument',
    2: 'Rebuttal',
    3: 'Closing Summary',
  };

  const systemPrompt = `You are the "Speed Debater" AI Opponent in LingoLandVerse.
ROLE & CONTEXT:
You are engaged in a fast-paced, educational debate game with the player.
- Topic: "${input.topic}"
- Player's Stance: ${input.playerStance}
- Your Stance: ${input.aiStance}
- Current Round: Round ${input.round}/3 (${roundNames[input.round as 1 | 2 | 3] || input.roundType})
- Active Word Limit Constraint: EXACTLY ${targetLimit} WORDS OR FEWER PER TURN.

HARD CONSTRAINTS:
1. WORD LIMIT: Your response MUST be strictly under ${targetLimit} words! Match the rapid brevity requested (${targetLimit} words maximum).
2. If the player exceeded the ${targetLimit}-word limit (${isOverLimit ? 'YES, THEY WROTE ' + input.playerWordCount + ' WORDS' : 'No, they followed the limit'}), prefix your reply with:
   "*Penalty note: You exceeded the ${targetLimit}-word limit (${input.playerWordCount} words)!*"
3. FORMAT: Start your turn with:
   "**[Round ${input.round}] AI Opponent:** [Your response]"
4. Stay firmly in character. Keep your argument sharp, punchy, logically sound, and directly countering the player.`;

  const previousDialogue = input.history
    .map(
      (m) =>
        `[Round ${m.round} - ${m.roundType}] ${m.speaker === 'player' ? 'Player (' + input.playerStance + ')' : 'AI Opponent (' + input.aiStance + ')'}: ${m.text}`
    )
    .join('\n\n');

  try {
    const prompt = `${systemPrompt}

PREVIOUS DEBATE EXCHANGES:
${previousDialogue || '(None, this is the opening round)'}

PLAYER'S LATEST TURN:
"${input.playerArgument}" (Word count: ${input.playerWordCount}/${targetLimit})

Now, deliver your razor-sharp counter-argument in under ${targetLimit} words:`;

    const response = await ai.generate({
      model: 'googleai/gemini-2.5-flash',
      prompt,
    });

    let aiText = response.text?.trim() || '';
    
    // Ensure formatting prefix exists
    if (!aiText.includes(`[Round ${input.round}]`)) {
      const penaltyPrefix = isOverLimit
        ? `*Penalty note: You exceeded the ${targetLimit}-word limit (${input.playerWordCount} words)!*\n\n`
        : '';
      aiText = `${penaltyPrefix}**[Round ${input.round}] AI Opponent:** ${aiText}`;
    }

    return {
      aiResponse: aiText,
      wordCount: countWords(aiText),
      isPlayerOverLimit: isOverLimit,
      round: input.round,
    };
  } catch (error) {
    console.error('Error generating debate turn via Gemini:', error);
    // Intelligent fallback tailored to word limit
    const penaltyPrefix = isOverLimit
      ? `*Penalty note: You exceeded the ${targetLimit}-word limit (${input.playerWordCount} words)!*\n\n`
      : '';
    
    let fallbackBody = '';
    if (targetLimit <= 30) {
      if (input.round === 1) fallbackBody = 'Your stance ignores deep systemic costs. Feasibility and safety matter far more than unchecked idealism.';
      else if (input.round === 2) fallbackBody = 'That rebuttal sidesteps proven counter-evidence. Pragmatic risk management invalidates your main premise.';
      else fallbackBody = 'In short, tangible reality defeats theoretical optimism. Stability must prevail over uncertain promises.';
    } else if (targetLimit <= 50) {
      if (input.round === 1) fallbackBody = 'While your premise sounds appealing, it overlooks critical economic disparities and severe implementation risks. Stability and prudence demand an opposing stance.';
      else if (input.round === 2) fallbackBody = 'Your rebuttal sidesteps the core flaw in your argument. Without verifiable safeguards, your proposed path creates far more hazards than benefits.';
      else fallbackBody = 'In conclusion, the balance of evidence favors our side. Sound logic, empirical precedent, and safety outweigh speculative upside.';
    } else {
      if (input.round === 1) {
        fallbackBody = `While your opening stance highlights interesting points, it fails to account for fundamental systemic vulnerabilities. Advocating for ${input.playerStance === 'PRO' ? 'this policy' : 'maintaining the status quo'} overlooks major economic disparities and realistic implementation hurdles. We must prioritize pragmatic, sustainable solutions instead of speculative idealism.`;
      } else if (input.round === 2) {
        fallbackBody = `Your rebuttal attempts to shift focus away from key trade-offs. The evidence consistently demonstrates that without strict safeguards and proven track records, your assertions lack stability. Simply deflecting valid criticisms does not resolve the real-world obstacles at stake.`;
      } else {
        fallbackBody = `In conclusion, the balance of evidence clearly supports our side. While your vision sounds appealing on the surface, practical reality requires stability, feasibility, and proven safeguards. Thank you for this intense debate—now let us proceed to the judge's verdict!`;
      }
    }

    const aiText = `${penaltyPrefix}**[Round ${input.round}] AI Opponent:** ${fallbackBody}`;
    return {
      aiResponse: aiText,
      wordCount: countWords(aiText),
      isPlayerOverLimit: isOverLimit,
      round: input.round,
    };
  }
}

export async function judgeDebate(input: DebateJudgeInput): Promise<DebateJudgeOutput> {
  const targetLimit = input.wordLimit || 100;
  const systemPrompt = `You are the Head Judge and Coach for Speed Debater in LingoLandVerse.
Step completely out of character. You are reviewing the completed 3-round debate between the Player and the AI Opponent.

Topic: "${input.topic}"
Player's Stance: ${input.playerStance}
AI's Stance: ${input.aiStance}
Active Word Limit Constraint: MAXIMUM ${targetLimit} WORDS PER TURN.

SCORING CRITERIA (Total: 100 points):
1. Argument Logic & Persuasiveness (Max 40 points):
   - Sound premises, logical flow, convincing evidence/rhetoric, effective rebuttals.
2. Grammar & Linguistic Accuracy (Max 30 points):
   - Sentence structure, vocabulary richness, punctuation, clarity, precision.
3. Adherence to Constraints & Speed/Word limits (Max 30 points):
   - Keeping responses under ${targetLimit} words per turn. Deduct 5-10 points for each turn that exceeded ${targetLimit} words.

Return ONLY a valid JSON object matching this schema:
{
  "logicScore": <number 0-40>,
  "grammarScore": <number 0-30>,
  "constraintsScore": <number 0-30>,
  "totalScore": <number sum of the three>,
  "winner": <"Player" | "AI" | "Tie">,
  "coachingTip": <string: 1-2 concise, actionable coaching tips to become a sharper debater under the ${targetLimit}-word limit>,
  "feedbackSummary": <string: brief overall assessment of player's performance>,
  "strengths": [<string>, <string>],
  "improvements": [<string>, <string>]
}`;

  const debateLog = input.history
    .map(
      (m) =>
        `Round ${m.round} (${m.roundType}) - ${m.speaker.toUpperCase()} [${m.wordCount || countWords(m.text)}/${targetLimit} words]:\n${m.text}`
    )
    .join('\n\n');

  try {
    const prompt = `${systemPrompt}\n\nCOMPLETE DEBATE TRANSCRIPT:\n${debateLog}\n\nJSON Evaluation:`;

    const response = await ai.generate({
      model: 'googleai/gemini-2.5-flash',
      prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    const logicScore = Math.min(40, Math.max(0, Number(parsed.logicScore) || 32));
    const grammarScore = Math.min(30, Math.max(0, Number(parsed.grammarScore) || 25));
    const constraintsScore = Math.min(30, Math.max(0, Number(parsed.constraintsScore) || 26));
    const totalScore = logicScore + grammarScore + constraintsScore;

    return {
      logicScore,
      grammarScore,
      constraintsScore,
      totalScore,
      winner: parsed.winner || (totalScore >= 75 ? 'Player' : 'AI'),
      coachingTip: parsed.coachingTip || `Structure your arguments with the Claim-Reason-Evidence format to maximize impact within tight word limits (${targetLimit} words).`,
      feedbackSummary: parsed.feedbackSummary || `Great demonstration of quick thinking and structured debate under the ${targetLimit}-word constraint.`,
      strengths: Array.isArray(parsed.strengths) && parsed.strengths.length > 0
        ? parsed.strengths
        : ['Clear and direct stance', 'Good engagement with opposing points'],
      improvements: Array.isArray(parsed.improvements) && parsed.improvements.length > 0
        ? parsed.improvements
        : [`Watch the ${targetLimit}-word constraint to avoid penalty deductions`, 'Use precise power verbs to deliver punchy arguments'],
    };
  } catch (error) {
    console.error('Error judging debate via Gemini:', error);
    // Reliable fallback calculation
    let overCount = 0;
    input.history
      .filter((m) => m.speaker === 'player')
      .forEach((m) => {
        if ((m.wordCount || countWords(m.text)) > targetLimit) overCount++;
      });

    const logicScore = 33;
    const grammarScore = 26;
    const constraintsScore = Math.max(10, 30 - overCount * 8);
    const totalScore = logicScore + grammarScore + constraintsScore;

    return {
      logicScore,
      grammarScore,
      constraintsScore,
      totalScore,
      winner: totalScore >= 75 ? 'Player' : 'AI',
      coachingTip:
        `Under a ${targetLimit}-word limit, every word counts. Use crisp transition phrases like "Consequently" and "Crucially" instead of wordy filler.`,
      feedbackSummary:
        `You presented strong argumentative intuition and defended your stance well within the ${targetLimit}-word framework.`,
      strengths: ['Prompt engagement with the core issue', 'Convincing rhetorical framing'],
      improvements: [
        `Watch the ${targetLimit}-word constraint to avoid penalty points`,
        'Cite specific real-world precedents to make arguments unassailable',
      ],
    };
  }
}
