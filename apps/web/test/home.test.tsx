import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readdirSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import Home from '../app/page';
import BookingFlow from '../app/demo/booking-flow';
import { DemoProvider } from '../app/demo/demo-provider';
import SmileVideo from '../app/components/smile-video';
import { bookingHref, depositConfiguration, getMapLinks, parseTreatmentInterest, siteConfig, treatmentInterests, whatsappHref } from '../app/site-config';

const markup = () => renderToStaticMarkup(<Home />);

test('SmileCorp / Dr. Nelson: un título, orientación a evaluación y límites honestos', () => {
  const html = markup();
  assert.equal((html.match(/<h1[\s>]/g) ?? []).length, 1);
  assert.match(html, /Una sonrisa/);
  assert.match(html, /que se sienta/);
  assert.match(html, /SmileCorp/);
  assert.match(html, /Dr\. Nelson/);
  assert.doesNotMatch(html, /Nítida|alba/i);
  assert.match(html, /Agendar mi evaluación/);
  assert.match(html, /Reservas de demostración, sin cobros ni envíos reales/);
  assert.doesNotMatch(html, /<form|<input|<iframe|<script[^>]*src="https?:/);
});

test('navegación con destinos existentes y tratamientos conectados a la misma reserva', () => {
  const html = markup();
  const ids = new Set(Array.from(html.matchAll(/\sid="([^"]+)"/g), match => match[1]));
  const links = Array.from(html.matchAll(/<a\b[^>]*\shref="([^"]+)"/g), match => match[1]);
  assert.ok(links.length > 0);
  for (const link of links) {
    assert.ok(typeof link === 'string');
    if (link.startsWith('#')) assert.ok(ids.has(link.slice(1)), `Destino inexistente: ${link}`);
    else assert.ok(link === '/app/hoy' || treatmentInterests.some(item => link === bookingHref(item.id)) || [siteConfig.instagramUrl, whatsappHref(siteConfig.whatsappNumber), getMapLinks(siteConfig.location!).search].includes(link.replaceAll('&amp;', '&')), `Ruta no prevista: ${link}`);
  }
  assert.match(html, /Saltar al contenido/);
  assert.match(html, /Navegación móvil/);
  assert.match(html, /Acceso rápido a evaluación/);
  assert.equal((html.match(/<details/g) ?? []).length, 6);
  for (const interest of treatmentInterests.slice(0, 5)) assert.ok(html.includes(bookingHref(interest.id)));
});

test('selección autorizada integrada sin inventar tratamientos ni alterar las imágenes del caso', () => {
  const html = markup();
  const images = html.match(/<img\b[^>]*>/g) ?? [];
  assert.equal(images.length, 8);
  for (const image of images) {
    assert.match(image, /(?:logo-dr-nelson|dr-nelson-profesional|caso-2-2-antes|caso-2-2-despues|sonrisa-smilecorp|trabajo-smilecorp)\.webp/);
    assert.match(image, /width="\d+"/);
    assert.match(image, /height="\d+"/);
  }
  assert.deepEqual(readdirSync(new URL('../public/images/smilecorp/', import.meta.url)).sort(), ['caso-2-2-antes.webp', 'caso-2-2-despues.webp', 'dr-nelson-profesional.webp', 'logo-dr-nelson.webp', 'sonrisa-smilecorp.webp', 'trabajo-smilecorp.webp']);
  const caseImages = images.filter(image => image.includes('caso-2-2-'));
  assert.equal(caseImages.length, 2);
  assert.match(caseImages[0]!, /width="743" height="369"/);
  assert.match(caseImages[1]!, /width="836" height="314"/);
  assert.ok(caseImages.every(image => !image.includes('/_next/image'))); // Sin recompresión con pérdida del caso.
  assert.doesNotMatch(html, /<video|<canvas|Captura|sonrisa-hombre|sonrisa-mujer|dental-chair/);
  assert.match(html, /alt="Retrato del Dr\. Nelson con uniforme clínico negro"/);
  assert.match(images.find(image => image.includes('dr-nelson-profesional'))!, /width="768" height="1152"/);
  assert.doesNotMatch(html, /(?:%2F|\/)dr-nelson\.webp/);
  assert.match(html, /Imágenes utilizadas con autorización/);
  assert.match(html, /sin retoques ni cambios en los resultados/);
  assert.match(html, /Antes y después/);
  assert.match(html, /No representa un resultado garantizado/);
  assert.doesNotMatch(html, /Selección y autorización pendientes|Espacio reservado para un caso autorizado/);
  assert.match(html, /no garantizan el mismo resultado/);
  assert.match(html, /formación verificable/);
  assert.doesNotMatch(html, /Retrato profesional original|Fotografía o video original de SmileCorp pendiente/);
  assert.doesNotMatch(html, /últimos cupos|descuento|sin reembolso|100%|resultados garantizados|pacientes satisfechos/i);
});

test('contactos proporcionados, mapa bajo demanda y abono aún pendiente', () => {
  const html = markup();
  assert.equal(siteConfig.whatsappNumber, '56933170550');
  assert.equal(siteConfig.instagramUrl, 'https://www.instagram.com/dr.nelson___/');
  assert.equal(siteConfig.location, 'La Concepción 81, Providencia, Región Metropolitana');
  assert.equal(depositConfiguration.amount, null);
  assert.equal(depositConfiguration.status, 'pending');
  assert.equal((html.match(/href="https:\/\/wa.me\/56933170550"/g) ?? []).length, 2);
  const instagram = html.match(/<a\b[^>]*href="https:\/\/www.instagram.com\/dr.nelson___\/"[^>]*>/g) ?? [];
  assert.equal(instagram.length, 2);
  assert.ok(instagram.every(link => link.includes('target="_blank"') && link.includes('rel="noopener noreferrer"') && link.includes('pestaña nueva')));
  assert.match(html, /La Concepción 81, Providencia, Región Metropolitana/);
  assert.match(html, /Ver mapa/);
  assert.match(html, /Cómo llegar/);
  assert.match(html, /servicio externo/);
  assert.doesNotMatch(html, /<iframe|output=embed|connect.facebook|WhatsApp no disponible|Dirección del consultorio pendiente/);
  assert.match(html, /Abono pendiente de configuración/);
  assert.doesNotMatch(html, /tel:|mailto:|\$|15\.000|25%/);
});

test('configuración pública valida el número y normaliza intereses desconocidos o repetidos', () => {
  assert.equal(whatsappHref(null), null);
  assert.equal(whatsappHref('javascript:alert(1)'), null);
  assert.equal(whatsappHref('+00-no-validado'), null);
  assert.equal(whatsappHref('12345678901'), 'https://wa.me/12345678901');
  for (const interest of treatmentInterests) assert.equal(parseTreatmentInterest(interest.id), interest.id);
  assert.equal(parseTreatmentInterest('<script>'), 'por-definir');
  assert.equal(parseTreatmentInterest(['implantes', 'protesis']), 'por-definir');
});

test('la reserva reutilizada identifica abono pendiente, sin pedir datos reales', () => {
  const html = renderToStaticMarkup(<DemoProvider><BookingFlow initialInterest="carillas-resina" /></DemoProvider>);
  assert.match(html, /No estás agendando una atención real/);
  assert.match(html, /Preparando horarios de demostración/);
  assert.doesNotMatch(html, /type="email"|type="tel"|type="text"|<iframe/);
  assert.match(html, /SmileCorp/);
});

test('el reproductor previo conserva carga por acción explícita aunque ya no se use en la landing', () => {
  const html = renderToStaticMarkup(<SmileVideo src="/videos/sonrisa-hombre.mp4" poster="/images/sonrisa-hombre.webp" description="Sonrisa de referencia de banco" credit="alona2018" duration="6 s" />);
  const video = html.match(/<video\b[^>]*>/)![0];
  assert.match(video, /preload="none"/);
  assert.match(video, /muted=""/);
  assert.match(video, /playsInline=""/i);
  assert.doesNotMatch(video, /\ssrc=|autoplay|\sloop\b/i);
});
