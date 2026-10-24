import assert from 'node:assert/strict';
import { test } from 'node:test';
import { canMarkAttendance, clinicDate, contacts, createBooking, dateChoices, demoRules, expireHolds, isSlotFree, makeFixtures, simulatePayment, slotInstant, slotsForDay, updateAppointment } from '../app/demo/model';

const now = new Date('2026-10-19T12:00:00Z');
const slot = slotInstant('2026-10-21', 10);
const booking = () => createBooking([], contacts[0], slot, true, now, 'prueba-01');

test('horarios de muestra: días hábiles, anticipación de 24 h y límite de 30 días', () => {
  const dates = dateChoices(now);
  assert.ok(dates.length > 0);
  assert.ok(dates.every(day => ![0, 6].includes(new Date(`${day}T12:00:00Z`).getUTCDay())));
  assert.deepEqual(slotsForDay('2026-10-24', now), []);
  assert.deepEqual(slotsForDay('2026-12-01', now), []);
  assert.ok(slotsForDay(dates[0]!, now).every(time => Date.parse(time) >= now.getTime() + 24 * 3600000));
  assert.ok(dates.every(day => day <= '2026-11-18'));
});

test('la conversión de hora civil respeta la zona de Santiago en verano e invierno', () => {
  for (const day of ['2026-01-20', '2026-07-20', '2026-09-07']) {
    const instant = slotInstant(day, 10);
    assert.equal(clinicDate(new Date(instant)), day);
    assert.equal(new Intl.DateTimeFormat('en-GB', { timeZone: demoRules.timeZone, hour: '2-digit', hourCycle: 'h23' }).format(new Date(instant)), '10');
  }
  assert.notEqual(slotInstant('2026-01-20', 10).slice(11, 13), slotInstant('2026-07-20', 10).slice(11, 13));
});

test('la reserva sólo acepta personas ficticias y disponibilidad publicada', () => {
  assert.throws(() => createBooking([], 'Nombre externo', slot, true, now, 'x'), /ficticia/);
  assert.throws(() => createBooking([], contacts[0], slotInstant('2026-10-21', 3), true, now, 'x'), /disponibilidad/);
  const item = booking();
  assert.equal(item.status, 'pendiente_de_pago');
  assert.equal(item.amount, demoRules.simulatedAmount);
  assert.equal(Date.parse(item.holdUntil!) - now.getTime(), 10 * 60000);
  assert.match(item.history[0]!.text, /hipotesis-0.1/);
});

test('el interés de tratamiento se conserva en reserva, pago e historial administrativo', () => {
  const item = createBooking([], contacts[0], slot, true, now, 'interes', 'carillas-resina');
  assert.equal(item.treatmentInterest, 'carillas-resina');
  const approved = simulatePayment(item, 'aprobado', now);
  assert.equal(approved.treatmentInterest, 'carillas-resina');
  assert.equal(updateAppointment(approved, 'solicitar_cambio', now).treatmentInterest, 'carillas-resina');
  assert.equal(booking().treatmentInterest, 'por-definir');
});

test('una segunda reserva del mismo bloque se rechaza y el buffer impide superposición', () => {
  const item = booking();
  assert.throws(() => createBooking([item], contacts[1], slot, false, now, 'segunda'), /disponible/);
  assert.equal(isSlotFree([item], new Date(Date.parse(slot) + 30 * 60000).toISOString(), now), false);
  assert.equal(isSlotFree([item], new Date(Date.parse(slot) + 60 * 60000).toISOString(), now), true);
});

test('modo sin pago confirma sin crear importe ni checkout', () => {
  const item = createBooking([], contacts[0], slot, false, now, 'sin-pago');
  assert.equal(item.status, 'confirmada');
  assert.equal(item.payment, 'sin_pago');
  assert.equal(item.amount, 0);
  assert.equal(item.holdUntil, undefined);
  assert.throws(() => simulatePayment(item, 'aprobado', now), /no admite/);
});

test('sólo aprobación simulada confirma, rechazado permite reintento y pendiente no confirma', () => {
  const rejected = simulatePayment(booking(), 'rechazado', now);
  assert.equal(rejected.status, 'pendiente_de_pago');
  assert.equal(rejected.payment, 'rechazado');
  const pending = simulatePayment(rejected, 'pendiente', now);
  assert.equal(pending.status, 'pendiente_de_pago');
  const approved = simulatePayment(pending, 'aprobado', now);
  assert.equal(approved.status, 'confirmada');
  assert.equal(approved.payment, 'aprobado');
  assert.throws(() => simulatePayment(approved, 'aprobado', now), /no admite/);
  assert.equal(approved.history.length, 4);
});

test('vencimiento exacto libera el horario y una aprobación tardía no confirma', () => {
  const item = booking();
  const deadline = new Date(item.holdUntil!);
  assert.equal(isSlotFree([item], slot, deadline), true);
  assert.equal(simulatePayment(item, 'aprobado', deadline).status, 'expirada');
  const expired = expireHolds([item], deadline);
  assert.equal(expired[0]!.payment, 'vencido');
  assert.equal(expireHolds(expired, deadline)[0]!.history.length, expired[0]!.history.length);
  assert.equal(simulatePayment(item, 'expirado', now).status, 'expirada');
});

test('cancelar conserva pago e historial, libera bloque y exige estado válido', () => {
  const approved = simulatePayment(booking(), 'aprobado', now);
  const canceled = updateAppointment(approved, 'cancelar', now);
  assert.equal(canceled.status, 'cancelada');
  assert.equal(canceled.payment, 'aprobado');
  assert.equal(isSlotFree([canceled], slot, now), true);
  assert.ok(canceled.history.length > approved.history.length);
  assert.throws(() => updateAppointment(canceled, 'cancelar', now), /cancelar/);
});

test('solicitar cambio mantiene horario ocupado y no duplica solicitudes', () => {
  const item = simulatePayment(booking(), 'aprobado', now);
  const request = updateAppointment(item, 'solicitar_cambio', now);
  assert.equal(request.changeRequested, true);
  assert.equal(request.startsAt, slot);
  assert.equal(isSlotFree([request], slot, now), false);
  assert.throws(() => updateAppointment(request, 'solicitar_cambio', now), /otra solicitud/);
  assert.equal(updateAppointment(request, 'resolver_cambio', now).changeRequested, false);
});

test('no se marca asistencia antes del fin ni se repite un resultado terminal', () => {
  const item = simulatePayment(booking(), 'aprobado', now);
  assert.equal(canMarkAttendance(item, now), false);
  assert.throws(() => updateAppointment(item, 'no_asistio', now), /terminar/);
  const end = new Date(Date.parse(slot) + 45 * 60000);
  const attended = updateAppointment(item, 'asistio', end);
  assert.equal(attended.status, 'asistio');
  assert.throws(() => updateAppointment(attended, 'no_asistio', end), /terminar/);
  assert.equal(updateAppointment(item, 'no_asistio', end).status, 'no_asistio');
});

test('la tarea vence el siguiente día hábil, no se duplica y se puede completar', () => {
  const friday = new Date('2026-10-23T15:00:00Z');
  const item = updateAppointment(booking(), 'crear_tarea', friday);
  assert.equal(item.followUp!.due, '2026-10-26');
  assert.throws(() => updateAppointment(item, 'crear_tarea', friday), /tarea abierta/);
  const done = updateAppointment(item, 'completar_tarea', friday);
  assert.equal(done.followUp!.done, true);
  assert.throws(() => updateAppointment(done, 'completar_tarea', friday), /pendiente/);
});

test('las citas iniciales se identifican como ficticias y no contienen datos de contacto', () => {
  const fixtures = makeFixtures(now);
  assert.equal(fixtures.length, 3);
  assert.ok(fixtures.every(a => contacts.some(c => c === a.contact)));
  assert.doesNotMatch(JSON.stringify(fixtures), /@|teléfono|diagnóstico/);
});
