'use client';

import { useEffect, useRef } from 'react';

/** El HTML/SVG inicial permanece útil aunque JavaScript o WebGL no estén disponibles. */
export default function DentalVisual() {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = host.current;
    if (!element) return;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let disposed = false;
    let loading = false;
    let cleanup: (() => void) | undefined;
    let inView = false;

    const start = () => {
      if (disposed || loading || cleanup || !inView || preference.matches) return;
      loading = true;
      void import('./dental-scene').then(({ createDentalScene }) => {
        if (!disposed && !preference.matches && inView) cleanup = createDentalScene(element);
      }).catch(() => {
        element.dataset.scene = 'fallback';
      }).finally(() => { loading = false; });
    };
    const change = () => {
      if (preference.matches) {
        cleanup?.();
        cleanup = undefined;
        element.dataset.scene = 'fallback';
      } else start();
    };
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry?.isIntersecting ?? false;
      start();
    }, { rootMargin: '120px' });
    observer.observe(element);
    preference.addEventListener('change', change);
    return () => {
      disposed = true;
      observer.disconnect();
      preference.removeEventListener('change', change);
      cleanup?.();
    };
  }, []);

  return (
    <div className="dental-visual" ref={host} data-scene="fallback" aria-hidden="true">
      <svg className="dental-fallback" viewBox="0 0 560 600" fill="none">
        <defs>
          <linearGradient id="ceramic" x1="170" y1="160" x2="380" y2="460" gradientUnits="userSpaceOnUse"><stop stopColor="white" /><stop offset="0.55" stopColor="#ecf2ff" /><stop offset="1" stopColor="#8cacec" /></linearGradient>
          <filter id="ceramic-shadow" x="-60%" y="-40%" width="220%" height="220%"><feDropShadow dx="12" dy="25" stdDeviation="20" floodColor="#001f73" floodOpacity="0.35" /></filter>
        </defs>
        <ellipse cx="280" cy="480" rx="125" ry="22" fill="#073ba9" fillOpacity="0.4" />
        <circle cx="280" cy="300" r="205" stroke="white" strokeOpacity="0.2" />
        <path d="M205 165c-65-9-83 43-63 103 12 36 25 61 31 102 8 49 14 85 37 85 25 0 23-58 43-93 13-23 26-23 39 0 20 35 18 93 43 93 23 0 29-36 37-85 6-41 19-66 31-102 20-60 2-112-63-103-25 4-43 17-68 17s-43-13-67-17Z" fill="url(#ceramic)" filter="url(#ceramic-shadow)" transform="rotate(-12 280 300)" />
        <ellipse cx="280" cy="315" rx="230" ry="75" stroke="#aac9ff" strokeWidth="2" transform="rotate(-27 280 315)" />
        <circle cx="470" cy="209" r="7" fill="white" />
      </svg>
      <div className="canvas-mount" />
    </div>
  );
}
