import type { ReactNode } from 'react';
import './globals.css';
import './landing.css';

export { metadata } from './site-metadata';

// La muestra estática no necesita el proveedor de reservas ni el panel de demostración.
export default function ShowcaseLayout({ children }: { children: ReactNode }) {
  return <html lang="es"><body>{children}</body></html>;
}
