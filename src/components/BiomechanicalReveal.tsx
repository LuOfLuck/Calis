import React, { useEffect, useRef, useState } from 'react';

interface BiomechanicalRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number; // ms delay
  threshold?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  cyanSurge?: boolean;
}

export const BiomechanicalReveal: React.FC<BiomechanicalRevealProps> = ({
  children,
  className = '',
  delay = 0,
  threshold = 0.12,
  direction = 'up',
  cyanSurge = true
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    // Support reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold,
        rootMargin: '0px 0px -40px 0px'
      }
    );

    observer.observe(el);

    return () => {
      if (el) observer.unobserve(el);
    };
  }, [threshold]);

  const getTransformClasses = () => {
    if (isVisible) return 'opacity-100 translate-x-0 translate-y-0 scale-100';

    switch (direction) {
      case 'up':
        return 'opacity-0 translate-y-8 scale-[0.98]';
      case 'down':
        return 'opacity-0 -translate-y-8 scale-[0.98]';
      case 'left':
        return 'opacity-0 translate-x-8 scale-[0.98]';
      case 'right':
        return 'opacity-0 -translate-x-8 scale-[0.98]';
      case 'none':
        return 'opacity-0 scale-[0.97]';
      default:
        return 'opacity-0 translate-y-8 scale-[0.98]';
    }
  };

  return (
    <div
      ref={elementRef}
      style={{
        transitionDelay: `${delay}ms`,
        transitionDuration: '750ms',
        transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)'
      }}
      className={`transition-all duration-700 transform will-change-transform ${getTransformClasses()} ${
        isVisible && cyanSurge ? 'biomechanical-active' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};
