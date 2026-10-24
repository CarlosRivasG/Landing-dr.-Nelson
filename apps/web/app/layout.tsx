import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import './landing.css';
import './demo/demo.css';
import { DemoProvider } from './demo/demo-provider';

export const metadata: Metadata = {
  title: 'SmileCorp / Dr. Nelson — Una sonrisa que se sienta tuya. | Vista previa',
  description: 'Diseño de sonrisa, carillas, prótesis e implantes. Vista previa de SmileCorp / Dr. Nelson con reserva de demostración, sin cobros ni envíos reales.',
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body><DemoProvider>{children}</DemoProvider></body>
    </html>
  );
}
