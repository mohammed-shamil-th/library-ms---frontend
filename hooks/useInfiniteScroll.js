'use client';

import { useEffect, useRef } from 'react';

export default function useInfiniteScroll(callback, hasMore, loading) {
  const elementRef = useRef(null);
  const observerRef = useRef(null);

  useEffect(() => {
    // Clean up previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    if (loading || !hasMore) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          callback();
        }
      },
      {
        root: null,
        rootMargin: '100px',
        threshold: 0.1,
      }
    );

    observerRef.current = observer;

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [callback, hasMore, loading]);

  return elementRef;
}

