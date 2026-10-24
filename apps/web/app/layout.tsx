import type { ReactNode } from 'react';
import './globals.css';
import './landing.css';
import './demo/demo.css';
import { DemoProvider } from './demo/demo-provider';

export { metadata } from './site-metadata';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body><DemoProvider>{children}</DemoProvider></body>
    </html>
  );
}
