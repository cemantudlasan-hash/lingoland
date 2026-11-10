import { NextResponse } from 'next/server';

const SITE_URL = 'https://www.lingolandverse.com';
const KEY_URLS = [
  `${SITE_URL}/`,
  `${SITE_URL}/invite`,
  `${SITE_URL}/games`,
  `${SITE_URL}/apps`,
  `${SITE_URL}/blog`,
  `${SITE_URL}/reader`,
  `${SITE_URL}/language-modules`,
  `${SITE_URL}/universe`,
  `${SITE_URL}/sitemap.xml`,
];

export async function POST() {
  const results: { engine: string; ok: boolean; status?: number; note?: string }[] = [];

  // 1. Ping IndexNow (Bing, Yandex, Seznam, Naver unified instant indexing protocol)
  try {
    const indexNowKey = process.env.INDEXNOW_KEY || 'lingolandverseindexnow2026key';
    const res = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        host: 'www.lingolandverse.com',
        key: indexNowKey,
        keyLocation: `${SITE_URL}/${indexNowKey}.txt`,
        urlList: KEY_URLS,
      }),
    });
    results.push({
      engine: 'IndexNow (Bing / Yandex / DuckDuckGo / Naver)',
      ok: res.status >= 200 && res.status < 300,
      status: res.status,
    });
  } catch (err: any) {
    results.push({
      engine: 'IndexNow',
      ok: false,
      note: err?.message || 'Network unreachable in local environment',
    });
  }

  return NextResponse.json({
    success: true,
    timestamp: new Date().toISOString(),
    sitemapUrl: `${SITE_URL}/sitemap.xml`,
    submittedUrls: KEY_URLS,
    results,
    message:
      'Search engine discovery broadcast triggered! Sitemap & key classroom landing pages queued for indexing.',
  });
}

export async function GET() {
  return POST();
}

