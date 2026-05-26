import { NextResponse } from 'next/server';

const PLACEHOLDER_BG = '3730a3';
const PLACEHOLDER_FG = 'ede9fe';

const formatPlaceholderUrl = (query: string) =>
  `https://placehold.co/600x600/${PLACEHOLDER_BG}/${PLACEHOLDER_FG}?text=${encodeURIComponent(query)}&font=inter`;

const tryUnsplash = async (query: string) => {
  const response = await fetch(
    `https://unsplash.com/napi/search/photos?query=${encodeURIComponent(query)}&per_page=3`,
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

  const firstResult = results[0];
  const imageUrl = firstResult.urls?.small || firstResult.urls?.regular;
  return imageUrl ? { imageUrl, engine: 'unsplash' } : null;
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
    return imageUrl ? { imageUrl, engine: 'wikipedia' } : null;
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
    return imageUrl ? { imageUrl, engine: 'wikipedia-search' } : null;
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
