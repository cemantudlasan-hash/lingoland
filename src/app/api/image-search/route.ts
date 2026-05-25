import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');

  if (!query) {
    return NextResponse.json({ success: false, error: 'Query parameter is required' }, { status: 400 });
  }

  try {
    // Fetch from Unsplash internal API used on their public search page (napi)
    // Extremely fast, stable, and requires no API keys
    const response = await fetch(
      `https://unsplash.com/napi/search/photos?query=${encodeURIComponent(query)}&per_page=3`,
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Referer: 'https://unsplash.com/',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Unsplash internal search failed: ${response.status}`);
    }

    const data = await response.json();
    const results = data.results || [];

    if (results.length > 0) {
      const firstResult = results[0];
      const imageUrl = firstResult.urls?.small || firstResult.urls?.regular;
      return NextResponse.json({ success: true, imageUrl });
    }

    return NextResponse.json({ success: false, error: 'No images found for this query' });
  } catch (error: any) {
    console.error('Image search API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
