import { NextResponse } from 'next/server';

const fetchUnsplashImages = async (query: string, count: number = 8) => {
  try {
    const response = await fetch(
      `https://unsplash.com/napi/search/photos?query=${encodeURIComponent(query)}&per_page=${count}`,
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

    if (!response.ok) return [];
    const data = await response.json();
    const results = data.results || [];
    
    return results.map((result: any) => ({
      url: result.urls?.small || result.urls?.regular,
      thumb: result.urls?.thumb,
      engine: 'unsplash',
      title: result.alt_description || 'Image',
    })).filter((img: any) => img.url);
  } catch (error) {
    console.error('Unsplash picker fetch failed:', error);
    return [];
  }
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');

  if (!query) {
    return NextResponse.json({ success: false, error: 'Query parameter is required' }, { status: 400 });
  }

  try {
    const images = await fetchUnsplashImages(query, 8);
    
    if (images.length > 0) {
      return NextResponse.json({ 
        success: true, 
        images,
        engine: 'unsplash-picker',
      });
    }
    
    // Fallback: return empty array on failure
    return NextResponse.json({ 
      success: false, 
      images: [],
      error: 'No images found' 
    });
  } catch (error) {
    console.error('Image picker error:', error);
    return NextResponse.json({ 
      success: false, 
      images: [],
      error: 'Failed to fetch images' 
    });
  }
}
