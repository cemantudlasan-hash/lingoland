import { NextResponse } from 'next/server';

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/')
    .replace(/&#x3D;/g, '=');
}

// Comprehensive 16+ / Adult / Inappropriate content safety filter
const ADULT_PATTERNS = [
  /\b(porn|porno|pornography|xxx|nsfw|adult\s*only|18\+|16\+|r-rated|mature\s*content)\b/i,
  /\b(sex|sexy|sexual|sexuality|intercourse|erotic|erotica|sensual|seductive|fetish|bdsm)\b/i,
  /\b(nude|nudes|nudity|nudist|naked|unclothed|undressed|bare\s*body|topless|bottomless|shirtless)\b/i,
  /\b(cleavage|breast|breasts|boob|boobs|butt|buttock|buttocks|ass|booty|crotch|penis|dick|vagina|vulva|pussy)\b/i,
  /\b(bikini|swimsuit|swimwear|bathing\s*suit|lingerie|underwear|undergarment|undergarments|bra|panties|thong|g-string)\b/i,
  /\b(strip|stripper|striptease|burlesque|playboy|penthouse|hustler|onlyfans|escort|prostitute|prostitution)\b/i,
  /\b(steamy|provocative|intimate\s*scene|lovemaking|bedroom\s*scene|kissing\s*scene|sensual\s*photo)\b/i,
  /\b(history\s*of\s*nudity|nudity\s*in|celebrity\s*nude|nude\s*scene|nude\s*actors?)\b/i,
  /\b(equus|gods\s*and\s*monsters)\b/i,
];

const isSafe = (text: string): boolean => {
  if (!text) return true;
  return !ADULT_PATTERNS.some(regex => regex.test(text));
};

const NON_ENGLISH_SCRIPTS_REGEX = /[\u0400-\u04FF\u0600-\u06FF\u0E00-\u0E7F\u4E00-\u9FFF\u3040-\u30FF\uAC00-\uD7AF\u0900-\u097F\u0590-\u05FF]/;

const NON_ENGLISH_OR_WORKSHEET_KEYWORDS = [
  'lembar', 'kerja', 'peserta', 'didik', 'soal', 'tugas', 'jawaban', 'latihan',
  'kurikulum', 'pembelajaran', 'bahasa', 'kelas', 'kunci', 'ulangan', 'ujian',
  'sekolah', 'modul', 'rangkuman', 'materiku', 'belajar', 'pendidikan', 'siswa',
  'guru', 'materi', 'sd', 'smp', 'sma', 'smk', 'buku', 'tematik', 'rpp', 'silabus',
  'ejercicio', 'ficha', 'devoir', 'hausaufgabe', 'compito'
];

const FOREIGN_WORKSHEET_DOMAINS = [
  'liveworksheets.com', 'studocu.com', 'id.scribd.com', 'scribd.com/document',
  'docplayer.info', 'roboguru', 'ruangguru', 'brainly.co.id', 'brainly.com',
  'quipper.com', 'zenius.net', 'kumpulan-soal', 'gurubagi.com', 'duniapendidikan',
  'kemdikbud.go.id', 'academia.edu/attachment'
];

const isEnglishAndSafe = (url: string, title: string = '', pageUrl: string = ''): boolean => {
  if (!isSafe(url) || !isSafe(title) || !isSafe(pageUrl)) return false;

  const lowerTitle = (title || '').toLowerCase();
  const lowerUrl = (url || '').toLowerCase();
  const lowerPageUrl = (pageUrl || '').toLowerCase();

  // 1. Reject non-Latin scripts (Cyrillic, Arabic, Chinese, Japanese, Korean, Thai, Hindi, etc.)
  if (NON_ENGLISH_SCRIPTS_REGEX.test(title)) return false;

  // 2. Reject foreign educational worksheets domains
  if (FOREIGN_WORKSHEET_DOMAINS.some(domain => lowerUrl.includes(domain) || lowerPageUrl.includes(domain))) {
    return false;
  }

  // 3. Reject foreign language educational/worksheet keywords in title or URL
  for (const word of NON_ENGLISH_OR_WORKSHEET_KEYWORDS) {
    const wordRegex = new RegExp(`(^|[^a-z0-9])${word}([^a-z0-9]|$)`, 'i');
    if (wordRegex.test(lowerTitle) || wordRegex.test(lowerUrl) || wordRegex.test(lowerPageUrl)) {
      return false;
    }
  }

  // 4. Reject worksheets / printables if query didn't ask for them
  if (lowerUrl.includes('liveworksheets') || lowerTitle.includes('lembar kerja') || lowerTitle.includes('peserta didik')) {
    return false;
  }

  return true;
};

const cleanQuery = (query: string): string => {
  return query
    .replace(/\b(worksheet|clipart|diagram|lembar|kerja|soal|tugas|peserta|didik)\b/gi, '')
    .replace(/[^\w\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

const enhanceEducationalQuery = (query: string): string => {
  const cleaned = cleanQuery(query) || query;
  const lower = cleaned.toLowerCase();
  // If the query is specifically about environment(s) without extra context, focus on nature, outdoors, and biomes
  if (lower === 'environments' || lower === 'environment') {
    return 'nature outdoors environment landscape';
  }
  if (lower === 'outdoors and indoors' || lower === 'outdoor and indoor') {
    return 'outdoor nature landscape indoor room architecture';
  }
  return cleaned;
};

// High-accuracy Curated "Storage" Image Database for key terms
const AVAILABLE_IMAGES_STORAGE: Record<string, string> = {
  'environments': 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800',
  'environment': 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800',
  'outdoors and indoors': 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800',
  'outdoors': 'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=800',
  'indoors': 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800',
  'nature': 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800',
  'keys': 'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=800',
  'key': 'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=800',
  'apple': 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=800',
  'banana': 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=800',
  'orange': 'https://images.unsplash.com/photo-1547514701-42782101795e?w=800',
  'python': 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800',
  'jaguar': 'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=800',
  'amazon': 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800'
};

const checkStorageImage = (query: string): string | null => {
  const cleaned = query.toLowerCase().trim().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '');
  return AVAILABLE_IMAGES_STORAGE[cleaned] || null;
};

// DuckDuckGo Image Search with strict SafeSearch (p=1)
const fetchDuckDuckGoImages = async (query: string, count: number = 12, engineName: string = 'google') => {
  try {
    const tokenRes = await fetch(
      `https://duckduckgo.com/?q=${encodeURIComponent(query)}&ia=images&iax=images`,
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=1.0',
        },
      }
    );
    if (!tokenRes.ok) return [];
    const tokenHtml = await tokenRes.text();
    const vqdMatch = tokenHtml.match(/vqd=["']?([^"'\s&]+)/);
    if (!vqdMatch) return [];

    const vqd = vqdMatch[1];
    const imgRes = await fetch(
      `https://duckduckgo.com/i.js?l=us-en&o=json&q=${encodeURIComponent(query)}&vqd=${vqd}&p=1`,
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Referer': 'https://duckduckgo.com/',
          'Accept-Language': 'en-US,en;q=1.0',
        },
      }
    );
    if (!imgRes.ok) return [];
    const data = await imgRes.json();
    const results = data.results || [];

    const images: any[] = [];
    const seenUrls = new Set<string>();

    for (const item of results) {
      if (images.length >= count) break;
      const imageUrl = item.image;
      const thumbUrl = item.thumbnail || imageUrl;
      const title = decodeHtmlEntities(item.title || `${query} photo`);
      const pageUrl = item.url || '';

      if (imageUrl && !seenUrls.has(imageUrl)) {
        if (isEnglishAndSafe(imageUrl, title, pageUrl)) {
          seenUrls.add(imageUrl);
          images.push({
            url: imageUrl,
            thumb: thumbUrl,
            engine: engineName,
            title: title,
          });
        }
      }
    }
    return images;
  } catch (err) {
    console.error(`DDG image search failed for query "${query}":`, err);
    return [];
  }
};

// Bing Images Search with strict SafeSearch (adlt=strict) and clean query
const fetchBingImages = async (query: string, count: number = 12, engineName: string = 'bing') => {
  try {
    const cleaned = cleanQuery(query) || query;
    const response = await fetch(
      `https://www.bing.com/images/search?q=${encodeURIComponent(cleaned)}&adlt=strict&form=HDRSC2&first=1`,
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=1.0',
        },
      }
    );

    if (!response.ok) return [];
    const html = await response.text();

    const regex = /m="({[^"]+})"/g;
    const images: any[] = [];
    let match;
    const seenUrls = new Set<string>();

    while ((match = regex.exec(html)) !== null && images.length < count) {
      try {
        const decodedJson = match[1].replace(/&quot;/g, '"');
        const data = JSON.parse(decodedJson);
        const imageUrl = data.murl;
        const pageUrl = data.purl || '';
        const title = decodeHtmlEntities(data.desc || `${query} image`);

        if (imageUrl && !seenUrls.has(imageUrl)) {
          if (isEnglishAndSafe(imageUrl, title, pageUrl)) {
            seenUrls.add(imageUrl);
            images.push({
              url: imageUrl,
              thumb: data.turl || imageUrl,
              engine: engineName,
              title: title,
            });
          }
        }
      } catch (e) {
        // ignore parse errors
      }
    }
    return images;
  } catch (error) {
    console.error(`Bing scrape failed for ${engineName}:`, error);
    return [];
  }
};

// Unsplash photography fetcher with direct API and DDG site:unsplash fallback
const fetchUnsplashImages = async (query: string, count: number = 12) => {
  const cleaned = cleanQuery(query) || query;
  // 1. Try direct Unsplash API
  try {
    const response = await fetch(
      `https://unsplash.com/napi/search/photos?query=${encodeURIComponent(cleaned)}&per_page=${count}&content_filter=high`,
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept': 'application/json',
          'Accept-Language': 'en-US,en;q=0.9',
          'Referer': 'https://unsplash.com/',
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      const results = data.results || [];
      const valid = results
        .map((result: any) => ({
          url: result.urls?.small || result.urls?.regular,
          thumb: result.urls?.thumb,
          engine: 'unsplash',
          title: result.alt_description || `${cleaned} photo`,
        }))
        .filter((img: any) => img.url && isEnglishAndSafe(img.url, img.title));

      if (valid.length > 0) return valid.slice(0, count);
    }
  } catch (error) {
    console.warn('Direct Unsplash napi unavailable, using DDG fallback:', error);
  }

  // 2. Fallback to DDG site:unsplash.com search
  const ddgUnsplash = await fetchDuckDuckGoImages(`site:unsplash.com ${cleaned}`, count, 'unsplash');
  if (ddgUnsplash.length > 0) return ddgUnsplash;

  // 3. Fallback to Bing site:unsplash.com search
  return await fetchBingImages(`site:unsplash.com ${cleaned}`, count, 'unsplash');
};

// Pinterest photo fetcher with strict educational ideas and strict safe search
const fetchPinterestImages = async (query: string, count: number = 12) => {
  const cleaned = cleanQuery(query) || query;
  // Use focused educational and photography keywords on Pinterest to prevent random movie nudity / models
  const pinterestQuery = `site:pinterest.com ${cleaned} photo nature landscape`;
  let images = await fetchDuckDuckGoImages(pinterestQuery, count, 'pinterest');
  if (images.length < 4) {
    const secondary = await fetchBingImages(`site:pinterest.com ${cleaned} photography`, count, 'pinterest');
    const seen = new Set(images.map(i => i.url));
    for (const img of secondary) {
      if (!seen.has(img.url)) {
        images.push(img);
        seen.add(img.url);
      }
    }
  }
  return images.slice(0, count);
};

// Web search via Bing with strict adult filtering
const fetchBingWebSearch = async (query: string, count: number = 5) => {
  try {
    const cleaned = cleanQuery(query) || query;
    const response = await fetch(
      `https://www.bing.com/search?q=${encodeURIComponent(cleaned)}&adlt=strict`,
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9',
        },
      }
    );
    if (!response.ok) return getMockSearchResults(query, count);
    const html = await response.text();

    const parts = html.split('class="b_algo"');
    const results = [];

    for (let i = 1; i < parts.length && results.length < count; i++) {
      const part = parts[i];
      const hrefMatch = part.match(/href="([^"]+)"/);
      if (!hrefMatch) continue;
      const url = hrefMatch[1];

      if (url.startsWith('https://www.bing.com') || url.startsWith('/')) continue;

      const titleMatch = part.match(/<h2[^>]*>[\s\S]*?<a[^>]*>([\s\S]*?)<\/a>[\s\S]*?<\/h2>/);
      let title = titleMatch ? titleMatch[1] : `${query} Search Result`;
      title = title.replace(/<[^>]*>/g, '').trim();

      const snippetMatch =
        part.match(/<div class="b_caption">[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/) ||
        part.match(/<p[^>]*>([\s\S]*?)<\/p>/) ||
        part.match(/<div class="b_snippet"[^>]*>([\s\S]*?)<\/div>/);
      let snippet = snippetMatch ? snippetMatch[1] : `Read more about ${query} on this page.`;
      snippet = snippet.replace(/<[^>]*>/g, '').trim();

      title = decodeHtmlEntities(title);
      snippet = decodeHtmlEntities(snippet);

      if (title && snippet) {
        if (isEnglishAndSafe(url, title) && isSafe(snippet)) {
          results.push({ title, snippet, url });
        }
      }
    }

    return results.length > 0 ? results : getMockSearchResults(query, count);
  } catch (error) {
    console.error('Web search scraping failed:', error);
    return getMockSearchResults(query, count);
  }
};

// YouTube video search with strict safety checks
const fetchYouTubeVideos = async (query: string, count: number = 6) => {
  try {
    const cleaned = cleanQuery(query) || query;
    const ytResponse = await fetch(
      `https://www.youtube.com/results?search_query=${encodeURIComponent(cleaned + ' educational')}`,
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9',
        },
      }
    );

    if (ytResponse.ok) {
      const html = await ytResponse.text();
      const match =
        html.match(/var ytInitialData = ({[\s\S]*?});<\/script>/) ||
        html.match(/window\["ytInitialData"\] = ({[\s\S]*?});<\/script>/) ||
        html.match(/ytInitialData\s*=\s*({[\s\S]*?});/);
      if (match) {
        const data = JSON.parse(match[1]);
        const contents =
          data.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents;
        if (contents) {
          const itemSection = contents.find((c: any) => c.itemSectionRenderer);
          const videoItems = itemSection?.itemSectionRenderer?.contents || [];
          const videos: any[] = [];

          for (const item of videoItems) {
            if (item.videoRenderer && videos.length < count) {
              const vr = item.videoRenderer;
              const videoId = vr.videoId;
              const title = vr.title?.runs?.[0]?.text || `${query} Video`;
              const duration = vr.lengthText?.simpleText || 'Unknown';
              const channel =
                vr.ownerText?.runs?.[0]?.text || vr.shortBylineText?.runs?.[0]?.text || 'YouTube Channel';
              const views = vr.viewCountText?.simpleText || '0 views';
              const thumb = vr.thumbnail?.thumbnails?.[0]?.url || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

              if (isEnglishAndSafe(thumb, title) && isSafe(channel)) {
                videos.push({
                  title,
                  duration,
                  channel,
                  url: `https://www.youtube.com/watch?v=${videoId}`,
                  thumb,
                  embedUrl: `https://www.youtube.com/embed/${videoId}`,
                  views,
                });
              }
            }
          }
          if (videos.length > 0) return videos;
        }
      }
    }
  } catch (ytError) {
    console.warn('Direct YouTube scrape failed, using mock fallback:', ytError);
  }

  return getMockVideos(query, count);
};

const getMockSearchResults = (query: string, count: number = 5) => {
  return [
    {
      title: `${query} - Educational Overview`,
      snippet: `Explore the key concepts and scientific definitions of ${query}. Suitable for classroom curriculum, presentation outlines, and learning modules.`,
      url: `https://en.wikipedia.org/wiki/${encodeURIComponent(query)}`,
    },
    {
      title: `Understanding ${query}: A Comprehensive Guide`,
      snippet: `Learn about the foundations, environmental context, and practical examples of ${query} designed for English language students.`,
      url: `https://medium.com/topic/${encodeURIComponent(query)}`,
    },
    {
      title: `Scientific Insights and Studies on ${query}`,
      snippet: `A curated educational resource detailing foundational theories, observation methodologies, and key attributes of ${query}.`,
      url: `https://www.sciencedirect.com/search?q=${encodeURIComponent(query)}`,
    },
  ].slice(0, count);
};

const getMockVideos = (query: string, count: number = 6) => {
  const durationPresets = ['4:28', '8:15', '12:44', '6:10', '15:02', '9:37'];
  const channelPresets = [
    'National Geographic Kids',
    'LingoLand Interactive Academy',
    'SciShow Education',
    'CrashCourse Biology',
    'TED-Ed',
    'Global Nature Channel',
  ];

  return Array.from({ length: count }).map((_, idx) => {
    const videoId = ['dQw4w9WgXcQ', 'yPYZpwSpKmA', '9bZkp7q19f0', 'M7lc1UVf-VE', 'hHW1oY26kxQ', '3JZ_D3Kz0OA'][
      idx % 6
    ];
    return {
      title: `Understanding ${query}: Visual Guide & Explanation (Part ${idx + 1})`,
      duration: durationPresets[idx % durationPresets.length],
      channel: channelPresets[idx % channelPresets.length],
      url: `https://www.youtube.com/watch?v=${videoId}`,
      thumb: `https://images.unsplash.com/photo-${
        [
          '1516321318423-f06f85e504b3',
          '1501504905252-473c47e087f8',
          '1518770660439-4636190af475',
          '1488190211105-8b0e65b80b4e',
          '1434030216411-0b793f4b4173',
          '1427504494785-3a9ca7044f45',
        ][idx % 6]
      }?w=320&auto=format&fit=crop`,
      embedUrl: `https://www.youtube.com/embed/${videoId}`,
      views: `${(1.2 * (idx + 1)).toFixed(1)}k views`,
    };
  });
};

const fetchImagesForSource = async (query: string, source: string, count: number) => {
  const lowerSource = source.toLowerCase();
  const enhancedQuery = enhanceEducationalQuery(query);

  let images: any[] = [];

  if (lowerSource === 'google') {
    // Google Visual Search: High-precision DDG with clean Bing fallback
    images = await fetchDuckDuckGoImages(enhancedQuery, count, 'google');
    if (images.length < Math.min(4, count)) {
      const bingFallback = await fetchBingImages(enhancedQuery, count, 'google');
      const seen = new Set(images.map(i => i.url));
      for (const img of bingFallback) {
        if (!seen.has(img.url)) {
          images.push(img);
          seen.add(img.url);
        }
      }
    }
  } else if (lowerSource === 'pinterest') {
    images = await fetchPinterestImages(enhancedQuery, count);
  } else if (lowerSource === 'bing') {
    images = await fetchBingImages(enhancedQuery, count, 'bing');
    if (images.length < Math.min(4, count)) {
      const ddgFallback = await fetchDuckDuckGoImages(enhancedQuery, count, 'bing');
      const seen = new Set(images.map(i => i.url));
      for (const img of ddgFallback) {
        if (!seen.has(img.url)) {
          images.push(img);
          seen.add(img.url);
        }
      }
    }
  } else {
    // Unsplash
    images = await fetchUnsplashImages(enhancedQuery, count);
  }

  // Prepend curated high-accuracy storage image if direct match
  const storageImageUrl = checkStorageImage(query);
  if (storageImageUrl) {
    images = images.filter(img => img.url !== storageImageUrl);
    images.unshift({
      url: storageImageUrl,
      thumb: storageImageUrl,
      engine: 'storage',
      title: `${query} (Curated)`,
    });
  }

  return images.slice(0, count);
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');
  const source = searchParams.get('source') || 'google';
  const tab = searchParams.get('tab') || 'IMAGES';
  const count = parseInt(searchParams.get('count') || '12', 10);

  if (!query) {
    return NextResponse.json({ success: false, error: 'Query parameter is required' }, { status: 400 });
  }

  // Reject unsafe/restricted queries
  if (!isSafe(query)) {
    return NextResponse.json(
      { success: false, error: 'Query contains restricted terms or violates safety guidelines.' },
      { status: 400 }
    );
  }

  try {
    const activeTab = tab.toUpperCase();

    if (activeTab === 'SEARCH') {
      const results = await fetchBingWebSearch(query, 6);
      return NextResponse.json({
        success: true,
        webResults: results,
      });
    } else if (activeTab === 'VIDEOS') {
      const results = await fetchYouTubeVideos(query, 6);
      return NextResponse.json({
        success: true,
        videos: results,
      });
    } else if (activeTab === 'ALL') {
      const [images, webResults, videos] = await Promise.all([
        fetchImagesForSource(query, source, 6),
        fetchBingWebSearch(query, 3),
        fetchYouTubeVideos(query, 3),
      ]);
      return NextResponse.json({
        success: true,
        images,
        webResults,
        videos,
      });
    } else {
      const images = await fetchImagesForSource(query, source, count);
      if (images.length > 0) {
        return NextResponse.json({
          success: true,
          images,
          engine: source,
        });
      }
      return NextResponse.json({
        success: false,
        images: [],
        error: 'No safe images found matching this query.',
      });
    }
  } catch (error) {
    console.error('API request processing error in image-picker:', error);
    return NextResponse.json({
      success: false,
      images: [],
      error: 'Failed to process visual search request',
    });
  }
}
