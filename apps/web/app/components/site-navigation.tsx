'use client';

import Link from 'next/link';
import { useRef } from 'react';
import { bookingHref, navigationItems } from '../site-config';

export default function SiteNavigation() {
  const menu = useRef<HTMLDetailsElement>(null);
  return <details className="sc-mobile-menu" ref={menu} onKeyDown={event => {
    if (event.key === 'Escape' && menu.current) {
      menu.current.open = false;
      menu.current.querySelector('summary')?.focus();
    }
  }}>
    <summary>Menú <span aria-hidden="true">＋</span></summary>
    <nav aria-label="Navegación móvil" onClick={event => {
      if ((event.target as HTMLElement).closest('a') && menu.current) menu.current.open = false;
    }}>
      {navigationItems.map(([href, label]) => <a key={href} href={href}>{label}</a>)}
      <a href="#contacto">Contacto</a>
      <Link href={bookingHref()}>Agendar evaluación</Link>
    </nav>
  </details>;
}
