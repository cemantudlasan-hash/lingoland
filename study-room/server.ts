import express from "express";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { DEFAULT_LESSONS } from "./src/lessonsData";
import { EXAM_QUESTIONS } from "./src/examsData";

dotenv.config();

const app = express();
app.use(express.json());

// Allow embedding in iframes from any origin.
// X-Frame-Options: ALLOWALL is NOT a valid spec value - Edge rejects it.
// The correct modern approach is to REMOVE X-Frame-Options entirely and
// use Content-Security-Policy: frame-ancestors instead.
app.use((req, res, next) => {
  res.removeHeader('X-Frame-Options');
  // CSP frame-ancestors replaces X-Frame-Options in all modern browsers (Chrome, Edge, Firefox, Safari)
  res.setHeader(
    'Content-Security-Policy',
    "frame-ancestors *"
  );
  next();
});

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

// Lazy initialization of Gemini API Client
let ai: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!ai) {
    const apiKey = process.env.GEMINI_API_KEY || "";
    if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
      ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
  }
  return ai;
}

// Stats persistence helper
const STATS_FILE = path.join(process.cwd(), "data", "stats.json");
const TRANSLATION_DIR = path.join(process.cwd(), "data", "translations");

function ensureDirectories() {
  const dataDir = path.dirname(STATS_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(TRANSLATION_DIR)) {
    fs.mkdirSync(TRANSLATION_DIR, { recursive: true });
  }
}

function readStats(): any {
  ensureDirectories();
  const defaults = {
    completedLessons: [],
    streakCount: 0,
    lastActiveDate: "",
    points: 0,
    timeSpentMinutes: 0,
    history: [],
    passedExams: [],
    examAttempts: {},
  };
  try {
    if (fs.existsSync(STATS_FILE)) {
      const raw = fs.readFileSync(STATS_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      return { ...defaults, ...parsed };
    }
  } catch (err) {
    console.error("Error reading stats, returning defaults:", err);
  }
  return defaults;
}

function saveStats(stats: any) {
  ensureDirectories();
  try {
    fs.writeFileSync(STATS_FILE, JSON.stringify(stats, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing stats:", err);
  }
}

// API Routes

// 1. Get all lessons
app.get("/api/lessons", (req, res) => {
  res.json(DEFAULT_LESSONS);
});

// 2. Clear progress statistics
app.post("/api/progress/reset", (req, res) => {
  const defaultStats = {
    completedLessons: [],
    streakCount: 0,
    lastActiveDate: "",
    points: 0,
    timeSpentMinutes: 0,
    history: [],
    passedExams: [],
    examAttempts: {},
  };
  saveStats(defaultStats);
  res.json(defaultStats);
});

// 3. Get user stats
app.get("/api/progress", (req, res) => {
  const stats = readStats();
  res.json(stats);
});

// 4. Update user progress on lesson completion
app.post("/api/progress/complete", (req, res) => {
  const { lessonId, score, xpEarned, timeSpent } = req.body;
  if (!lessonId) {
    return res.status(400).json({ error: "Missing lessonId" });
  }

  const stats = readStats();
  
  if (!stats.completedLessons.includes(lessonId)) {
    stats.completedLessons.push(lessonId);
  }

  // Update points and time spent
  stats.points += (xpEarned || 100);
  stats.timeSpentMinutes += (timeSpent || 5);

  // Manage Streak count
  const todayStr = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  const lastActiveStr = stats.lastActiveDate;

  if (lastActiveStr === "") {
    stats.streakCount = 1;
  } else if (lastActiveStr !== todayStr) {
    const lastActive = new Date(lastActiveStr);
    const today = new Date(todayStr);
    const diffTime = Math.abs(today.getTime() - lastActive.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      stats.streakCount += 1;
    } else if (diffDays > 1) {
      stats.streakCount = 1;
    }
  }
  stats.lastActiveDate = todayStr;

  // Append history logs
  stats.history.push({
    lessonId,
    completedAt: new Date().toISOString(),
    score: score || 100,
    xpEarned: xpEarned || 100,
  });

  saveStats(stats);
  res.json(stats);
});

// 4b. Update user progress on exam completion
app.post("/api/progress/complete-exam", (req, res) => {
  const { langCode, score, passed } = req.body;
  if (!langCode || score === undefined || passed === undefined) {
    return res.status(400).json({ error: "Missing langCode, score, or passed status" });
  }

  const stats = readStats();
  
  if (!stats.passedExams) stats.passedExams = [];
  if (!stats.examAttempts) stats.examAttempts = {};

  const todayStr = new Date().toISOString().split("T")[0];

  // Update best attempt or add attempt record
  const prevAttempt = stats.examAttempts[langCode];
  if (!prevAttempt || score > prevAttempt.score) {
    stats.examAttempts[langCode] = {
      score,
      passed,
      date: todayStr
    };
  }

  if (passed && !stats.passedExams.includes(langCode)) {
    stats.passedExams.push(langCode);
    stats.points += 500; // Credit 500 XP bonus for passing the exam!
  }

  // Update points and time spent
  stats.timeSpentMinutes += 30; // standard 30 min exam time spent
  stats.lastActiveDate = todayStr;

  saveStats(stats);
  res.json(stats);
});

// 4c. On-the-fly and Cached AI-Driven Exam Translation
app.post("/api/translate-exam", async (req, res) => {
  try {
    const { targetLang, targetLangName } = req.body;
    if (!targetLang) {
      return res.status(400).json({ error: "Missing targetLang" });
    }

    const cachePath = path.join(TRANSLATION_DIR, `exam_${targetLang}.json`);
    ensureDirectories();

    if (fs.existsSync(cachePath)) {
      try {
        const cachedContent = fs.readFileSync(cachePath, "utf-8");
        return res.json(JSON.parse(cachedContent));
      } catch (e) {
        console.warn(`Failed reading cached translation for exam_${targetLang}, falling back to generation:`, e);
      }
    }

    const client = getGeminiClient();
    if (!client) {
      // Fallback
      console.info("Gemini client not configured. Generating draft fallback translation for exam.");
      const fallbackTranslation = EXAM_QUESTIONS.map(q => ({
        question: `[${targetLangName}] ${q.question}`,
        options: q.options.map(opt => `${opt} (${targetLangName})`),
        explanation: `[${targetLangName} Explanation] ${q.explanation}`
      }));
      fs.writeFileSync(cachePath, JSON.stringify(fallbackTranslation, null, 2), "utf-8");
      return res.json(fallbackTranslation);
    }

    const prompt = `You are a professional language localization editor for lingolandverse.com.
Translate all the 30 multiple-choice questions, options, and feedback explanations of this English proficiency exam into "${targetLangName}" (Code: "${targetLang}").
Translate the meanings accurately while preserving pedagogical nuance.

Questions to translate:
${JSON.stringify(EXAM_QUESTIONS.map(q => ({ question: q.question, options: q.options, explanation: q.explanation })))}

Output constraints:
- Return the list in the exact matching index order.
- Options array must have the same length.
- Return ONLY the required JSON list shape. Do NOT add markdown wrappers or generic formatting notes outside the JSON block.`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        systemInstruction: "You are a translation bot returning clean, strict JSON array matching standard objects.",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              explanation: { type: Type.STRING }
            },
            required: ["question", "options", "explanation"]
          }
        }
      }
    });

    const text = response.text || "[]";
    const parsedTranslation = JSON.parse(text);

    // Cache compiled translation
    fs.writeFileSync(cachePath, JSON.stringify(parsedTranslation, null, 2), "utf-8");
    return res.json(parsedTranslation);

  } catch (err: any) {
    console.error("Exam translation generation failed:", err);
    res.status(500).json({ error: err.message || "Failed to generate exam translation" });
  }
});

// 5. On-the-fly and Cached AI-Driven Translation
app.post("/api/translate-lesson", async (req, res) => {
  try {
    const { lessonId, targetLang, targetLangName } = req.body;
    if (!lessonId || !targetLang) {
      return res.status(400).json({ error: "Missing lessonId or targetLang" });
    }

    const cachePath = path.join(TRANSLATION_DIR, `${lessonId}_${targetLang}.json`);
    ensureDirectories();

    // check if we have a hand-translated file or precached translation in /data/translations
    let cacheFileToCheck = cachePath;
    const projectTranslationPath = path.join(process.cwd(), "data", "translations", `${lessonId}_${targetLang}.json`);
    if (fs.existsSync(projectTranslationPath)) {
      cacheFileToCheck = projectTranslationPath;
    }

    if (fs.existsSync(cacheFileToCheck)) {
      try {
        const cachedContent = fs.readFileSync(cacheFileToCheck, "utf-8");
        return res.json(JSON.parse(cachedContent));
      } catch (e) {
        console.warn(`Failed reading cached translation for ${lessonId}_${targetLang}, falling back to generation:`, e);
      }
    }

    const lesson = DEFAULT_LESSONS.find((l) => l.id === lessonId);
    if (!lesson) {
      return res.status(404).json({ error: "Lesson not found" });
    }

    const client = getGeminiClient();
    if (!client) {
      // Graceful fallback if Gemini API key is missing
      console.info("Gemini client not configured. Generating draft fallback translation.");
      
      // Let's create an elegant fallback object
      const fallbackTranslation = {
        title: `${lesson.title} (${targetLangName})`,
        description: `[Preview] This content was translated statically to ${targetLangName}.`,
        explanation: lesson.content.explanation 
          ? `[Auto Translate Demo] ${lesson.content.explanation} (This represents side-by-side localized content: ${targetLangName})`
          : undefined,
        introduction: lesson.content.introduction
          ? `[Auto Translate Demo] ${lesson.content.introduction} (This vocabulary is wrapped for native comprehension in: ${targetLangName})`
          : undefined,
        context: lesson.content.context
          ? `[Context in ${targetLangName}] ${lesson.content.context}`
          : undefined,
        howToProduce: lesson.content.howToProduce
          ? `[Pronunciation Guide in ${targetLangName}] ${lesson.content.howToProduce}`
          : undefined,
        keyRules: lesson.content.keyRules?.map(r => `• ${r} (${targetLangName} Guide)`),
        words: lesson.content.words?.map(w => `${w.word}: [${targetLangName} Definition] ${w.definition}`),
        transcript: lesson.content.transcript?.map(t => `${t.speaker}: [Speaking in ${targetLangName}] "${t.text}"`),
        practiceSentences: lesson.content.practiceSentences?.map(s => `${s.text} (${targetLangName} literal approximation)`),
        quiz: lesson.content.quiz.map(q => ({
          question: `[${targetLangName}] ${q.question}`,
          options: q.options.map(opt => `${opt} (${targetLangName})`),
          explanation: `[${targetLangName} Explanation] ${q.explanation}`
        }))
      };

      // Cache it for subsequent loads
      fs.writeFileSync(cachePath, JSON.stringify(fallbackTranslation, null, 2), "utf-8");
      return res.json(fallbackTranslation);
    }

    // Call server-side Gemini API with structured instructions
    const prompt = `You are a professional language localization editor for lingolandverse.com.
Translate all texts, questions, explanations, rules, and vocabulary entries of this English lesson into "${targetLangName}" (Code: "${targetLang}").
Translate the meanings accurately while preserving pedagogical nuance.

Original Lesson Content for context:
- Title: "${lesson.title}"
- Description: "${lesson.description}"
${lesson.content.explanation ? `- Explanation: "${lesson.content.explanation}"` : ""}
${lesson.content.introduction ? `- Introduction: "${lesson.content.introduction}"` : ""}
${lesson.content.context ? `- Context: "${lesson.content.context}"` : ""}
${lesson.content.howToProduce ? `- How to produce sound: "${lesson.content.howToProduce}"` : ""}

${lesson.content.keyRules ? `- Bullet Grammar Rules: ${JSON.stringify(lesson.content.keyRules)}` : ""}
${lesson.content.words ? `- Words and Definitions: ${JSON.stringify(lesson.content.words.map(w => ({ word: w.word, definition: w.definition })))}- ONLY translate the DEFINITIONS. Leave the English word intact.` : ""}
${lesson.content.transcript ? `- Dialogue lines to translate (without speakers): ${JSON.stringify(lesson.content.transcript.map(t => t.text))}` : ""}
${lesson.content.practiceSentences ? `- Practice sentences to translate: ${JSON.stringify(lesson.content.practiceSentences.map(s => s.text))}` : ""}

- Interactive Quiz questions to translate (Questions, Answers, and Explanations):
${JSON.stringify(lesson.content.quiz.map(q => ({ question: q.question, options: q.options, explanation: q.explanation })))}

Output constraints:
- Words: Provide string translation items corresponding to definitions, e.g. "Traducido..."
- Dialogue lines: Provide direct translations in exact matching array indexing order.
- Quiz: Translate question string, keep options length the SAME, and translate the feedback explanation.
- Return ONLY the required JSON shape. Do NOT add markdown wrappers or generic formatting notes outside the JSON block.`;

  const response = await client.models.generateContent({
    model: "gemini-3.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      systemInstruction: "You are a translation bot returning clean, strict JSON matching standard objects.",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          explanation: { type: Type.STRING },
          introduction: { type: Type.STRING },
          context: { type: Type.STRING },
          howToProduce: { type: Type.STRING },
          keyRules: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          words: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          transcript: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          practiceSentences: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          quiz: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                options: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                explanation: { type: Type.STRING }
              },
              required: ["question", "options", "explanation"]
            }
          }
        },
        required: ["title", "description", "quiz"]
      }
    }
  });

  const text = response.text || "{}";
  const parsedTranslation = JSON.parse(text);

  // Cache compiled translation
  fs.writeFileSync(cachePath, JSON.stringify(parsedTranslation, null, 2), "utf-8");
  return res.json(parsedTranslation);

  } catch (err: any) {
    console.error("Translation generation failed:", err);
    res.status(500).json({ error: err.message || "Failed to generate translation" });
  }
});

// 6. Gemini-powered Speech Synthesis TTS
app.post("/api/tts", async (req, res) => {
  try {
    const { text, speakerName } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Missing text parameter" });
    }

    const client = getGeminiClient();
    if (!client) {
      return res.status(400).json({ error: "Gemini API key is not configured for TTS." });
    }

    const response = await client.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ parts: [{ text: `Say clearly in a natural conversational speed: ${text}` }] }],
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: speakerName || "Kore" },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      return res.json({ audio: base64Audio });
    } else {
      return res.status(500).json({ error: "No voice generated from the model" });
    }
  } catch (err: any) {
    console.error("Gemini TTS Failed:", err);
    res.status(500).json({ error: err.message || "TTS speaking error" });
  }
});

// Production compile check and Static Serving Setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Development mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production compiled static hosting
    const distPath = path.join(process.cwd(), "dist");
    // Serve static assets — headers already set by global middleware above
    app.use(express.static(distPath, { setHeaders: (res) => {
      res.removeHeader('X-Frame-Options');
      res.setHeader('Content-Security-Policy', "frame-ancestors *");
    }}));
    app.get("*", (req, res) => {
      // Ensure iframe headers on SPA fallback too
      res.removeHeader('X-Frame-Options');
      res.setHeader('Content-Security-Policy', "frame-ancestors *");
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Study Room backend running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
