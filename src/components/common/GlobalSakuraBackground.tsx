'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useSakura } from 'contexts/SakuraContext';
import type { SceneParameters } from '../opencode/experience-config';

type SceneController = { invalidate: () => void; dispose: () => void };

export default function GlobalSakuraBackground() {
  const { enabled } = useSakura();
  const pathname = usePathname();
  const canvasHost = useRef<HTMLDivElement>(null);
  const fallbackCanvasRef = useRef<HTMLCanvasElement>(null);
  const scene = useRef<SceneController | null>(null);
  const parameters = useRef<SceneParameters>({
    progress: 0,
    paused: false,
    pointerX: 0,
    pointerY: 0,
  });
  const [graphicsUnavailable, setGraphicsUnavailable] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  // Landing page ('/') already has its own interactive petal scene in OpenCodeExperience
  const isLandingPage = pathname === '/';

  // Three.js 3D WebGL Petals
  useEffect(() => {
    if (!enabled || isLandingPage || graphicsUnavailable || !canvasHost.current || prefersReducedMotion) {
      if (scene.current) {
        scene.current.dispose();
        scene.current = null;
      }
      return;
    }

    let cancelled = false;
    let controller: SceneController | null = null;
    const host = canvasHost.current;

    import('../opencode/OpenCodeScene')
      .then(({ createPetalScene }) => {
        if (cancelled) return;
        try {
          controller = createPetalScene(
            host,
            parameters.current,
            'auto',
            () => setGraphicsUnavailable(true)
          );
          scene.current = controller;
        } catch {
          host.replaceChildren();
          setGraphicsUnavailable(true);
        }
      })
      .catch(() => {
        if (!cancelled) setGraphicsUnavailable(true);
      });

    return () => {
      cancelled = true;
      controller?.dispose();
      scene.current = null;
    };
  }, [enabled, isLandingPage, graphicsUnavailable, prefersReducedMotion]);

  // Pointer tracking for wind effect - throttled to display refresh rate
  useEffect(() => {
    let ticking = false;
    const handleMouseMove = (e: MouseEvent) => {
      if (parameters.current.paused || !matchMedia('(pointer: fine)').matches) return;
      if (!ticking) {
        requestAnimationFrame(() => {
          parameters.current.pointerX = (e.clientX / window.innerWidth) * 2 - 1;
          parameters.current.pointerY = (e.clientY / window.innerHeight) * 2 - 1;
          ticking = false;
        });
        ticking = true;
      }
    };

    const handleMouseLeave = () => {
      parameters.current.pointerX = 0;
      parameters.current.pointerY = 0;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  // 2D Canvas Fallback in case WebGL is unavailable
  useEffect(() => {
    if (!enabled || isLandingPage || !graphicsUnavailable || !fallbackCanvasRef.current || prefersReducedMotion) return;

    const canvas = fallbackCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number = 0;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize, { passive: true });

    const isLightMode = document.documentElement.classList.contains('chakra-ui-light');
    const petalCount = isLightMode ? 12 : Math.min(35, Math.floor(width / 40));
    const petals = Array.from({ length: petalCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 7 + 5,
      speedX: Math.random() * 1.2 + 0.4,
      speedY: Math.random() * 1.0 + 0.6,
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 1.5,
      opacity: Math.random() * 0.4 + 0.4,
    }));

    const render = () => {
      if (document.hidden) {
        animId = 0;
        return;
      }
      ctx.clearRect(0, 0, width, height);

      for (const p of petals) {
        p.x += p.speedX;
        p.y += p.speedY;
        p.rotation += p.rotSpeed;

        if (p.x > width + 20) p.x = -20;
        if (p.y > height + 20) p.y = -20;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = `rgba(88, 185, 154, ${p.opacity})`;

        // Draw curved petal
        ctx.beginPath();
        ctx.moveTo(0, -p.size);
        ctx.bezierCurveTo(p.size * 0.8, -p.size * 0.5, p.size * 0.8, p.size * 0.5, 0, p.size);
        ctx.bezierCurveTo(-p.size * 0.8, p.size * 0.5, -p.size * 0.8, -p.size * 0.5, 0, -p.size);
        ctx.fill();
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    const handleVisibility = () => {
      if (document.hidden) {
        if (animId) cancelAnimationFrame(animId);
        animId = 0;
      } else if (!animId) {
        animId = requestAnimationFrame(render);
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    animId = requestAnimationFrame(render);

    return () => {
      if (animId) cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [enabled, isLandingPage, graphicsUnavailable, prefersReducedMotion]);

  if (!enabled || isLandingPage || prefersReducedMotion) return null;

  return (
    <div
      aria-hidden="true"
      className="global-sakura-host"
    >
      {graphicsUnavailable ? (
        <canvas
          ref={fallbackCanvasRef}
          style={{ width: '100%', height: '100%', pointerEvents: 'none', display: 'block' }}
        />
      ) : (
        <div
          ref={canvasHost}
          style={{ width: '100%', height: '100%', pointerEvents: 'none' }}
        />
      )}
    </div>
  );
}
