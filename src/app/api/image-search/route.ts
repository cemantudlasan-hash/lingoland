import { NextResponse } from 'next/server';

const PLACEHOLDER_BG = '3730a3';
const PLACEHOLDER_FG = 'ede9fe';

const formatPlaceholderUrl = (query: string) =>
  `https://placehold.co/600x600/${PLACEHOLDER_BG}/${PLACEHOLDER_FG}?text=${encodeURIComponent(query)}&font=inter`;

const ADULT_KEYWORDS = [
  'porn', 'sexy', 'sex', 'nude', 'naked', 'erotic', 'xxx', 'nsfw', 'sensual', 'cleavage',
  'bikini', 'lingerie', 'underwear', 'swimsuit', 'swimwear', 'topless', 'playboy', 'hentai',
  'boobs', 'breast', 'buttock', 'butt', 'ass', 'pussy', 'penis', 'dick', 'vagina', 'vulva',
  'seductive', 'fetish', 'adult only', '18+', '16+'
];

export const isSafe = (text: string): boolean => {
  if (!text) return true;
  const lower = text.toLowerCase();
  return !ADULT_KEYWORDS.some(word => lower.includes(word));
};

export const enhanceQuery = (query: string): string => {
  const clean = query.toLowerCase().trim();
  const eduTerms = ['diagram', 'chart', 'clipart', 'illustration', 'worksheet', 'educational', 'classroom', 'school', 'science', 'math', 'study', 'teaching', 'infographic'];
  if (eduTerms.some(term => clean.includes(term))) {
    return query;
  }
  return `${query} educational clipart diagram`;
};

// High-accuracy Curated "Storage" Image Database for ambiguous terms
const AVAILABLE_IMAGES_STORAGE: Record<string, string> = {
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
  const cleanQuery = query.toLowerCase().trim().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"");
  return AVAILABLE_IMAGES_STORAGE[cleanQuery] || null;
};

// Robust Google Images scraper
const tryGoogleImages = async (query: string, count: number = 10) => {
  try {
    const url = `https://www.google.com/search?q=${encodeURIComponent(query)}&tbm=isch&safe=active`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      }
    });

    if (!response.ok) return null;
    const html = await response.text();

    // Pre-extract all sequential gstatic thumbnail URLs to pair with high-res original images
    const gstaticRegex = /(https:\/\/encrypted-tbn\d+\.gstatic\.com\/images\?q=tbn:[^"\s&]+)/gi;
    const gstaticUrls: string[] = [];
    let gstMatch;
    while ((gstMatch = gstaticRegex.exec(html)) !== null) {
      gstaticUrls.push(gstMatch[1]);
    }

    const images: any[] = [];
    const seenUrls = new Set<string>();

    // 1. Try modern Google Images AF_initDataCallback format: e.g. ["https://url", h, w]
    const arrayRegex = /\["(https?:\/\/[^"]+?\.(?:jpg|jpeg|png|gif|webp|svg))",\s*(\d+),\s*(\d+)\]/gi;
    let match;
    let idx = 0;
    while ((match = arrayRegex.exec(html)) !== null) {
      const imageUrl = match[1];
      if (imageUrl && !seenUrls.has(imageUrl) && !imageUrl.includes('gstatic.com')) {
        const title = `${query} image`;
        if (isSafe(imageUrl) && isSafe(title)) {
          seenUrls.add(imageUrl);
          images.push({
            url: imageUrl,
            thumb: gstaticUrls[idx] || imageUrl, // Pair with sequential gstatic thumbnail!
            engine: 'google',
            title: title,
          });
          idx++;
          if (images.length >= count) break;
        }
      }
    }

    // 2. Try matching legacy /imgres?imgurl= parameter
    if (images.length === 0) {
      const imgresRegex = /\/imgres\?imgurl=([^&]+)/g;
      while ((match = imgresRegex.exec(html)) !== null) {
        try {
          const decodedUrl = decodeURIComponent(match[1]);
          if (decodedUrl && !seenUrls.has(decodedUrl)) {
            const title = `${query} image`;
            if (isSafe(decodedUrl) && isSafe(title)) {
              seenUrls.add(decodedUrl);
              images.push({
                url: decodedUrl,
                thumb: gstaticUrls[idx] || decodedUrl,
                engine: 'google',
                title: title,
              });
              idx++;
              if (images.length >= count) break;
            }
          }
        } catch (e) {}
      }
    }

    // 3. Fallback to gstatic thumbnails directly
    if (images.length === 0) {
      gstaticUrls.forEach((thumbUrl) => {
        if (thumbUrl && !seenUrls.has(thumbUrl)) {
          if (isSafe(thumbUrl)) {
            seenUrls.add(thumbUrl);
            images.push({
              url: thumbUrl,
              thumb: thumbUrl,
              engine: 'google',
              title: `${query} thumbnail`,
            });
          }
        }
      });
    }

    return images.length > 0 ? images.slice(0, count) : null;
  } catch (err) {
    console.error("Google scrape failed:", err);
    return null;
  }
};

const tryGoogleSingleImage = async (query: string) => {
  const enhanced = enhanceQuery(query);
  let results = await tryGoogleImages(enhanced, 1);
  if (results && results.length > 0) {
    return {
      imageUrl: results[0].url,
      thumbUrl: results[0].thumb,
      engine: 'google',
    };
  }
  results = await tryGoogleImages(query, 1);
  if (results && results.length > 0) {
    return {
      imageUrl: results[0].url,
      thumbUrl: results[0].thumb,
      engine: 'google',
    };
  }
  return null;
};

const tryUnsplashRaw = async (query: string) => {
  const response = await fetch(
    `https://unsplash.com/napi/search/photos?query=${encodeURIComponent(query)}&per_page=3&content_filter=high`,
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

  if (!response.ok) return null;
  const data = await response.json();
  const results = data.results || [];
  if (results.length === 0) return null;

  for (const firstResult of results) {
    const imageUrl = firstResult.urls?.small || firstResult.urls?.regular;
    const title = firstResult.alt_description || '';
    if (imageUrl && isSafe(imageUrl) && isSafe(title)) {
      return { imageUrl, engine: 'unsplash' };
    }
  }
  return null;
};

const tryUnsplash = async (query: string) => {
  const enhanced = enhanceQuery(query);
  const enhancedResult = await tryUnsplashRaw(enhanced);
  if (enhancedResult) return enhancedResult;
  return await tryUnsplashRaw(query);
};

const tryWikipediaPageImage = async (query: string) => {
  const wikiUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&format=json&piprop=original&titles=${encodeURIComponent(query)}&redirects=true`;
  const wikiResponse = await fetch(wikiUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    },
  });

  if (!wikiResponse.ok) return null;
  const wikiData = await wikiResponse.json();
  const pages = wikiData.query?.pages || {};
  const pageKeys = Object.keys(pages);

  if (pageKeys.length > 0 && pageKeys[0] !== '-1') {
    const page = pages[pageKeys[0]];
    const imageUrl = page.original?.source;
    if (imageUrl && isSafe(imageUrl)) {
      return { imageUrl, engine: 'wikipedia' };
    }
  }

  return null;
};

const tryWikipediaSearchImage = async (query: string) => {
  const wikiSearchUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrlimit=1&prop=pageimages&piprop=original&redirects=true`;
  const wikiResponse = await fetch(wikiSearchUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    },
  });

  if (!wikiResponse.ok) return null;
  const wikiData = await wikiResponse.json();
  const pages = wikiData.query?.pages || {};
  const pageKeys = Object.keys(pages);

  if (pageKeys.length > 0) {
    const page = pages[pageKeys[0]];
    const imageUrl = page.original?.source;
    if (imageUrl && isSafe(imageUrl)) {
      return { imageUrl, engine: 'wikipedia-search' };
    }
  }

  return null;
};

const tryUnsplashFeatured = (query: string) => ({
  imageUrl: formatPlaceholderUrl(query),
  engine: 'placeholder',
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');

  if (!query) {
    return NextResponse.json({ success: false, error: 'Query parameter is required' }, { status: 400 });
  }

  // Reject unsafe/restricted queries
  if (!isSafe(query)) {
    return NextResponse.json({ success: false, error: 'Query is invalid or contains restricted terms' }, { status: 400 });
  }

  // 1. Check local "storage" database first (No Fallback Required if found!)
  const storageImageUrl = checkStorageImage(query);
  if (storageImageUrl) {
    return NextResponse.json({ success: true, imageUrl: storageImageUrl, engine: 'storage' });
  }

  // 2. Google is default search engine when highlighting word
  try {
    const googleResult = await tryGoogleSingleImage(query);
    if (googleResult) return NextResponse.json({ success: true, ...googleResult });
  } catch (error) {
    console.warn('Google image search engine failed. Falling back to Unsplash...', error);
  }

  // 3. Fallback search engines
  try {
    const unsplashResult = await tryUnsplash(query);
    if (unsplashResult) return NextResponse.json({ success: true, ...unsplashResult });
  } catch (error) {
    console.warn('Unsplash visual search engine failed. Falling back to Wikipedia API...', error);
  }

  try {
    const wikiResult = await tryWikipediaPageImage(query);
    if (wikiResult) return NextResponse.json({ success: true, ...wikiResult });
  } catch (error) {
    console.error('Wikipedia page image fetch failed:', error);
  }

  try {
    const wikiSearchResult = await tryWikipediaSearchImage(query);
    if (wikiSearchResult) return NextResponse.json({ success: true, ...wikiSearchResult });
  } catch (error) {
    console.error('Wikipedia search image fetch failed:', error);
  }

  // Fallback: Return a clean placehold.co SVG placeholder card
  try {
    return NextResponse.json({ success: true, ...tryUnsplashFeatured(query) });
  } catch {
    return NextResponse.json({ success: true, imageUrl: formatPlaceholderUrl(query), engine: 'placeholder' });
  }
}
