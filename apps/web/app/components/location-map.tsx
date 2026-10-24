'use client';

import { useState } from 'react';
import { getMapLinks } from '../site-config';

export default function LocationMap({ address }: { address: string }) {
  const [visible, setVisible] = useState(false);
  const links = getMapLinks(address);
  return <div className="sc-location-map">
    {visible ? <iframe
      src={links.embed}
      title={`Mapa de ubicación: ${address}`}
      width="400"
      height="240"
      loading="lazy"
      referrerPolicy="no-referrer"
      allowFullScreen
    /> : <div className="sc-map-preview">
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6Zm6-3v15m6-12v15" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" /></svg>
      <strong>Ubicación del consultorio</strong>
      <p>{address}</p>
      <button type="button" className="sc-button sc-button-light" onClick={() => setVisible(true)} aria-describedby="map-privacy">Ver mapa</button>
      <p id="map-privacy">Al cargar el mapa te conectas con Google Maps, un servicio externo.</p>
    </div>}
    <div className="sc-map-actions">
      <a className="sc-text-link" href={links.search} target="_blank" rel="noopener noreferrer" aria-label="Cómo llegar en Google Maps (se abre en una pestaña nueva)">Cómo llegar <span aria-hidden="true">↗</span></a>
      {visible && <button type="button" onClick={() => setVisible(false)}>Ocultar mapa</button>}
    </div>
  </div>;
}
