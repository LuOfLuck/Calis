import React, { useEffect, useRef } from 'react';

export const WaterCausticsCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrame: number;
    let width = 0;
    let height = 0;

    const onResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    onResize();
    window.addEventListener('resize', onResize);

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const startTime = performance.now();

    // Pre-render each glowing particle once onto a tiny offscreen canvas
    // to avoid 45 expensive ctx.shadowBlur Gaussian passes every frame
    const createBubbleSprite = (r: number, hue: 'green' | 'cyan', opacity: number) => {
      const halfSize = Math.ceil(r + 12);
      const size = halfSize * 2;
      const offscreen = document.createElement('canvas');
      offscreen.width = size;
      offscreen.height = size;
      const sCtx = offscreen.getContext('2d');
      if (sCtx) {
        sCtx.beginPath();
        sCtx.arc(halfSize, halfSize, r, 0, Math.PI * 2);
        sCtx.shadowColor = hue === 'green' ? 'rgba(34, 197, 94, 0.6)' : 'rgba(0, 242, 254, 0.75)';
        sCtx.shadowBlur = 6;
        sCtx.fillStyle =
          hue === 'green'
            ? `rgba(34, 197, 94, ${opacity})`
            : `rgba(0, 225, 255, ${opacity})`;
        sCtx.fill();
      }
      return { sprite: offscreen, halfSize };
    };

    // Ambient floating cyan particles matching reference image
    const bubbleCount = 45;
    const bubbles = Array.from({ length: bubbleCount }, () => {
      const r = 1.5 + Math.random() * 3.2;
      const opacity = 0.35 + Math.random() * 0.55;
      const hue: 'green' | 'cyan' = Math.random() > 0.85 ? 'green' : 'cyan';
      const { sprite, halfSize } = createBubbleSprite(r, hue, opacity);
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        r,
        speed: 12 + Math.random() * 20,
        phase: Math.random() * Math.PI * 2,
        opacity,
        hue,
        sprite,
        halfSize,
      };
    });

    let lastTime = performance.now();

    const render = () => {
      if (!ctx || !canvas) return;
      const now = performance.now();
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;
      const t = (now - startTime) / 1000;

      ctx.clearRect(0, 0, width, height);

      // Render floating glowing droplets via hardware-accelerated sprite blitting
      for (let i = 0; i < bubbles.length; i++) {
        const b = bubbles[i];
        if (!prefersReducedMotion) {
          b.y -= b.speed * dt;
          if (b.y < -15) {
            b.y = height + 15;
            b.x = Math.random() * width;
          }
        }

        const sway = Math.sin(t * 1.2 + b.phase) * 10;
        ctx.drawImage(b.sprite, b.x + sway - b.halfSize, b.y - b.halfSize);
      }

      if (!prefersReducedMotion) {
        animFrame = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animFrame);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-80"
    />
  );
};
