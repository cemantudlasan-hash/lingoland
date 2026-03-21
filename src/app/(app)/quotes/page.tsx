
"use client";

import dynamic from 'next/dynamic';

export const QuoteActions = dynamic(() => import('./quote-actions').then(mod => mod.QuoteActions), { ssr: false });

export default function QuotesPage() {
    return (
        <QuoteActions />
    );
}
