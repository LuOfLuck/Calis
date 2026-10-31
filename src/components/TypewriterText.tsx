import React, { useEffect, useRef, useState } from 'react';

interface TypewriterTextProps {
  text: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'div';
  className?: string;
  speed?: number; // ms per character
  delay?: number; // ms delay before starting
  cursor?: boolean;
  highlightWords?: {
    words: string[];
    className?: string;
  }[];
  onComplete?: () => void;
}

export const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  as: Component = 'span',
  className = '',
  speed = 22,
  delay = 0,
  cursor = true,
  highlightWords = [],
  onComplete
}) => {
  const [displayedLength, setDisplayedLength] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const containerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setDisplayedLength(text.length);
      setIsFinished(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);
        }
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -40px 0px'
      }
    );

    const el = containerRef.current;
    if (el) {
      observer.observe(el);
    }

    return () => {
      if (el) observer.unobserve(el);
    };
  }, [text, hasStarted]);

  useEffect(() => {
    if (!hasStarted || isFinished) return;

    let timeoutId: number;
    let intervalId: number;

    timeoutId = window.setTimeout(() => {
      let currentIdx = 0;
      intervalId = window.setInterval(() => {
        currentIdx += 1;
        setDisplayedLength(currentIdx);

        if (currentIdx >= text.length) {
          clearInterval(intervalId);
          setIsFinished(true);
          if (onComplete) onComplete();
        }
      }, speed);
    }, delay);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, [hasStarted, text, speed, delay, isFinished, onComplete]);

  // Current visible slice
  const visibleText = text.slice(0, displayedLength);

  // Helper to render text with highlighted segments if specified
  const renderHighlightedText = () => {
    if (!highlightWords || highlightWords.length === 0) {
      return visibleText;
    }

    // Build regex to match any of the highlight words
    const allWords = highlightWords.flatMap(h => h.words);
    if (allWords.length === 0) return visibleText;

    const regex = new RegExp(`(${allWords.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
    const parts = visibleText.split(regex);

    return parts.map((part, index) => {
      const match = highlightWords.find(h =>
        h.words.some(w => w.toLowerCase() === part.toLowerCase())
      );
      if (match) {
        return (
          <span key={index} className={match.className || 'text-liquid-gradient'}>
            {part}
          </span>
        );
      }
      return <React.Fragment key={index}>{part}</React.Fragment>;
    });
  };

  return (
    <Component
      ref={containerRef as unknown as React.Ref<any>}
      className={`inline-block break-words ${className}`}
      aria-label={text}
    >
      <span>{renderHighlightedText()}</span>
      {cursor && !isFinished && hasStarted && (
        <span
          className="inline-block w-2.5 h-[1.1em] ml-1 bg-[#00f2fe] align-middle animate-pulse shadow-[0_0_8px_#00f2fe]"
          aria-hidden="true"
        />
      )}
      {/* Invisible placeholder before start to preserve layout height without jitter */}
      {!hasStarted && (
        <span className="opacity-0 select-none pointer-events-none" aria-hidden="true">
          {text}
        </span>
      )}
    </Component>
  );
};
