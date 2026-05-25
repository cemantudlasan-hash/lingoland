import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');

  if (!query) {
    return NextResponse.json({ success: false, error: 'Query parameter is required' }, { status: 400 });
  }

  // Engine 1: Unsplash napi
  try {
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

    if (response.ok) {
      const data = await response.json();
      const results = data.results || [];

      if (results.length > 0) {
        const firstResult = results[0];
        const imageUrl = firstResult.urls?.small || firstResult.urls?.regular;
        return NextResponse.json({ success: true, imageUrl, engine: 'unsplash' });
      }
    }
  } catch (error) {
    console.warn('Unsplash visual search engine failed. Falling back to Wikipedia API...', error);
  }

  // Engine 2 Fallback: Wikipedia PageImages API (CORS-free, 100% free open search index)
  try {
    const wikiUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&format=json&piprop=original&titles=${encodeURIComponent(query)}&redirects=true`;
    const wikiResponse = await fetch(wikiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      }
    });

    if (wikiResponse.ok) {
      const wikiData = await wikiResponse.json();
      const pages = wikiData.query?.pages || {};
      const pageKeys = Object.keys(pages);
      
      if (pageKeys.length > 0 && pageKeys[0] !== '-1') {
        const page = pages[pageKeys[0]];
        const imageUrl = page.original?.source;
        if (imageUrl) {
          return NextResponse.json({ success: true, imageUrl, engine: 'wikipedia' });
        }
      }
    }
  } catch (error) {
    console.error('Wikipedia fallback visual search engine failed:', error);
  }

  return NextResponse.json({ success: false, error: 'No images found for this query in any resource library.' });
}
