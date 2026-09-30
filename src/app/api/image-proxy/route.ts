import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get('url');
  const format = searchParams.get('format'); // 'base64' or binary

  if (!targetUrl) {
    return NextResponse.json({ success: false, error: 'URL parameter is required' }, { status: 400 });
  }

  // If already a data URI, decode or return it
  if (targetUrl.startsWith('data:')) {
    if (format === 'base64') {
      return NextResponse.json({ success: true, dataUrl: targetUrl });
    }
    const parts = targetUrl.split(',');
    const mimeMatch = parts[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/png';
    const buffer = Buffer.from(parts[1] || '', 'base64');
    return new Response(buffer, {
      headers: {
        'Content-Type': mime,
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  try {
    const parsed = new URL(targetUrl);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return NextResponse.json({ success: false, error: 'Invalid URL protocol' }, { status: 400 });
    }

    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Referer': parsed.origin,
      },
      signal: AbortSignal.timeout(12000),
    });

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: `Upstream image fetch failed with status ${response.status}` },
        { status: 502 }
      );
    }

    const contentType = response.headers.get('content-type') || 'image/png';
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (format === 'base64') {
      const mime = contentType.startsWith('image/') ? contentType.split(';')[0] : 'image/png';
      const base64 = buffer.toString('base64');
      const dataUrl = `data:${mime};base64,${base64}`;
      return NextResponse.json({
        success: true,
        dataUrl,
        contentType: mime,
        size: buffer.length,
      });
    }

    return new Response(buffer, {
      headers: {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=43200',
      },
    });
  } catch (error: any) {
    console.error('Image proxy error for URL:', targetUrl, error?.message || error);
    return NextResponse.json(
      { success: false, error: 'Failed to proxy image: ' + (error?.message || 'Unknown error') },
      { status: 500 }
    );
  }
}
