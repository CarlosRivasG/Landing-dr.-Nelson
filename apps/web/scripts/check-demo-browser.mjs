/* global fetch, WebSocket, setTimeout, console */
// Requiere web compilada en 127.0.0.1:3100 y Chromium con CDP en 127.0.0.1:9444.
// No instala dependencias ni accede a servicios externos.
import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const origin = 'http://127.0.0.1:3100';
const pages = await (await fetch('http://127.0.0.1:9444/json')).json();
const socket = new WebSocket(pages.find(page => page.type === 'page').webSocketDebuggerUrl);
await new Promise(resolve => socket.addEventListener('open', resolve, { once: true }));
let sequence = 0;
const pending = new Map();
const errors = [];
const externalRequests = [];
socket.addEventListener('message', event => {
  const message = JSON.parse(event.data);
  if (message.method === 'Fetch.requestPaused') void send('Fetch.fulfillRequest', { requestId: message.params.requestId, responseCode: 200, responseHeaders: [{ name: 'Content-Type', value: 'text/html' }], body: Buffer.from('<!doctype html><html lang="es"><body>Mapa interceptado para prueba local.</body></html>').toString('base64') });
  if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails.text);
  if (message.method === 'Log.entryAdded' && message.params.entry.level === 'error') errors.push(`${message.params.entry.text} ${message.params.entry.url ?? ''}`);
  if (message.method === 'Network.requestWillBeSent' && /^https?:/.test(message.params.request.url) && !message.params.request.url.startsWith(origin)) externalRequests.push(message.params.request.url);
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
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
async function until(expression) {
  for (let index = 0; index < 80; index++) {
    if (await evaluate(expression)) return;
    await wait(100);
  }
  throw new Error(`Tiempo de espera agotado: ${expression}`);
}
const text = () => evaluate('document.body.innerText');
const clickButton = label => evaluate(`(() => { const b = [...document.querySelectorAll('button')].find(b => b.textContent.includes(${JSON.stringify(label)})); if (!b || b.disabled) throw new Error('Botón no disponible: '+${JSON.stringify(label)}); b.click(); })()`);
async function navigate(path) {
  await send('Page.navigate', { url: `${origin}${path}` });
  await until(`document.readyState === 'complete' && !!document.querySelector('.demo-app') && !document.body.innerText.includes('Preparando')`);
  await wait(200);
}
async function startBooking(paid = true) {
  await evaluate(`document.querySelector('input[name="horario"]:not(:disabled)').click()`);
  await clickButton('Revisar reserva');
  await until(`document.querySelector('#booking-step')?.textContent.includes('Todo claro')`);
  assert.equal(await evaluate(`document.activeElement.id`), 'booking-step');
  await evaluate(`document.querySelectorAll('input[name="modalidad"]')[${paid ? 0 : 1}].click()`);
  await evaluate(`document.querySelector('input[type="checkbox"]').click()`);
  await clickButton(paid ? 'Ir a la simulación' : 'Confirmar cita ficticia');
  await until(paid ? `!!document.querySelector('.demo-checkout')` : `!!document.querySelector('.demo-result')`);
}

try {
  await send('Page.enable'); await send('Runtime.enable'); await send('Log.enable'); await send('Network.enable');
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  // Landing: navegación real, espacios provisionales y acceso móvil sin desbordes.
  for (const width of [320, 390, 768, 1440]) {
    await send('Emulation.setDeviceMetricsOverride', { width, height: 950, deviceScaleFactor: 1, mobile: width < 768 });
    await send('Page.navigate', { url: `${origin}/` });
    await until(`document.readyState === 'complete' && !!document.querySelector('.smilecorp')`);
    const sizes = await evaluate(`({ scroll: document.documentElement.scrollWidth, h1: document.querySelectorAll('h1').length })`);
    assert.ok(sizes.scroll <= width, `Desborde landing ${width}: ${JSON.stringify(sizes)}`);
    assert.equal(sizes.h1, 1);
    assert.equal(await evaluate(`document.querySelectorAll('video,canvas,iframe').length`), 0);
    assert.equal(await evaluate(`document.querySelectorAll('.smilecorp img').length`), 8);
    assert.equal(await evaluate(`document.querySelectorAll('.sc-case-pair img').length`), 2);
    assert.equal(await evaluate(`[...document.querySelectorAll('.sc-case-pair img')].every(img => getComputedStyle(img).objectFit === 'contain')`), true);
    const imageCount = await evaluate(`document.images.length`);
    for (let index = 0; index < imageCount; index++) {
      if (!await evaluate(`document.images[${index}].getClientRects().length > 0`)) continue;
      await evaluate(`document.images[${index}].scrollIntoView({ block: 'center' })`);
      await until(`document.images[${index}].complete && document.images[${index}].naturalWidth > 0`);
    }
    assert.equal(await evaluate(`[...document.images].every(img => /(?:logo-dr-nelson|dr-nelson-profesional|caso-2-2-antes|caso-2-2-despues|sonrisa-smilecorp|trabajo-smilecorp)\\.webp/.test(img.currentSrc || img.src))`), true);
    assert.equal(await evaluate(`document.querySelector('.sc-doctor-photo-frame img').getBoundingClientRect().width <= 320`), true);
    assert.equal(await evaluate(`[...document.querySelectorAll('.sc-case-pair img')].map(img => img.naturalWidth).join(',')`), '743,836');
    await evaluate('scrollTo(0,0)');
    assert.match(await text(), /Dr\. Nelson/);
    assert.match(await text(), /Imágenes utilizadas con autorización/);
    assert.match(await text(), /no garantizan el mismo resultado/);
    await evaluate(`document.querySelector('.sc-faq-items summary').click()`);
    assert.equal(await evaluate(`document.querySelector('.sc-faq-items details').open`), true);
    if (width < 981) {
      await evaluate(`document.querySelector('.sc-mobile-menu summary').click()`);
      assert.equal(await evaluate(`document.querySelector('.sc-mobile-menu').open`), true);
      await evaluate(`document.querySelector('.sc-mobile-menu a[href="#tratamientos"]').click()`);
      assert.equal(await evaluate(`document.querySelector('.sc-mobile-menu').open`), false);
      assert.equal(await evaluate(`location.hash`), '#tratamientos');
      await evaluate(`document.querySelector('.sc-mobile-menu summary').click(); document.querySelector('.sc-mobile-menu summary').focus()`);
      await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
      assert.equal(await evaluate(`document.querySelector('.sc-mobile-menu').open`), false);
    }
    assert.equal(await evaluate(`document.querySelector('.sc-actions a[href^="https://wa.me"]').href`), 'https://wa.me/56933170550');
    assert.equal(await evaluate(`document.querySelectorAll('a[href="https://www.instagram.com/dr.nelson___/"]').length`), 2);
    assert.equal(await evaluate(`document.querySelectorAll('.sc-location-map iframe').length`), 0);
    assert.match(await text(), /La Concepción 81, Providencia, Región Metropolitana/);
    await evaluate(`location.hash = '#contacto'`);
    assert.equal(await evaluate(`document.querySelectorAll('a[href*="wa.me"]').length`), 2);
    await evaluate('scrollTo(0,0)');
    const metrics = await send('Page.getLayoutMetrics');
    const screenshot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { x: 0, y: 0, width, height: metrics.cssContentSize.height, scale: 1 } });
    writeFileSync(join(tmpdir(), `smilecorp-landing-${width}.png`), Buffer.from(screenshot.data, 'base64'));
  }
  // Texto ampliado sin scroll horizontal; no sustituye una prueba con lector de pantalla.
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  await evaluate(`(() => { const items = [...document.querySelectorAll('.smilecorp h1,.smilecorp h2,.smilecorp h3,.smilecorp p,.smilecorp a,.smilecorp small,.smilecorp summary,.smilecorp button')].map(el => [el, parseFloat(getComputedStyle(el).fontSize) * 2]); for (const [el, size] of items) el.style.fontSize = size + 'px'; })()`);
  assert.equal(await evaluate(`document.documentElement.scrollWidth <= innerWidth`), true);
  await evaluate(`document.querySelectorAll('.smilecorp [style]').forEach(el => el.style.fontSize = '')`);
  await evaluate(`document.querySelector('a[href*="carillas-ceramica"]').click()`);
  await until(`location.pathname === '/reservar' && !!document.querySelector('select[name="interes"]')`);
  assert.equal(await evaluate(`document.querySelector('select[name="interes"]').value`), 'carillas-ceramica');
  console.log('OK: selección de imágenes autorizadas cargada; caso antes/después completo sin recorte. Landing en 320/390/768/1440, texto ampliado al doble sin desborde, menú/anclas/FAQ, contacto configurado, mapa sin carga automática y tratamiento transferido a reserva.');
  await send('Emulation.setScriptExecutionDisabled', { value: true });
  await send('Page.navigate', { url: `${origin}/` });
  await until(`document.readyState === 'complete' && !!document.querySelector('.smilecorp')`);
  assert.match(await text(), /Agendar mi evaluación/);
  assert.equal(await evaluate(`document.querySelectorAll('.sc-faq-items details').length`), 5);
  assert.equal(await evaluate(`!!document.querySelector('.sc-actions a[href^="/reservar"]')`), true);
  await send('Emulation.setScriptExecutionDisabled', { value: false });
  console.log('OK: contenido, CTA y preguntas presentes sin JavaScript; la reserva interactiva requiere JavaScript.');

  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
  await navigate('/reservar?interes=carillas-resina');
  assert.equal(await evaluate(`document.querySelector('select[name="interes"]').value`), 'carillas-resina');
  assert.equal(await evaluate(`document.querySelectorAll('input[name="modalidad"]').length`), 0); // El resumen aún no se ha abierto.
  assert.match(await text(), /Abono pendiente de configuración/);
  assert.match(await text(), /No estás agendando una atención real/);
  assert.equal(await evaluate(`document.querySelectorAll('input[type="text"],input[type="email"],input[type="tel"]').length`), 0);
  await startBooking();
  await clickButton('Simular rechazado');
  await until(`document.body.innerText.includes('fue rechazado')`);
  await clickButton('Simular pendiente');
  await until(`document.body.innerText.includes('Todavía no hay confirmación')`);
  await clickButton('Simular aprobado');
  await until(`!!document.querySelector('.demo-result')`);
  assert.match(await text(), /Confirmada · sólo demostración/);
  await evaluate(`document.querySelector('.demo-result a[href^="/app/citas/"]').click()`);
  await until(`location.pathname.startsWith('/app/citas/') && document.body.innerText.includes('Reserva y estado')`);
  const createdPath = await evaluate('location.pathname');
  assert.match(await text(), /Aprobado · simulado/);
  assert.match(await text(), /Carillas de resina/);
  assert.equal(await evaluate(`document.querySelectorAll('button:disabled').length`), 2);
  await clickButton('Abrir solicitud de cambio');
  await until(`document.body.innerText.includes('Solicitud abierta.')`);
  await clickButton('Cerrar solicitud sin cambiar');
  await until(`document.body.innerText.includes('Solicitud cerrada sin cambio')`);
  await clickButton('Crear próxima acción');
  await until(`document.body.innerText.includes('Marcar tarea completada')`);
  await clickButton('Marcar tarea completada');
  await until(`document.body.innerText.includes('Tarea administrativa completada')`);
  await clickButton('Cancelar esta cita');
  await clickButton('Conservar cita');
  assert.match(await text(), /Confirmada/);
  await clickButton('Cancelar esta cita');
  await clickButton('Sí, cancelar cita');
  await until(`!!document.querySelector('.demo-badge-cancelada')`);
  assert.match(await text(), /Aprobado · simulado/);
  await evaluate(`document.querySelector('nav a[href="/app/agenda"]').click()`);
  await until(`location.pathname === '/app/agenda' && document.body.innerText.includes('Agenda de muestra')`);
  assert.equal(await evaluate(`document.querySelectorAll('.demo-appointment-list li').length`), 4);
  await evaluate(`document.querySelector('nav a[href="/reservar"]').click()`);
  await until(`location.pathname === '/reservar' && !!document.querySelector('.demo-result')`);
  await clickButton('Probar otra reserva');
  await until(`!!document.querySelector('input[name="horario"]')`);
  await startBooking();
  await clickButton('Simular vencimiento');
  await until(`document.body.innerText.includes('Expirada · sólo demostración')`);
  await clickButton('Probar otra reserva');
  await startBooking(false);
  assert.match(await text(), /Sin pago · demo/);
  console.log('OK: rechazado, pendiente, aprobado, expirado, sin pago, detalle, tarea, solicitud de cambio y cancelación.');
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  await navigate('/reservar');
  await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 });
  await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 });
  assert.equal(await evaluate('document.activeElement.tagName'), 'SELECT');
  assert.equal(await evaluate(`[...document.querySelectorAll('input,select')].every(input => input.labels.length > 0)`), true);
  await startBooking(false);
  assert.match(await text(), /Confirmada · sólo demostración/);
  await navigate('/app/agenda');
  await evaluate(`(() => { const select = document.querySelector('select'); select.value = 'cancelada'; select.dispatchEvent(new Event('change', { bubbles: true })); })()`);
  await until(`document.body.innerText.includes('No hay citas en esta vista.')`);
  console.log('OK: reserva móvil, foco de teclado, etiquetas de campos y filtro con estado vacío.');

  for (const path of ['/reservar', '/app/hoy', '/app/agenda', '/app/citas/muestra-01']) {
    for (const width of [320, 390, 768, 1440]) {
      await send('Emulation.setDeviceMetricsOverride', { width, height: 950, deviceScaleFactor: 1, mobile: width < 768 });
      await navigate(path);
      const sizes = await evaluate(`({ inner: innerWidth, scroll: document.documentElement.scrollWidth, h1: document.querySelectorAll('h1').length })`);
      assert.ok(sizes.scroll <= width, `Desborde ${path} ${width}: ${JSON.stringify(sizes)}`);
      assert.equal(sizes.h1, 1);
      const screenshot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });
      writeFileSync(join(tmpdir(), `nitida-demo-${path.replaceAll('/', '-')}-${width}.png`), Buffer.from(screenshot.data, 'base64'));
    }
  }
  console.log('OK: 4 rutas × 4 anchos (320, 390, 768, 1440), un h1 y sin scroll horizontal. Capturas en carpeta temporal.');
  await navigate(createdPath);
  assert.match(await text(), /No encontramos esta cita de muestra/);
  await navigate('/app/hoy');
  await clickButton('Reiniciar demo');
  await clickButton('Sí, reiniciar');
  assert.equal(await evaluate(`document.querySelectorAll('.demo-appointment-list li').length`), 2);
  console.log('OK: recuperación al recargar una cita temporal y reinicio explícito de la demo.');
  assert.deepEqual(errors, []);
  assert.deepEqual(externalRequests, []);
  console.log('OK: sin excepciones, errores de consola ni solicitudes HTTP externas antes de activar el mapa.');
  // Interceptar el proveedor: se prueba la activación sin navegar ni cargar servicios externos reales.
  await send('Fetch.enable', { patterns: [{ urlPattern: '*://maps.google.com/*', requestStage: 'Request' }] });
  await send('Page.navigate', { url: `${origin}/` });
  await until(`document.readyState === 'complete' && !!document.querySelector('.sc-location-map')`);
  assert.equal(await evaluate(`document.querySelectorAll('.sc-location-map iframe').length`), 0);
  await clickButton('Ver mapa');
  await until(`!!document.querySelector('.sc-location-map iframe')`);
  const map = await evaluate(`(() => { const frame = document.querySelector('.sc-location-map iframe'); const url = new URL(frame.src); return { host: url.hostname, address: url.searchParams.get('q'), mode: url.searchParams.get('output'), title: frame.title, width: frame.getBoundingClientRect().width }; })()`);
  assert.equal(map.host, 'maps.google.com');
  assert.equal(map.address, 'La Concepción 81, Providencia, Región Metropolitana');
  assert.equal(map.mode, 'embed');
  assert.match(map.title, /Mapa de ubicación/);
  assert.ok(map.width <= await evaluate('innerWidth'));
  await clickButton('Ocultar mapa');
  await until(`document.querySelectorAll('.sc-location-map iframe').length === 0`);
  await send('Fetch.disable');
  assert.deepEqual(errors, []);
  assert.ok(externalRequests.every(url => url.startsWith('https://maps.google.com/')));
  console.log('OK: mapa activado sólo por acción explícita y ocultable; URL y dirección correctas, proveedor interceptado localmente.');
} finally {
  socket.close();
}
