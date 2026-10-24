import assert from 'node:assert/strict';
import { test } from 'node:test';
import { renderToStaticMarkup } from 'react-dom/server';

test('la muestra de GitHub Pages conserva la landing y usa sólo anclas, contactos y recursos bajo su basePath', async () => {
  const originalMode = process.env.NEXT_PUBLIC_STATIC_SHOWCASE;
  const originalBase = process.env.NEXT_PUBLIC_BASE_PATH;
  process.env.NEXT_PUBLIC_STATIC_SHOWCASE = 'true';
  process.env.NEXT_PUBLIC_BASE_PATH = '/demo-pages';
  try {
    const { default: Home } = await import('../app/page');
    const { bookingHref, publicAsset } = await import('../app/site-config');
    const html = renderToStaticMarkup(<Home />);
    assert.equal(bookingHref('carillas-resina'), '#reserva');
    assert.equal(publicAsset('/images/example.webp'), '/demo-pages/images/example.webp');
    assert.match(html, /Muestra visual · Sin reservas, pagos ni captura de datos/);
    assert.match(html, /No incluye calendario ni crea citas/);
    assert.match(html, /Ver canales de contacto/);
    assert.doesNotMatch(html, /Panel de demostración|<form|<iframe|\/api\/v1/);
    assert.equal((html.match(/<h1[\s>]/g) ?? []).length, 1);
    assert.equal((html.match(/<img\b/g) ?? []).length, 8);
    assert.match(html, /\/demo-pages\/images\/smilecorp\/caso-2-2-antes.webp/);
    assert.match(html, /\/demo-pages\/images\/smilecorp\/caso-2-2-despues.webp/);
    const anchors = [...html.matchAll(/<a\b[^>]*\shref="([^"]+)"/g)].map(match => match[1]!);
    const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map(match => match[1]));
    for (const href of anchors) {
      if (href.startsWith('#')) assert.ok(ids.has(href.slice(1)), `Ancla inexistente: ${href}`);
      else assert.ok(/^https:\/\/(wa.me|www.instagram.com|www.google.com)\//.test(href), `Enlace no estático: ${href}`);
    }
  } finally {
    if (originalMode === undefined) delete process.env.NEXT_PUBLIC_STATIC_SHOWCASE;
    else process.env.NEXT_PUBLIC_STATIC_SHOWCASE = originalMode;
    if (originalBase === undefined) delete process.env.NEXT_PUBLIC_BASE_PATH;
    else process.env.NEXT_PUBLIC_BASE_PATH = originalBase;
  }
});
