'use client';

import { useEffect, useRef, useState } from 'react';
import type { SceneParameters } from '../opencode/experience-config';

type SceneController = { invalidate: () => void; dispose: () => void };

export default function GlobalSakuraBackground() {
  const canvasHost = useRef<HTMLDivElement>(null);
  const scene = useRef<SceneController | null>(null);
  const parameters = useRef<SceneParameters>({
    progress: 0,
    paused: false,
    pointerX: 0,
    pointerY: 0,
  });
  const [reduced, setReduced] = useState(false);
  const [graphicsUnavailable, setGraphicsUnavailable] = useState(false);

  useEffect(() => {
    const query = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (reduced || graphicsUnavailable || !canvasHost.current) return;
    
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
            'low', 
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
  }, [reduced, graphicsUnavailable]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (reduced || parameters.current.paused || !matchMedia('(pointer: fine)').matches) return;
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
  }, [reduced]);

  if (reduced || graphicsUnavailable) return null;

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: -1,
        pointerEvents: 'none',
        opacity: 0.5, // Subtle overlay for light/dark themes
        background: 'transparent',
      }}
    >
      <div 
        ref={canvasHost} 
        style={{ width: '100%', height: '100%' }} 
      />
    </div>
  );
}
