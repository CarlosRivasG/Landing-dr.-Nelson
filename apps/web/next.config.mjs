/* global process */
const pages = process.env.GITHUB_PAGES === 'true';
const basePath = pages ? (process.env.NEXT_PUBLIC_BASE_PATH ?? '') : '';
if (basePath && (!/^\/[A-Za-z0-9._-]+$/.test(basePath) || basePath.includes('..'))) {
  throw new Error('NEXT_PUBLIC_BASE_PATH debe ser vacío o /nombre-del-repositorio.');
}

/** @type {import('next').NextConfig} */
const config = {
  env: {
    NEXT_PUBLIC_STATIC_SHOWCASE: String(pages),
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  ...(pages ? {
    output: 'export',
    basePath,
    trailingSlash: true,
    images: { unoptimized: true },
    // Sólo la portada estática. Las rutas de reserva/panel normales no se exportan.
    pageExtensions: ['github.tsx', 'github.ts'],
  } : {}),
};

export default config;
