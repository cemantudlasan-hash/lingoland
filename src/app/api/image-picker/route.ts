import { NextResponse } from 'next/server';

const fetchUnsplashImages = async (query: string, count: number = 12) => {
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
      title: result.alt_description || `${query} image`,
    })).filter((img: any) => img.url);
  } catch (error) {
    console.error('Unsplash picker fetch failed:', error);
    return [];
  }
};

const fetchBingImages = async (query: string, count: number = 12, engineName: string = 'bing') => {
  try {
    const response = await fetch(
      `https://www.bing.com/images/search?q=${encodeURIComponent(query)}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
        }
      }
    );

    if (!response.ok) return [];
    const html = await response.text();
    
    // Bing images metadata are stored in 'm' attribute inside 'iusc' elements
    // format: m='{"murl":"https://highres.jpg","turl":"https://thumb.jpg","desc":"description"...}'
    const regex = /m="({[^"]+})"/g;
    const images: any[] = [];
    let match;
    const seenUrls = new Set<string>();

    while ((match = regex.exec(html)) !== null && images.length < count) {
      try {
        const decodedJson = match[1].replace(/&quot;/g, '"');
        const data = JSON.parse(decodedJson);
        if (data.murl && !seenUrls.has(data.murl)) {
          seenUrls.add(data.murl);
          images.push({
            url: data.murl,
            thumb: data.turl || data.murl,
            engine: engineName,
            title: data.desc || `${query} image`,
          });
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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');
  const source = searchParams.get('source') || 'unsplash';
  const count = parseInt(searchParams.get('count') || '12', 10);

  if (!query) {
    return NextResponse.json({ success: false, error: 'Query parameter is required' }, { status: 400 });
  }

  try {
    let images: any[] = [];
    const lowerSource = source.toLowerCase();
    
    if (lowerSource === 'google') {
      // Direct high quality fallback to Bing Images since Google blocks headless requests
      images = await fetchBingImages(query, count, 'google');
    } else if (lowerSource === 'pinterest') {
      // Scrape Pinterest images using Bing Site Search
      images = await fetchBingImages(`site:pinterest.com ${query}`, count, 'pinterest');
      // If site filter yields too few, try generic pinterest term search
      if (images.length < 4) {
        const fallback = await fetchBingImages(`${query} pinterest`, count, 'pinterest');
        if (fallback.length > 0) images = fallback;
      }
    } else if (lowerSource === 'bing') {
      images = await fetchBingImages(query, count, 'bing');
    } else {
      // Default: Unsplash
      // Unsplash blocks headless scrapers in some regions. We try the direct API, and fallback to site:unsplash.com or standard search
      images = await fetchUnsplashImages(query, count);
      if (images.length === 0) {
        console.log('Unsplash direct API blocked. Falling back to Bing-assisted Unsplash search...');
        images = await fetchBingImages(`site:unsplash.com ${query}`, count, 'unsplash');
        if (images.length === 0) {
          images = await fetchBingImages(query, count, 'unsplash');
        }
      }
    }
    
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
