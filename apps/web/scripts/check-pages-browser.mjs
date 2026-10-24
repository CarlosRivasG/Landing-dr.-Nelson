/* global fetch, WebSocket, setTimeout, console */
// Servir out como archivos estáticos en 3300 bajo /smilecorp-demo; Chrome CDP en 9444.
import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const origin = 'http://127.0.0.1:3300';
const base = '/smilecorp-demo/';
const pages = await (await fetch('http://127.0.0.1:9444/json')).json();
const socket = new WebSocket(pages.find(page => page.type === 'page').webSocketDebuggerUrl);
await new Promise(resolve => socket.addEventListener('open', resolve, { once: true }));
let sequence = 0;
const pending = new Map();
const errors = [];
const external = [];
const missing = [];
socket.addEventListener('message', event => {
  const message = JSON.parse(event.data);
  if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails.text);
  if (message.method === 'Log.entryAdded' && message.params.entry.level === 'error') errors.push(message.params.entry.text);
  if (message.method === 'Network.responseReceived' && message.params.response.status >= 400) missing.push(message.params.response.url);
  if (message.method === 'Network.requestWillBeSent' && /^https?:/.test(message.params.request.url) && !message.params.request.url.startsWith(origin)) external.push(message.params.request.url);
  if (message.method === 'Fetch.requestPaused') void send('Fetch.fulfillRequest', { requestId: message.params.requestId, responseCode: 200, responseHeaders: [{ name: 'Content-Type', value: 'text/html' }], body: Buffer.from('<html><body>Proveedor interceptado para prueba local.</body></html>').toString('base64') });
  if (!message.id) return;
  const task = pending.get(message.id);
  pending.delete(message.id);
  if (message.error) task.reject(message.error); else task.resolve(message.result);
});
const send = (method, params = {}) => new Promise((resolve, reject) => {
  const id = ++sequence;
  pending.set(id, { resolve, reject });
  socket.send(JSON.stringify({ id, method, params }));
});
const evaluate = async expression => {
  const response = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (response.exceptionDetails) throw new Error(JSON.stringify(response.exceptionDetails));
  return response.result.value;
};
async function until(expression) {
  for (let index = 0; index < 100; index++) {
    if (await evaluate(expression)) return;
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw new Error(`Espera agotada: ${expression}`);
}
try {
  for (const domain of ['Page', 'Runtime', 'Log', 'Network']) await send(`${domain}.enable`);
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  for (const width of [320, 390, 768, 1440]) {
    await send('Emulation.setDeviceMetricsOverride', { width, height: 950, deviceScaleFactor: 1, mobile: width < 768 });
    await send('Page.navigate', { url: `${origin}${base}` });
    await until(`document.readyState === 'complete' && !!document.querySelector('.smilecorp')`);
    assert.equal(await evaluate('document.documentElement.scrollWidth <= innerWidth'), true);
    assert.equal(await evaluate(`document.querySelectorAll('h1').length`), 1);
    assert.match(await evaluate('document.body.innerText'), /Muestra visual · Sin reservas, pagos ni captura de datos/);
    assert.equal(await evaluate(`[...document.querySelectorAll('a')].filter(a => a.origin === location.origin).every(a => a.pathname === '${base}' && !!a.hash)`), true);
    assert.equal(await evaluate(`document.querySelectorAll('form,input,iframe,canvas').length`), 0);
    const count = await evaluate('document.images.length');
    assert.equal(count, 8);
    for (let i = 0; i < count; i++) {
      if (!await evaluate(`document.images[${i}].getClientRects().length > 0`)) continue;
      await evaluate(`document.images[${i}].scrollIntoView({ block: 'center' })`);
      await until(`document.images[${i}].complete && document.images[${i}].naturalWidth > 0`);
    }
    assert.equal(await evaluate(`[...document.images].every(img => (img.currentSrc || img.src).startsWith(location.origin + '${base}images/'))`), true);
    await evaluate(`document.querySelector('.sc-actions a[href="#reserva"]').click()`);
    await until(`location.hash === '#reserva'`);
    assert.match(await evaluate(`document.querySelector('#reserva').innerText`), /No incluye calendario ni crea citas/);
    await evaluate(`document.querySelector('.sc-faq-items summary').click()`);
    assert.equal(await evaluate(`document.querySelector('.sc-faq-items details').open`), true);
    if (width <= 980) {
      await evaluate(`document.querySelector('.sc-mobile-menu summary').click(); document.querySelector('.sc-mobile-menu a[href="#casos"]').click()`);
      assert.equal(await evaluate(`document.querySelector('.sc-mobile-menu').open`), false);
    }
    await evaluate('scrollTo(0,0)');
    const metrics = await send('Page.getLayoutMetrics');
    const screenshot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { x: 0, y: 0, width, height: metrics.cssContentSize.height, scale: 1 } });
    writeFileSync(join(tmpdir(), `smilecorp-pages-${width}.png`), Buffer.from(screenshot.data, 'base64'));
  }
  assert.deepEqual(external, []);
  await send('Fetch.enable', { patterns: [{ urlPattern: '*://maps.google.com/*', requestStage: 'Request' }] });
  await evaluate(`document.querySelector('.sc-map-preview button').click()`);
  await until(`!!document.querySelector('.sc-location-map iframe')`);
  assert.equal(await evaluate(`new URL(document.querySelector('iframe').src).searchParams.get('q')`), 'La Concepción 81, Providencia, Región Metropolitana');
  await evaluate(`document.querySelector('.sc-map-actions button').click()`);
  await until(`document.querySelectorAll('iframe').length === 0`);
  assert.ok(external.every(url => url.startsWith('https://maps.google.com/')));
  assert.deepEqual(missing, []);
  assert.deepEqual(errors, []);
  console.log('OK: HTML estático real bajo /smilecorp-demo, 320/390/768/1440, imágenes/CSS/JS sin 404, hidratación y navegación por anclas, FAQ, menú y mapa por acción explícita (proveedor interceptado). Sin API ni rutas dinámicas.');
} finally {
  socket.close();
}
