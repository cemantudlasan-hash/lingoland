'use client';

import { useEffect, useState } from 'react';

const EVENT_NAME = 'ai_usage_increment';

export function useAICounter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const initialCount = parseInt(sessionStorage.getItem('ai_usage_count') || '0', 10);
      setCount(initialCount);
      
      const handleIncrement = () => {
        setCount(prev => {
          const newCount = prev + 1;
          sessionStorage.setItem('ai_usage_count', String(newCount));
          return newCount;
        });
      };
      
      window.addEventListener(EVENT_NAME, handleIncrement);
      return () => window.removeEventListener(EVENT_NAME, handleIncrement);
    }
  }, []);

  const increment = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event(EVENT_NAME));
    }
  };

  return { count, increment };
}
