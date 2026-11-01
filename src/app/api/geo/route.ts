import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const country =
    request.headers.get('x-vercel-ip-country') ||
    request.headers.get('cf-ipcountry') ||
    request.headers.get('x-country-code') ||
    request.headers.get('cloudfront-viewer-country') ||
    request.headers.get('x-geo-country') ||
    'UNKNOWN';

  return NextResponse.json({
    country: country.toUpperCase(),
  });
}
