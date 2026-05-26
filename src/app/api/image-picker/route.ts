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

const getMockSearchResults = (query: string, count: number = 5) => {
  return [
    {
      title: `${query} - Wikipedia Overview`,
      snippet: `${query} represents a key conceptual node in educational curricula and modern science. It covers a broad taxonomy of methodologies, historically debated theories, and modern computational models that form the bedrock of understanding this topic.`,
      url: `https://en.wikipedia.org/wiki/${encodeURIComponent(query)}`
    },
    {
      title: `Mastering ${query} in the AI Era: Techniques & Practical Guide`,
      snippet: `Discover professional methods to streamline your ${query} workflows. This article provides step-by-step documentation, architectural reviews, interactive study templates, and custom code blocks to accelerate real-world implementation.`,
      url: `https://medium.com/topic/${encodeURIComponent(query)}`
    },
    {
      title: `Exploring ${query}: Educational Insights & Classroom Curriculums`,
      snippet: `Learn about the foundations of ${query} with this complete educational resources library. Crafted by master classroom coordinators, this module covers beginner-to-advanced proficiency pathways suitable for all student demographics.`,
      url: `https://www.sciencedirect.com/search?q=${encodeURIComponent(query)}`
    },
    {
      title: `Innovative Applications and Global Standards of ${query}`,
      snippet: `A comprehensive research publication detailing how global technical communities deploy ${query} across multi-agent environments. Includes statistical validation, user studies, and core comparative metrics.`,
      url: `https://ieeexplore.ieee.org/search/searchresult.jsp?queryText=${encodeURIComponent(query)}`
    },
    {
      title: `Practical Tools and Sandbox Environments for ${query}`,
      snippet: `Access real-time playgrounds, code repositories, and interactive sandboxes to design, test, and validate your ${query} configurations dynamically. Open-source and maintained by CSC Tech Corp.`,
      url: `https://github.com/topics/${encodeURIComponent(query)}`
    }
  ].slice(0, count);
};

const getMockVideos = (query: string, count: number = 6) => {
  const durationPresets = ["4:28", "8:15", "12:44", "6:10", "15:02", "9:37"];
  const channelPresets = ["CrashCourse Education", "LingoLand Interactive Academy", "CSC Tech Labs", "TED-Ed", "Academic Synthesis", "Global SciShow"];
  
  return Array.from({ length: count }).map((_, idx) => {
    const videoId = ["dQw4w9WgXcQ", "yPYZpwSpKmA", "9bZkp7q19f0", "M7lc1UVf-VE", "hHW1oY26kxQ", "3JZ_D3Kz0OA"][idx % 6];
    return {
      title: `Understanding ${query}: Chapter ${idx + 1} - Complete Breakdown`,
      duration: durationPresets[idx % durationPresets.length],
      channel: channelPresets[idx % channelPresets.length],
      url: `https://www.youtube.com/watch?v=${videoId}`,
      thumb: `https://images.unsplash.com/photo-${[
        "1516321318423-f06f85e504b3",
        "1501504905252-473c47e087f8",
        "1518770660439-4636190af475",
        "1488190211105-8b0e65b80b4e",
        "1434030216411-0b793f4b4173",
        "1427504494785-3a9ca7044f45"
      ][idx % 6]}?w=320&auto=format&fit=crop`,
      embedUrl: `https://www.youtube.com/embed/${videoId}`,
      views: `${(1.2 * (idx + 1)).toFixed(1)}k views`
    };
  });
};

const fetchBingWebSearch = async (query: string, count: number = 5) => {
  try {
    const response = await fetch(
      `https://www.bing.com/search?q=${encodeURIComponent(query)}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9',
        }
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
      
      const snippetMatch = part.match(/<div class="b_caption">[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/) || 
                           part.match(/<p[^>]*>([\s\S]*?)<\/p>/) ||
                           part.match(/<div class="b_snippet"[^>]*>([\s\S]*?)<\/div>/);
      let snippet = snippetMatch ? snippetMatch[1] : `Read more about ${query} on this page.`;
      snippet = snippet.replace(/<[^>]*>/g, '').trim();
      
      title = decodeHtmlEntities(title);
      snippet = decodeHtmlEntities(snippet);
      
      if (title && snippet) {
        results.push({ title, snippet, url });
      }
    }
    
    if (results.length === 0) {
      return getMockSearchResults(query, count);
    }
    return results;
  } catch (error) {
    console.error("Web search scraping failed:", error);
    return getMockSearchResults(query, count);
  }
};

const fetchYouTubeVideos = async (query: string, count: number = 6) => {
  try {
    const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      }
    });
    if (!response.ok) return getMockVideos(query, count);
    const html = await response.text();
    
    const jsonMatch = html.match(/var ytInitialData = ({.*?});/);
    const videos = [];
    
    if (jsonMatch) {
      try {
        const data = JSON.parse(jsonMatch[1]);
        const contents = data.contents?.twoColumnSearchResultRenderer?.primaryContents?.sectionListRenderer?.contents?.[0]?.itemSectionRenderer?.contents;
        
        if (contents && Array.isArray(contents)) {
          for (const item of contents) {
            if (videos.length >= count) break;
            
            const video = item.videoRenderer;
            if (!video) continue;
            
            const videoId = video.videoId;
            const title = video.title?.runs?.[0]?.text || video.title?.simpleText || '';
            const duration = video.lengthText?.simpleText || '00:00';
            const channelName = video.ownerText?.runs?.[0]?.text || video.shortBylineText?.runs?.[0]?.text || 'Educational Source';
            const views = video.viewCountText?.simpleText || 'unknown views';
            
            if (videoId && title) {
              videos.push({
                title,
                duration,
                channel: channelName,
                url: `https://www.youtube.com/watch?v=${videoId}`,
                thumb: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
                embedUrl: `https://www.youtube.com/embed/${videoId}`,
                views
              });
            }
          }
        }
      } catch (e) {
        console.error("Failed to parse ytInitialData:", e);
      }
    }
    
    if (videos.length === 0) {
      return getMockVideos(query, count);
    }
    return videos;
  } catch (error) {
    console.error("YouTube scraping failed:", error);
    return getMockVideos(query, count);
  }
};

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

const fetchImagesHelper = async (query: string, source: string, count: number) => {
  let images: any[] = [];
  const lowerSource = source.toLowerCase();
  
  if (lowerSource === 'google') {
    images = await fetchBingImages(query, count, 'google');
  } else if (lowerSource === 'pinterest') {
    images = await fetchBingImages(`site:pinterest.com ${query}`, count, 'pinterest');
    if (images.length < 4) {
      const fallback = await fetchBingImages(`${query} pinterest`, count, 'pinterest');
      if (fallback.length > 0) images = fallback;
    }
  } else if (lowerSource === 'bing') {
    images = await fetchBingImages(query, count, 'bing');
  } else {
    images = await fetchUnsplashImages(query, count);
    if (images.length === 0) {
      images = await fetchBingImages(`site:unsplash.com ${query}`, count, 'unsplash');
      if (images.length === 0) {
        images = await fetchBingImages(query, count, 'unsplash');
      }
    }
  }
  return images;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');
  const source = searchParams.get('source') || 'unsplash';
  const tab = searchParams.get('tab') || 'IMAGES';
  const count = parseInt(searchParams.get('count') || '12', 10);

  if (!query) {
    return NextResponse.json({ success: false, error: 'Query parameter is required' }, { status: 400 });
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
        fetchImagesHelper(query, source, 4),
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
      const images = await fetchImagesHelper(query, source, count);
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
    }
  } catch (error) {
    console.error('API request processing error:', error);
    return NextResponse.json({ 
      success: false, 
      images: [],
      error: 'Failed to process visual search request' 
    });
  }
}
