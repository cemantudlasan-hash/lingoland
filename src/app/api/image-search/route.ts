import { NextResponse } from 'next/server';

const PLACEHOLDER_BG = '3730a3';
const PLACEHOLDER_FG = 'ede9fe';

const formatPlaceholderUrl = (query: string) =>
  `https://placehold.co/600x600/${PLACEHOLDER_BG}/${PLACEHOLDER_FG}?text=${encodeURIComponent(query)}&font=inter`;

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
  if (lower === 'environments' || lower === 'environment') {
    return 'nature outdoors environment landscape';
  }
  if (lower === 'outdoors and indoors' || lower === 'outdoor and indoor') {
    return 'outdoor nature landscape indoor room architecture';
  }
  return cleaned;
};

// High-accuracy Curated "Storage" Image Database for key vocabulary terms
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

// DuckDuckGo Image Fetcher with strict SafeSearch (p=1)
const tryDuckDuckGoSingleImage = async (query: string) => {
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
    if (!tokenRes.ok) return null;
    const tokenHtml = await tokenRes.text();
    const vqdMatch = tokenHtml.match(/vqd=["']?([^"'\s&]+)/);
    if (!vqdMatch) return null;

    const imgRes = await fetch(
      `https://duckduckgo.com/i.js?l=us-en&o=json&q=${encodeURIComponent(query)}&vqd=${vqdMatch[1]}&p=1`,
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Referer': 'https://duckduckgo.com/',
          'Accept-Language': 'en-US,en;q=1.0',
        },
      }
    );
    if (!imgRes.ok) return null;
    const data = await imgRes.json();
    const results = data.results || [];

    for (const item of results) {
      const imageUrl = item.image;
      const thumbUrl = item.thumbnail || imageUrl;
      const title = item.title || `${query} photo`;
      const pageUrl = item.url || '';

      if (imageUrl && isEnglishAndSafe(imageUrl, title, pageUrl)) {
        return {
          imageUrl,
          thumbUrl,
          engine: 'google',
        };
      }
    }
    return null;
  } catch (err) {
    console.error('DDG single image search failed:', err);
    return null;
  }
};

// Bing Images Single Image Fetcher with strict SafeSearch (adlt=strict)
const tryBingSingleImage = async (query: string) => {
  try {
    const response = await fetch(
      `https://www.bing.com/images/search?q=${encodeURIComponent(query)}&adlt=strict&form=HDRSC2&first=1`,
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=1.0',
        },
      }
    );

    if (!response.ok) return null;
    const html = await response.text();

    const regex = /m="({[^"]+})"/g;
    let match;
    while ((match = regex.exec(html)) !== null) {
      try {
        const decodedJson = match[1].replace(/&quot;/g, '"');
        const data = JSON.parse(decodedJson);
        const imageUrl = data.murl;
        const pageUrl = data.purl || '';
        const title = data.desc || `${query} image`;

        if (imageUrl && isEnglishAndSafe(imageUrl, title, pageUrl)) {
          return {
            imageUrl,
            thumbUrl: data.turl || imageUrl,
            engine: 'bing',
          };
        }
      } catch (e) {}
    }
    return null;
  } catch (error) {
    console.error('Bing single image search failed:', error);
    return null;
  }
};

// Wikipedia Image Fetcher
const tryWikipediaSearchImage = async (query: string) => {
  try {
    const wikiSearchUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrlimit=5&prop=pageimages&piprop=original&redirects=true`;
    const wikiResponse = await fetch(wikiSearchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      },
    });

    if (!wikiResponse.ok) return null;
    const wikiData = await wikiResponse.json();
    const pages = wikiData.query?.pages || {};

    for (const key of Object.keys(pages)) {
      const page = pages[key];
      const imageUrl = page.original?.source;
      if (imageUrl && isEnglishAndSafe(imageUrl, page.title || query)) {
        return { imageUrl, thumbUrl: imageUrl, engine: 'wikipedia' };
      }
    }
    return null;
  } catch (e) {
    return null;
  }
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');

  if (!query) {
    return NextResponse.json({ success: false, error: 'Query parameter is required' }, { status: 400 });
  }

  // Reject unsafe/restricted queries
  if (!isSafe(query)) {
    return NextResponse.json(
      { success: false, error: 'Query is invalid or contains restricted terms' },
      { status: 400 }
    );
  }

  // 1. Check local "storage" database first (Immediate match for key terms)
  const storageImageUrl = checkStorageImage(query);
  if (storageImageUrl) {
    return NextResponse.json({
      success: true,
      imageUrl: storageImageUrl,
      thumbUrl: storageImageUrl,
      engine: 'storage',
    });
  }

  const enhanced = enhanceEducationalQuery(query);

  // 2. High-accuracy SafeSearch via DuckDuckGo
  try {
    const ddgResult = await tryDuckDuckGoSingleImage(enhanced);
    if (ddgResult) return NextResponse.json({ success: true, ...ddgResult });
  } catch (error) {
    console.warn('DDG image search failed, falling back to Bing...', error);
  }

  // 3. Fallback to Bing with strict SafeSearch
  try {
    const bingResult = await tryBingSingleImage(enhanced);
    if (bingResult) return NextResponse.json({ success: true, ...bingResult });
  } catch (error) {
    console.warn('Bing single image search failed, falling back to Wikipedia...', error);
  }

  // 4. Fallback to Wikipedia Image
  try {
    const wikiResult = await tryWikipediaSearchImage(enhanced);
    if (wikiResult) return NextResponse.json({ success: true, ...wikiResult });
  } catch (error) {
    console.error('Wikipedia image fetch failed:', error);
  }

  // 5. Clean placeholder fallback
  return NextResponse.json({
    success: true,
    imageUrl: formatPlaceholderUrl(query),
    thumbUrl: formatPlaceholderUrl(query),
    engine: 'placeholder',
  });
}
