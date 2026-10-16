import { NextRequest, NextResponse } from 'next/server';

const LANG_CODE_MAP: Record<string, string> = {
  th: 'th',
  thai: 'th',
  ko: 'ko',
  korean: 'ko',
  ja: 'ja',
  japanese: 'ja',
  es: 'es',
  spanish: 'es',
  fr: 'fr',
  french: 'fr',
  vi: 'vi',
  vietnamese: 'vi',
  zh: 'zh-CN',
  chinese: 'zh-CN',
  de: 'de',
  german: 'de',
  en: 'en',
  english: 'en',
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const text = (body.text || '').trim();
    const rawLang = body.lang || body.targetLang || 'th';
    const lang = LANG_CODE_MAP[rawLang.toLowerCase()] || rawLang || 'th';

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    // Google Translate TTS endpoint for instant native audio streaming
    const encodedText = encodeURIComponent(text);
    const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${lang}&q=${encodedText}`;

    const res = await fetch(ttsUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://translate.google.com/',
      },
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch TTS audio' }, { status: res.status });
    }

    const arrayBuffer = await res.arrayBuffer();
    const base64Audio = Buffer.from(arrayBuffer).toString('base64');

    return NextResponse.json({
      audio: base64Audio,
      mime: 'audio/mpeg',
      success: true,
    });
  } catch (error: any) {
    console.error('Error in /api/tts:', error);
    return NextResponse.json({ error: error.message || 'Internal TTS Error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const text = (searchParams.get('text') || '').trim();
    const rawLang = searchParams.get('lang') || 'th';
    const lang = LANG_CODE_MAP[rawLang.toLowerCase()] || rawLang || 'th';

    if (!text) {
      return new NextResponse('Text is required', { status: 400 });
    }

    const encodedText = encodeURIComponent(text);
    const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${lang}&q=${encodedText}`;

    const res = await fetch(ttsUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://translate.google.com/',
      },
    });

    if (!res.ok) {
      return new NextResponse('Failed to fetch TTS audio', { status: res.status });
    }

    const arrayBuffer = await res.arrayBuffer();
    return new NextResponse(arrayBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      },
    });
  } catch (error: any) {
    return new NextResponse(error.message || 'Internal TTS Error', { status: 500 });
  }
}
