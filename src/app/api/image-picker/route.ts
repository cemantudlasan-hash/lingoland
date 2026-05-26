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

const fetchGoogleImages = async (query: string, count: number = 12) => {
  try {
    const response = await fetch(
      `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(query)}`,
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
    
    const images: any[] = [];
    const urlRegex = /(https?:\/\/[^"'\s<>]+?\.(?:jpg|jpeg|png|gif|webp))/gi;
    const matches = html.match(urlRegex) || [];
    
    const uniqueUrls = new Set<string>();
    for (const url of matches) {
      // Filter out Google domains to avoid non-image schema and UI links
      if (
        (url.includes('google.com') && !url.includes('gstatic.com')) ||
        url.includes('schema.org') ||
        url.includes('w3.org') ||
        url.includes('googleusercontent.com/tracker')
      ) {
        continue;
      }
      uniqueUrls.add(url);
      if (uniqueUrls.size >= count * 3) break;
    }

    const urlList = Array.from(uniqueUrls);
    const gstaticThumbs = urlList.filter(u => u.includes('gstatic.com'));
    const externalUrls = urlList.filter(u => !u.includes('gstatic.com'));
    
    for (let i = 0; i < Math.min(externalUrls.length, count); i++) {
      const url = externalUrls[i];
      const thumb = gstaticThumbs[i] || url;
      images.push({
        url,
        thumb,
        engine: 'google',
        title: `${query} image`,
      });
    }

    // Fallback to gstatic thumbnails directly if we didn't parse enough high-res images
    if (images.length < 4 && gstaticThumbs.length > 0) {
      for (let i = images.length; i < Math.min(gstaticThumbs.length, count); i++) {
        images.push({
          url: gstaticThumbs[i],
          thumb: gstaticThumbs[i],
          engine: 'google',
          title: `${query} image`,
        });
      }
    }
    
    return images;
  } catch (error) {
    console.error('Google scrape failed:', error);
    return [];
  }
};

const fetchPinterestImages = async (query: string, count: number = 12) => {
  // Pinterest scraping is highly protected, but searching 'site:pinterest.com [query]' 
  // on Bing Images provides high resolution, real Pinterest Pin images safely and reliably!
  return fetchBingImages(`site:pinterest.com ${query}`, count, 'pinterest');
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
    
    switch (source.toLowerCase()) {
      case 'google':
        images = await fetchGoogleImages(query, count);
        break;
      case 'pinterest':
        images = await fetchPinterestImages(query, count);
        break;
      case 'bing':
        images = await fetchBingImages(query, count, 'bing');
        break;
      case 'unsplash':
      default:
        images = await fetchUnsplashImages(query, count);
        break;
    }
    
    if (images.length > 0) {
      return NextResponse.json({ 
        success: true, 
        images,
        engine: source,
      });
    }
    
    // Fallback: If chosen engine fails, try Unsplash as a fallback picker
    if (source.toLowerCase() !== 'unsplash') {
      const fallbackImages = await fetchUnsplashImages(query, count);
      if (fallbackImages.length > 0) {
        return NextResponse.json({ 
          success: true, 
          images: fallbackImages,
          engine: 'unsplash-fallback',
        });
      }
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
