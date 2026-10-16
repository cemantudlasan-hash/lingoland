import { NextRequest, NextResponse } from "next/server";
import { languageModules } from "@/data/languageModules";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const langCode = searchParams.get("lang") || "all";

  const codeMap: Record<string, string> = {
    en: "english",
    th: "thai",
    ko: "korean",
    ja: "japanese",
    es: "spanish",
    fr: "french",
    vi: "vietnamese",
    zh: "chinese",
    de: "german",
  };

  const modulesToMap = langCode === "all"
    ? languageModules
    : languageModules.filter((m) => m.id === (codeMap[langCode] || langCode));

  if (!modulesToMap.length) {
    return NextResponse.json([]);
  }

  // Deterministic/shuffled quiz builder helper
  const shuffle = (array: any[]) => {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  const allMappedLessons = modulesToMap.flatMap((moduleData) => {
    const langId = moduleData.id;
    return moduleData.lessons.map((lesson) => {
      const categoryMap: Record<string, string> = {
        vocabulary: "vocabulary",
        grammar: "grammar",
        conversation: "conversation",
      culture: "vocabulary",
      pronunciation: "pronunciation",
    };
    const category = categoryMap[lesson.type] || "vocabulary";

    const durationMatch = lesson.duration.match(/\d+/);
    const estimatedMinutes = durationMatch ? parseInt(durationMatch[0]) : 10;

    const quiz: any[] = [];
    const phrases = lesson.content.keyPhrases || [];

    if (phrases.length >= 2) {
      // Q1: What does native mean?
      const q1Phrase = phrases[0];
      let q1Opts = [q1Phrase.english];
      phrases.slice(1).forEach((p) => {
        if (!q1Opts.includes(p.english)) q1Opts.push(p.english);
      });
      while (q1Opts.length < 4 && q1Opts.length < phrases.length) {
        q1Opts.push("None of the above");
      }
      q1Opts = q1Opts.slice(0, 4);
      const shuffledQ1Opts = shuffle(q1Opts);
      const q1CorrectIdx = shuffledQ1Opts.indexOf(q1Phrase.english);

      quiz.push({
        id: `${lesson.id}-q1`,
        question: `What is the correct English translation of: "${q1Phrase.native}"?`,
        options: shuffledQ1Opts,
        answerIndex: q1CorrectIdx,
        explanation: `"${q1Phrase.native}" means "${q1Phrase.english}" in English.`,
      });

      // Q2: How do you say English in Native?
      const q2Phrase = phrases[Math.min(1, phrases.length - 1)];
      let q2Opts = [q2Phrase.native];
      phrases.forEach((p) => {
        if (p.native !== q2Phrase.native && !q2Opts.includes(p.native)) q2Opts.push(p.native);
      });
      while (q2Opts.length < 4 && q2Opts.length < phrases.length) {
        q2Opts.push("N/A");
      }
      q2Opts = q2Opts.slice(0, 4);
      const shuffledQ2Opts = shuffle(q2Opts);
      const q2CorrectIdx = shuffledQ2Opts.indexOf(q2Phrase.native);

      quiz.push({
        id: `${lesson.id}-q2`,
        question: `How do you say "${q2Phrase.english}" in ${moduleData.language}?`,
        options: shuffledQ2Opts,
        answerIndex: q2CorrectIdx,
        explanation: `"${q2Phrase.native}" is the translation for "${q2Phrase.english}".`,
      });

      // Q3: Romanization / Pronunciation guide if present
      const q3Phrase = phrases[phrases.length - 1];
      if (q3Phrase.romanized && q3Phrase.romanized !== "—") {
        let q3Opts = [q3Phrase.romanized];
        phrases.forEach((p) => {
          if (
            p.romanized &&
            p.romanized !== "—" &&
            p.romanized !== q3Phrase.romanized &&
            !q3Opts.includes(p.romanized)
          ) {
            q3Opts.push(p.romanized);
          }
        });
        while (q3Opts.length < 4) {
          q3Opts.push("N/A");
        }
        q3Opts = q3Opts.slice(0, 4);
        const shuffledQ3Opts = shuffle(q3Opts);
        const q3CorrectIdx = shuffledQ3Opts.indexOf(q3Phrase.romanized);

        quiz.push({
          id: `${lesson.id}-q3`,
          question: `What is the correct pronunciation / romanization of "${q3Phrase.native}"?`,
          options: shuffledQ3Opts,
          answerIndex: q3CorrectIdx,
          explanation: `"${q3Phrase.native}" is romanized as "${q3Phrase.romanized}".`,
        });
      } else {
        const q3FallbackPhrase = phrases[Math.min(2, phrases.length - 1)];
        let q3Opts = [q3FallbackPhrase.english];
        phrases.forEach((p) => {
          if (p.english !== q3FallbackPhrase.english && !q3Opts.includes(p.english))
            q3Opts.push(p.english);
        });
        while (q3Opts.length < 4) {
          q3Opts.push("N/A");
        }
        q3Opts = q3Opts.slice(0, 4);
        const shuffledQ3Opts = shuffle(q3Opts);
        const q3CorrectIdx = shuffledQ3Opts.indexOf(q3FallbackPhrase.english);

        quiz.push({
          id: `${lesson.id}-q3`,
          question: `What is the correct meaning of "${q3FallbackPhrase.native}"?`,
          options: shuffledQ3Opts,
          answerIndex: q3CorrectIdx,
          explanation: `"${q3FallbackPhrase.native}" means "${q3FallbackPhrase.english}".`,
        });
      }
    } else {
      quiz.push({
        id: `${lesson.id}-q1`,
        question: `Is this lesson about ${moduleData.language}?`,
        options: ["Yes", "No"],
        answerIndex: 0,
        explanation: "Yes, this is part of the language learning module.",
      });
    }

    const content: any = {
      explanation: lesson.content.intro,
      introduction: lesson.content.intro,
      context: lesson.content.intro,
      howToProduce: lesson.content.intro,
      keyRules: lesson.content.tips || [],
      quiz: quiz,
    };

    if (category === "grammar") {
      content.examples = phrases.map((p) => ({
        english: p.english,
        structureExplanation:
          p.romanized && p.romanized !== "—" ? `${p.native} [${p.romanized}]` : p.native,
      }));
    } else if (category === "vocabulary") {
      content.words = phrases.map((p) => ({
        word: p.native,
        partOfSpeech: p.romanized && p.romanized !== "—" ? `[${p.romanized}]` : "phrase",
        definition: p.english,
        englishExample: "",
      }));
    } else if (category === "conversation" || category === "listening") {
      content.speakerNames = ["A", "B"];
      content.transcript = phrases.map((p, idx) => ({
        speaker: idx % 2 === 0 ? "A" : "B",
        text:
          p.romanized && p.romanized !== "—"
            ? `${p.native} (${p.romanized}) — ${p.english}`
            : `${p.native} — ${p.english}`,
      }));
    } else if (category === "pronunciation") {
      content.phoneme = lesson.title;
      content.practiceWords = phrases.map((p) => ({
        word: p.native,
        ipa: p.romanized && p.romanized !== "—" ? p.romanized : "",
        guide: p.english,
      }));
      content.practiceSentences = phrases.map((p) => ({
        text: p.romanized && p.romanized !== "—" ? `${p.native} (${p.romanized})` : p.native,
        emphasis: p.english,
      }));
    }

    return {
      id: lesson.id,
      category: category,
      level: lesson.difficulty,
      title: lesson.title,
      description: lesson.description,
      xpReward:
        lesson.difficulty === "advanced" ? 200 : lesson.difficulty === "intermediate" ? 185 : 150,
      estimatedMinutes: estimatedMinutes,
      targetLang: langId === "english" ? undefined : langId,
      content: content,
    };
    });
  });

  return NextResponse.json(allMappedLessons);
}
