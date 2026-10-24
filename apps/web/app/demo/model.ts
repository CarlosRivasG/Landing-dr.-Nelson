import { parseTreatmentInterest, type TreatmentInterest } from '../site-config';

// Reglas provisionales de docs/SRS.md. Sólo datos sintéticos, sin API ni cobros.
export const demoRules = {
  durationMinutes: 45,
  bufferMinutes: 15,
  minimumNoticeHours: 24,
  maximumDays: 30,
  holdMinutes: 10,
  rescheduleNoticeHours: 24,
  timeZone: 'America/Santiago',
  currency: 'CLP',
  simulatedAmount: 15000,
  policyVersion: 'hipotesis-0.1',
} as const;

export const contacts = ['Persona de muestra A', 'Persona de muestra B', 'Persona de muestra C'] as const;
export type AppointmentStatus = 'pendiente_de_pago' | 'confirmada' | 'asistio' | 'no_asistio' | 'cancelada' | 'expirada';
export type PaymentStatus = 'sin_pago' | 'creado' | 'pendiente' | 'aprobado' | 'rechazado' | 'vencido';
export type Simulation = 'aprobado' | 'rechazado' | 'pendiente' | 'expirado';
export type FollowUp = { action: string; due: string; done: boolean };
export type HistoryEntry = { at: string; text: string };
export type Appointment = {
  id: string;
  contact: string;
  treatmentInterest?: TreatmentInterest;
  startsAt: string;
  status: AppointmentStatus;
  payment: PaymentStatus;
  amount: number;
  holdUntil?: string;
  changeRequested: boolean;
  followUp?: FollowUp;
  history: HistoryEntry[];
};
export const statusLabels: Record<AppointmentStatus, string> = {
  pendiente_de_pago: 'Pendiente de pago', confirmada: 'Confirmada', asistio: 'Asistió',
  no_asistio: 'No asistió', cancelada: 'Cancelada', expirada: 'Expirada',
};
export const paymentLabels: Record<PaymentStatus, string> = {
  sin_pago: 'Sin pago · demo', creado: 'Checkout creado', pendiente: 'Pago pendiente',
  aprobado: 'Aprobado · simulado', rechazado: 'Rechazado · simulado', vencido: 'Vencido · simulado',
};

export function clinicDate(date: Date): string {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: demoRules.timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(date);
  const part = (name: string) => parts.find(p => p.type === name)?.value;
  return `${part('year')}-${part('month')}-${part('day')}`;
}

// Convierte hora civil del consultorio a UTC, contemplando horario de verano.
export function slotInstant(day: string, hour: number): string {
  const target = Date.parse(`${day}T${String(hour).padStart(2, '0')}:00:00Z`);
  let candidate = target;
  for (let i = 0; i < 3; i++) {
    const parts = new Intl.DateTimeFormat('en-CA', { timeZone: demoRules.timeZone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' }).formatToParts(new Date(candidate));
    const value = (type: string) => parts.find(p => p.type === type)?.value;
    const represented = Date.parse(`${value('year')}-${value('month')}-${value('day')}T${value('hour')}:${value('minute')}:${value('second')}Z`);
    candidate += target - represented;
  }
  return new Date(candidate).toISOString();
}

export function displayDate(instant: string, includeDay = true): string {
  return new Intl.DateTimeFormat('es-CL', {
    timeZone: demoRules.timeZone, ...(includeDay ? { weekday: 'short', day: 'numeric', month: 'short' } as const : {}),
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).format(new Date(instant));
}
export function money(amount: number): string {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: demoRules.currency, maximumFractionDigits: 0 }).format(amount);
}

export function dateChoices(now: Date): string[] {
  const today = clinicDate(now);
  const start = Date.parse(`${today}T12:00:00Z`);
  return Array.from({ length: demoRules.maximumDays }, (_, index) => new Date(start + (index + 1) * 86400000).toISOString().slice(0, 10))
    .filter(day => ![0, 6].includes(new Date(`${day}T12:00:00Z`).getUTCDay()));
}
export function slotsForDay(day: string, now: Date): string[] {
  if (!dateChoices(now).includes(day)) return [];
  return [9, 10, 11, 14, 15, 16].map(hour => slotInstant(day, hour))
    .filter(slot => Date.parse(slot) >= now.getTime() + demoRules.minimumNoticeHours * 3600000);
}
export function isOccupied(appointment: Appointment, now: Date): boolean {
  if (appointment.status === 'confirmada') return true;
  return appointment.status === 'pendiente_de_pago' && !!appointment.holdUntil && Date.parse(appointment.holdUntil) > now.getTime();
}
export function isSlotFree(appointments: Appointment[], slot: string, now: Date): boolean {
  const separation = (demoRules.durationMinutes + demoRules.bufferMinutes) * 60000;
  return !appointments.some(a => isOccupied(a, now) && Math.abs(Date.parse(a.startsAt) - Date.parse(slot)) < separation);
}
export function canMarkAttendance(appointment: Appointment, now: Date): boolean {
  return appointment.status === 'confirmada' && now.getTime() >= Date.parse(appointment.startsAt) + demoRules.durationMinutes * 60000;
}
function event(now: Date, text: string): HistoryEntry { return { at: now.toISOString(), text }; }

export function createBooking(appointments: Appointment[], contact: string, slot: string, paid: boolean, now: Date, id: string, interest: TreatmentInterest = 'por-definir'): Appointment {
  if (!contacts.some(c => c === contact)) throw new Error('Selecciona una persona ficticia de la lista.');
  if (!slotsForDay(clinicDate(new Date(slot)), now).includes(slot)) throw new Error('Ese horario está fuera de la disponibilidad de muestra.');
  if (!isSlotFree(appointments, slot, now)) throw new Error('Ese horario ya no está disponible. Elige otro.');
  return {
    id, contact, treatmentInterest: parseTreatmentInterest(interest), startsAt: slot, status: paid ? 'pendiente_de_pago' : 'confirmada',
    payment: paid ? 'creado' : 'sin_pago', amount: paid ? demoRules.simulatedAmount : 0,
    ...(paid ? { holdUntil: new Date(now.getTime() + demoRules.holdMinutes * 60000).toISOString() } : {}),
    changeRequested: false,
    history: [event(now, `Reserva de demostración creada · política ${demoRules.policyVersion}. ${paid ? 'Horario retenido durante 10 minutos.' : 'Modo sin pago.'}`)],
  };
}

export function simulatePayment(appointment: Appointment, outcome: Simulation, now: Date): Appointment {
  if (appointment.status !== 'pendiente_de_pago') throw new Error('Esta reserva ya no admite un resultado de checkout.');
  const expired = outcome === 'expirado' || !appointment.holdUntil || Date.parse(appointment.holdUntil) <= now.getTime();
  if (expired) return { ...appointment, status: 'expirada', payment: 'vencido', history: [...appointment.history, event(now, 'Retención vencida. Horario liberado; no hubo cobro.')] };
  const status = outcome === 'aprobado' ? 'confirmada' : 'pendiente_de_pago';
  const payment = outcome;
  return { ...appointment, status, payment, history: [...appointment.history, event(now, `Resultado de pago ${outcome} simulado. Sin movimiento de dinero.`)] };
}
export function expireHolds(appointments: Appointment[], now: Date): Appointment[] {
  return appointments.map(a => a.status === 'pendiente_de_pago' && a.holdUntil && Date.parse(a.holdUntil) <= now.getTime() ? simulatePayment(a, 'expirado', now) : a);
}
export type AppointmentAction = 'asistio' | 'no_asistio' | 'cancelar' | 'solicitar_cambio' | 'resolver_cambio' | 'crear_tarea' | 'completar_tarea';
export function updateAppointment(appointment: Appointment, action: AppointmentAction, now: Date): Appointment {
  const next = { ...appointment, history: [...appointment.history] };
  let text: string;
  switch (action) {
    case 'asistio': case 'no_asistio':
      if (!canMarkAttendance(appointment, now)) throw new Error('La asistencia se registra al terminar una cita confirmada.');
      next.status = action; text = `Resultado registrado: ${statusLabels[action]}.`; break;
    case 'cancelar':
      if (!['confirmada', 'pendiente_de_pago'].includes(appointment.status)) throw new Error('No es posible cancelar este estado.');
      next.status = 'cancelada'; next.changeRequested = false;
      text = 'Cancelación de muestra confirmada por el equipo. Horario liberado. Cualquier devolución requiere revisión; no se ejecutó ninguna.'; break;
    case 'solicitar_cambio':
      if (appointment.status !== 'confirmada' || appointment.changeRequested) throw new Error('No es posible abrir otra solicitud de cambio.');
      next.changeRequested = true; text = 'Solicitud de cambio abierta. Se conserva el horario original hasta que se acuerde otro.'; break;
    case 'resolver_cambio':
      if (!appointment.changeRequested) throw new Error('No hay una solicitud abierta.');
      next.changeRequested = false; text = 'Solicitud cerrada sin cambio de horario. La reprogramación efectiva se implementará en la fase funcional.'; break;
    case 'crear_tarea': {
      if (appointment.followUp && !appointment.followUp.done) throw new Error('Ya existe una tarea abierta.');
      const due = new Date(now); due.setUTCDate(due.getUTCDate() + 1);
      while ([0, 6].includes(new Date(`${clinicDate(due)}T12:00:00Z`).getUTCDay())) due.setUTCDate(due.getUTCDate() + 1);
      next.followUp = { action: 'Revisar próxima acción administrativa', due: clinicDate(due), done: false };
      text = 'Tarea de muestra creada para el equipo administrativo. Sin envío externo.'; break;
    }
    case 'completar_tarea':
      if (!appointment.followUp || appointment.followUp.done) throw new Error('No hay una tarea pendiente.');
      next.followUp = { ...appointment.followUp, done: true }; text = 'Tarea administrativa completada.'; break;
  }
  next.history.push(event(now, text));
  return next;
}

export function makeFixtures(now: Date): Appointment[] {
  const today = clinicDate(now);
  const tomorrow = dateChoices(now)[0]!;
  return [
    { id: 'muestra-01', contact: contacts[0], startsAt: slotInstant(today, 9), status: 'confirmada', payment: 'aprobado', amount: demoRules.simulatedAmount, changeRequested: false, history: [event(now, 'Cita ficticia inicial. Pago simulado; no hubo cobro.')] },
    { id: 'muestra-02', contact: contacts[1], startsAt: slotInstant(today, 14), status: 'confirmada', payment: 'sin_pago', amount: 0, changeRequested: false, followUp: { action: 'Revisar próxima acción administrativa', due: today, done: false }, history: [event(now, 'Cita ficticia inicial, modo sin pago.')] },
    { id: 'muestra-03', contact: contacts[2], startsAt: slotInstant(tomorrow, 16), status: 'confirmada', payment: 'sin_pago', amount: 0, changeRequested: true, history: [event(now, 'Solicitud de cambio de muestra abierta. Horario original conservado.')] },
  ];
}
