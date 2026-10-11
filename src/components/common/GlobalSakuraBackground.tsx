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

  // Landing page ('/') already has its own interactive petal scene in OpenCodeExperience
  const isLandingPage = pathname === '/';

  // Three.js 3D WebGL Petals
  useEffect(() => {
    if (!enabled || isLandingPage || graphicsUnavailable || !canvasHost.current) {
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
            'high',
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
  }, [enabled, isLandingPage, graphicsUnavailable]);

  // Pointer tracking for wind effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (parameters.current.paused || !matchMedia('(pointer: fine)').matches) return;
      parameters.current.pointerX = (e.clientX / window.innerWidth) * 2 - 1;
      parameters.current.pointerY = (e.clientY / window.innerHeight) * 2 - 1;
    };

    const handleMouseLeave = () => {
      parameters.current.pointerX = 0;
      parameters.current.pointerY = 0;
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  // 2D Canvas Fallback in case WebGL is unavailable
  useEffect(() => {
    if (!enabled || isLandingPage || !graphicsUnavailable || !fallbackCanvasRef.current) return;

    const canvas = fallbackCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const petalCount = Math.min(60, Math.floor(width / 25));
    const petals = Array.from({ length: petalCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 8 + 6,
      speedX: Math.random() * 1.5 + 0.5,
      speedY: Math.random() * 1.2 + 0.8,
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 2,
      opacity: Math.random() * 0.4 + 0.5,
    }));

    const render = () => {
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
        ctx.fillStyle = `rgba(244, 167, 185, ${p.opacity})`;

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

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [enabled, isLandingPage, graphicsUnavailable]);

  if (!enabled || isLandingPage) return null;

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 15, // Floating above backgrounds and cards, below navbars & modals
        pointerEvents: 'none',
        opacity: 0.95,
        background: 'transparent',
      }}
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
