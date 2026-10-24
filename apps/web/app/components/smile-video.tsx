'use client';

import { useEffect, useId, useRef, useState } from 'react';

interface SmileVideoProps {
  src: string;
  poster: string;
  description: string;
  credit: string;
  duration: string;
}

export default function SmileVideo({ src, poster, description, credit, duration }: SmileVideoProps) {
  const video = useRef<HTMLVideoElement>(null);
  const descriptionId = useId();
  const [started, setStarted] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const element = video.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) element.pause();
    });
    const visibility = () => { if (document.hidden) element.pause(); };
    observer.observe(element);
    document.addEventListener('visibilitychange', visibility);
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', visibility);
      element.pause();
    };
  }, []);

  const play = () => {
    const element = video.current;
    if (!element) return;
    setFailed(false);
    setStarted(true);
    // No src en el HTML inicial: ni siquiera se solicita el MP4 antes de esta acción.
    if (!element.getAttribute('src')) element.src = src;
    else if (element.error) element.load();
    void element.play().catch((error: unknown) => {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      setFailed(true);
      setStarted(false);
    });
  };

  const pauseOthers = () => {
    video.current?.closest('.smiles-grid')?.querySelectorAll('video').forEach(element => {
      if (element !== video.current) element.pause();
    });
  };

  return (
    <figure className="smile-card">
      <div className="smile-media">
        <video ref={video} poster={poster} width={960} height={540} preload="none" controls={started} muted playsInline onPlay={pauseOthers} onError={() => { setFailed(true); setStarted(false); }} aria-label={description} aria-describedby={descriptionId}>
          Tu navegador no admite este video. {description}.
        </video>
        {!started && <button className="smile-play" type="button" onClick={play} aria-label={`Reproducir: ${description.toLowerCase()}`}><span className="play-disc"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m9 5 11 7-11 7V5Z" fill="currentColor" /></svg></span><span>Ver sonrisa <small>{duration} · Sin sonido</small></span></button>}
        <span className="smile-stock-label">VIDEO DE REFERENCIA</span>
      </div>
      <figcaption id={descriptionId}><span>{description}. Sin diálogo ni información sonora.</span><span>{credit} / Mixkit</span></figcaption>
      {failed && <p className="video-error" role="status">No pudimos reproducir el video. Puedes volver a intentarlo; la imagen de referencia sigue disponible.</p>}
    </figure>
  );
}
