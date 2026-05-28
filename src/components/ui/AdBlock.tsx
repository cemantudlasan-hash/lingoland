'use client';

import { useEffect, useState, useRef } from 'react';

interface AdBlockProps {
  slot: string;
  format?: 'auto' | 'fluid' | 'rectangle' | 'vertical' | 'horizontal';
  responsive?: 'true' | 'false';
  style?: React.CSSProperties;
  className?: string;
}

export default function AdBlock({
  slot,
  format = 'auto',
  responsive = 'true',
  style = { display: 'block' },
  className = '',
}: AdBlockProps) {
  const [adInitialized, setAdInitialized] = useState(false);
  const initializedRef = useRef(false);

  const publisherId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;
  const isPlaceholder = !publisherId || publisherId === 'ca-pub-XXXXXXXXXXXXXXXX' || process.env.NODE_ENV === 'development';

  useEffect(() => {
    // Prevent double-initialization (e.g. React Strict Mode in development)
    if (initializedRef.current || isPlaceholder) return;

    try {
      if (typeof window !== 'undefined') {
        const adsbygoogle = (window as any).adsbygoogle || [];
        adsbygoogle.push({});
        initializedRef.current = true;
        setAdInitialized(true);
      }
    } catch (err) {
      console.warn('AdSense ad push failed:', err);
    }
  }, [isPlaceholder]);

  // If in development/placeholder mode, render a beautiful preview card
  if (isPlaceholder) {
    return (
      <div className={`my-6 flex flex-col justify-center items-center overflow-hidden w-full min-h-[120px] p-4 bg-gradient-to-r from-blue-50/10 to-indigo-50/10 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-xl border border-dashed border-blue-300/50 dark:border-blue-700/50 backdrop-blur-sm transition-all duration-300 hover:border-blue-400 dark:hover:border-blue-600 ${className}`}>
        <div className="flex items-center gap-2 mb-1">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold tracking-wider uppercase text-blue-500 dark:text-blue-400">Google AdSense Preview</span>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center max-w-sm">
          Ad Slot: <span className="font-mono text-gray-700 dark:text-gray-300">{slot}</span> • Format: <span className="font-mono text-gray-700 dark:text-gray-300">{format}</span>
        </p>
        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-2">
          (This placeholder is shown in development mode or until your live ca-pub ID is set)
        </p>
      </div>
    );
  }

  return (
    <div className={`my-6 flex justify-center items-center overflow-hidden w-full min-h-[100px] ${className}`}>
      <ins
        className="adsbygoogle"
        style={style}
        data-ad-client={publisherId}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive}
      />
    </div>
  );
}
