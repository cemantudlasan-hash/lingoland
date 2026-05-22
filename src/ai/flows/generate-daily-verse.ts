'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

// Zod schemas for validation
const GenerateDailyVerseInputSchema = z.object({
  headline: z.string(),
  description: z.string(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
});

export type GenerateDailyVerseInput = z.infer<typeof GenerateDailyVerseInputSchema>;

const DailyVerseQuestionSchema = z.object({
  question: z.string().describe('The quiz question text.'),
  options: z.array(z.string()).length(4).describe('4 options for the question.'),
  correctAnswer: z.string().describe('The correct answer (must match one of the options exactly).'),
  explanation: z.string().describe('Brief explanation of why it is correct.'),
});

const GenerateDailyVerseOutputSchema = z.object({
  headline: z.string().describe('The headline of the news.'),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  article: z.string().describe('The simplified article text. Beginner: 80-120 words, simple words. Intermediate: 150-200 words, standard words. Advanced: 250-300 words, rich vocabulary.'),
  questions: z.array(DailyVerseQuestionSchema).length(4).describe('Exactly 4 comprehension questions about the simplified article.'),
});

export type GenerateDailyVerseOutput = z.infer<typeof GenerateDailyVerseOutputSchema>;

// Define the Genkit prompt
const prompt = ai.definePrompt({
  name: 'generateDailyVersePrompt',
  input: { schema: GenerateDailyVerseInputSchema },
  output: { schema: GenerateDailyVerseOutputSchema },
  prompt: `You are an expert journalist and ESL teacher.
  Based on this real news headline: "{{headline}}" and description: "{{description}}", generate a fully complete news article simplified for a {{difficulty}}-level English learner, along with a comprehension quiz.

  Please follow these strict requirements:
  1. Write a simplified article based on the news, appropriate for the {{difficulty}} level:
     - beginner: A1-A2 vocabulary, very simple short sentences, 80-120 words.
     - intermediate: B1-B2 vocabulary, standard sentences, 150-200 words.
     - advanced: C1-C2 vocabulary, complex structures, formal/academic words, 250-300 words.
  2. Generate exactly 4 multiple-choice questions to test comprehension of the reading passage.
  3. Each question must have 4 options, a correct answer (matching one of the options exactly), and a short explanation.
  `,
});

// Define the Genkit flow
const generateDailyVerseFlow = ai.defineFlow(
  {
    name: 'generateDailyVerseFlow',
    inputSchema: GenerateDailyVerseInputSchema,
    outputSchema: GenerateDailyVerseOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);

// Server action wrapper
export async function generateDailyVerse(
  input: GenerateDailyVerseInput
): Promise<GenerateDailyVerseOutput> {
  return generateDailyVerseFlow(input);
}

// Interfaces for aggregated news
export interface NewsArticle {
  id: string;
  title: string;
  description: string;
  link: string;
  pubDate: string;
  category: string;
}

// Fallback curated news pool
const FALLBACK_NEWS: NewsArticle[] = [
  {
    id: "fb-1",
    title: "James Webb Telescope Discovers Atmospheres on Three Nearby Exoplanets",
    description: "Astronomers using the James Webb Space Telescope have detected signatures of water vapor and carbon dioxide in the atmospheres of three Earth-sized exoplanets orbiting a nearby red dwarf star.",
    link: "https://www.nasa.gov",
    pubDate: "Fri, 22 May 2026 08:00:00 GMT",
    category: "Science & Space"
  },
  {
    id: "fb-2",
    title: "Great Barrier Reef Shows Surprising Recovery After Cooler Current System Shifts",
    description: "Marine biologists report that parts of the Great Barrier Reef are showing rapid coral growth and recovery following a shift in ocean currents that brought cooler water to bleached sectors.",
    link: "https://www.bbc.com/news",
    pubDate: "Fri, 22 May 2026 09:30:00 GMT",
    category: "Environment"
  },
  {
    id: "fb-3",
    title: "Ancient City Discovered Deep in the Amazon Rainforest Using LiDAR Technology",
    description: "Archaeologists have mapped a vast, pre-Columbian urban network in the Amazon basin featuring grid-like plazas, raised agricultural fields, and advanced water canals.",
    link: "https://www.nationalgeographic.com",
    pubDate: "Thu, 21 May 2026 14:15:00 GMT",
    category: "Archaeology"
  },
  {
    id: "fb-4",
    title: "New Biodegradable Plastic Made from Seaweed Dissolves Safely in Water in Three Hours",
    description: "Engineers have developed a seaweed-based alternative to single-use plastics that matches its durability but breaks down into harmless organic compounds within hours of moisture contact.",
    link: "https://www.reuters.com",
    pubDate: "Thu, 21 May 2026 11:00:00 GMT",
    category: "Technology"
  },
  {
    id: "fb-5",
    title: "Deep Sea Expedition Films Rare Glowing Octopus at 4,000 Meters Depth",
    description: "A research vessel exploring the Mariana Trench has captured high-definition video of a previously undocumented cirrate octopus displaying bright bioluminescent patterns.",
    link: "https://www.nature.com",
    pubDate: "Wed, 20 May 2026 16:45:00 GMT",
    category: "Wildlife"
  },
  {
    id: "fb-6",
    title: "Global Initiative Achieves Record Renewable Energy Generation in Peak Summer Months",
    description: "Wind, solar, and hydro energy supplied over 45% of global electrical grid demand during the peak heating months, setting a new milestone for the green transition.",
    link: "https://www.bloomberg.com",
    pubDate: "Wed, 20 May 2026 07:10:00 GMT",
    category: "Energy"
  },
  {
    id: "fb-7",
    title: "AI Medical Assistant Successfully Diagnoses Ultra-Rare Genetic Disease in Minutes",
    description: "A specialized AI model analyzing patient genomes and medical histories correctly identified an extremely rare metabolic condition that had puzzled doctors for five years.",
    link: "https://www.sciencedaily.com",
    pubDate: "Tue, 19 May 2026 10:20:00 GMT",
    category: "Health"
  },
  {
    id: "fb-8",
    title: "World's Oldest Intact Wooden Structure Uncovered Near Zambian River Bank",
    description: "Archaeologists have unearthed interlocking logs dating back nearly 500,000 years, revealing that ancient human ancestors crafted complex structures much earlier than previously thought.",
    link: "https://www.bbc.com/news",
    pubDate: "Tue, 19 May 2026 13:40:00 GMT",
    category: "History"
  },
  {
    id: "fb-9",
    title: "Superconductors Show Solid Progress at Higher Ambient Temperatures",
    description: "Physics labs have confirmed a new copper-based material shows zero electrical resistance at ambient pressures and temperatures warmer than any prior dry-ice superconductor.",
    link: "https://www.scientificamerican.com",
    pubDate: "Mon, 18 May 2026 15:05:00 GMT",
    category: "Physics"
  },
  {
    id: "fb-10",
    title: "Vast Underground Freshwater Aquifer Mapped Under the Sahara Desert",
    description: "Using satellite radar mapping, hydrologists have located a massive ancient water reserve under the sand dunes that could support dry farming initiatives in neighboring countries.",
    link: "https://www.aljazeera.com",
    pubDate: "Mon, 18 May 2026 09:00:00 GMT",
    category: "Geography"
  },
  {
    id: "fb-11",
    title: "Electric Flight Prototype Completes 1,000-Mile Non-Stop Cross-Country Journey",
    description: "An experimental light aircraft powered entirely by solid-state battery technology has set a aviation record by completing a long-range flight with zero emissions.",
    link: "https://www.wired.com",
    pubDate: "Sun, 17 May 2026 12:30:00 GMT",
    category: "Technology"
  },
  {
    id: "fb-12",
    title: "Endangered Giant Panda Population Rebounds Due to Bamboo Forest Preservation",
    description: "Conservation efforts across southwestern China have successfully expanded high-altitude bamboo corridors, allowing pandas to roam freely and increase their numbers in the wild.",
    link: "https://www.worldwildlife.org",
    pubDate: "Sat, 16 May 2026 08:50:00 GMT",
    category: "Wildlife"
  },
  {
    id: "fb-13",
    title: "Volcanic Ash Soil Enrichment Project Doubles Agricultural Yield in Arid Regions",
    description: "A massive field study shows adding crushed volcanic basalt rocks to dry crop soils dramatically increases nutrient retention and doubles grain production with half the water.",
    link: "https://www.agriland.com",
    pubDate: "Fri, 15 May 2026 14:00:00 GMT",
    category: "Environment"
  },
  {
    id: "fb-14",
    title: "Robotic Hive Monitoring System Detects and Prevents Early Bee Disease",
    description: "An innovative agricultural tech startup has designed smart beehive scales and audio analysis sensors that notify beekeepers of parasite threats before the colony is affected.",
    link: "https://www.techcrunch.com",
    pubDate: "Thu, 14 May 2026 10:15:00 GMT",
    category: "Technology"
  },
  {
    id: "fb-15",
    title: "Deep Space Radar Maps Ancient River Systems on the surface of Mars in 3D",
    description: "Using synthetic aperture radar from Mars orbiter missions, planetary scientists have generated high-resolution 3D maps of ancient dry river beds underneath Martian dust layers.",
    link: "https://www.space.com",
    pubDate: "Wed, 13 May 2026 17:00:00 GMT",
    category: "Science & Space"
  }
];

// Helper to generate simple hash string for feed IDs
function getSimpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

// Server action to pull real headlines
export async function fetchNewsHeadlines(): Promise<NewsArticle[]> {
  try {
    const response = await fetch('https://feeds.bbci.co.uk/news/world/rss.xml', {
      next: { revalidate: 3600 }, // Cache feed for 1 hour
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    });

    if (!response.ok) {
      console.warn("BBC RSS fetch failed, falling back to static pool.");
      return FALLBACK_NEWS;
    }

    const xml = await response.text();
    const articles: NewsArticle[] = [];

    // Extract item blocks from RSS XML
    const itemMatches = xml.matchAll(/<item>([\s\S]*?)<\/item>/g);
    let count = 0;

    for (const match of itemMatches) {
      if (count >= 15) break; // Limit to top 15 news items

      const content = match[1];

      // Parse fields using robust regex matching, handling CDATA and normal tags
      const titleMatch = content.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/) || content.match(/<title>([\s\S]*?)<\/title>/);
      const descMatch = content.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/) || content.match(/<description>([\s\S]*?)<\/description>/);
      const linkMatch = content.match(/<link>([\s\S]*?)<\/link>/);
      const dateMatch = content.match(/<pubDate>([\s\S]*?)<\/pubDate>/);

      const title = titleMatch ? titleMatch[1].trim() : '';
      const description = descMatch ? descMatch[1].trim() : '';
      const link = linkMatch ? linkMatch[1].trim() : 'https://www.bbc.com/news';
      const pubDate = dateMatch ? dateMatch[1].trim() : new Date().toUTCString();

      // Simple category heuristics
      let category = "World News";
      const lowerTitle = title.toLowerCase();
      if (lowerTitle.includes("space") || lowerTitle.includes("nasa") || lowerTitle.includes("telescope") || lowerTitle.includes("orbit")) {
        category = "Science & Space";
      } else if (lowerTitle.includes("reef") || lowerTitle.includes("coral") || lowerTitle.includes("climate") || lowerTitle.includes("environment") || lowerTitle.includes("green")) {
        category = "Environment";
      } else if (lowerTitle.includes("archaeologist") || lowerTitle.includes("ancient") || lowerTitle.includes("discover") || lowerTitle.includes("unearthed")) {
        category = "Archaeology & History";
      } else if (lowerTitle.includes("ai") || lowerTitle.includes("tech") || lowerTitle.includes("robot") || lowerTitle.includes("engineering")) {
        category = "Technology";
      } else if (lowerTitle.includes("wildlife") || lowerTitle.includes("animal") || lowerTitle.includes("species") || lowerTitle.includes("octopus")) {
        category = "Wildlife";
      } else if (lowerTitle.includes("health") || lowerTitle.includes("disease") || lowerTitle.includes("medical") || lowerTitle.includes("doctor")) {
        category = "Health";
      }

      if (title && description) {
        articles.push({
          id: `news-${getSimpleHash(title)}`,
          title,
          description,
          link,
          pubDate,
          category
        });
        count++;
      }
    }

    if (articles.length === 0) {
      return FALLBACK_NEWS;
    }

    return articles;
  } catch (error) {
    console.error("Error in fetchNewsHeadlines server action:", error);
    return FALLBACK_NEWS;
  }
}
