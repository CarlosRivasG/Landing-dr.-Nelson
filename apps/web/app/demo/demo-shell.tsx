'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, type ReactNode } from 'react';
import { useDemo } from './demo-provider';

export default function DemoShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { dispatch } = useDemo();
  const [confirmReset, setConfirmReset] = useState(false);
  return <div className="demo-app">
    <a className="skip-link" href="#demo-content">Saltar al contenido</a>
    <div className="demo-banner"><strong>Entorno de demostración</strong><span>Datos ficticios · sin cobros ni envíos · los cambios se borran al recargar</span></div>
    <header className="demo-header">
      <Link href="/" className="demo-brand" aria-label="SmileCorp / Dr. Nelson, inicio">SmileCorp<span>.</span><small>DR. NELSON / DEMO</small></Link>
      <nav aria-label="Navegación del prototipo">
        <Link href="/reservar" aria-current={pathname === '/reservar' ? 'page' : undefined}>Reservar</Link>
        <Link href="/app/hoy" aria-current={pathname === '/app/hoy' ? 'page' : undefined}>Hoy</Link>
        <Link href="/app/agenda" aria-current={pathname === '/app/agenda' ? 'page' : undefined}>Agenda</Link>
      </nav>
      <button className="demo-reset" onClick={() => setConfirmReset(true)}>Reiniciar demo</button>
    </header>
    {confirmReset && <section className="demo-confirm" aria-label="Confirmar reinicio"><p>¿Borrar los cambios de esta demostración y recuperar las citas iniciales?</p><button className="button button-black" onClick={() => { dispatch({ type: 'reset', now: new Date().toISOString() }); setConfirmReset(false); }}>Sí, reiniciar</button><button className="demo-secondary" onClick={() => setConfirmReset(false)} autoFocus>Conservar cambios</button></section>}
    <main id="demo-content" className="demo-main">{children}</main>
    <footer className="demo-footer"><p>Hipótesis de producto · Un consultorio, un profesional · America/Santiago</p><p>Sin autenticación ni conexión con la API. No introducir información real.</p><Link href="/">Volver a SmileCorp ↗</Link></footer>
  </div>;
}
