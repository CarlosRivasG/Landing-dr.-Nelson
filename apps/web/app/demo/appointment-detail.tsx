'use client';

import Link from 'next/link';
import { useState } from 'react';
import DemoShell from './demo-shell';
import { useDemo } from './demo-provider';
import { treatmentLabel } from '../site-config';
import { canMarkAttendance, demoRules, displayDate, money, paymentLabels, statusLabels, type AppointmentAction } from './model';

export default function AppointmentDetail({ id }: { id: string }) {
  const { state, dispatch } = useDemo();
  const [confirmCancel, setConfirmCancel] = useState(false);
  const appointment = state.appointments.find(a => a.id === id);
  const act = (action: AppointmentAction) => dispatch({ type: 'update', id, action, now: new Date().toISOString() });
  const now = state.now ? new Date(state.now) : null;
  if (!now) return <DemoShell><p role="status">Preparando detalle de muestra…</p></DemoShell>;
  if (!appointment) return <DemoShell><div className="demo-panel demo-empty"><h1>No encontramos esta cita de muestra.</h1><p>Los cambios sólo existen en esta sesión y se borran al recargar. No se guardan datos en el navegador ni en el servidor.</p><Link className="button button-blue" href="/app/agenda">Volver a la agenda</Link></div></DemoShell>;
  const attendanceAllowed = canMarkAttendance(appointment, now);
  const mutable = ['confirmada', 'pendiente_de_pago'].includes(appointment.status);
  const shortNotice = Date.parse(appointment.startsAt) - now.getTime() < demoRules.rescheduleNoticeHours * 3600000;
  return <DemoShell>
    <Link className="inline-link" href="/app/agenda">← Volver a la agenda</Link>
    <div className="demo-page-heading demo-heading-row"><div><p className="eyebrow">Detalle de cita / datos ficticios</p><h1>{appointment.contact}</h1><p>Evaluación inicial · {displayDate(appointment.startsAt)} · 45 minutos</p></div><span className={`demo-badge demo-badge-${appointment.status}`}>{statusLabels[appointment.status]}</span></div>
    <p className="demo-sr-only" role="status">{appointment.history.at(-1)?.text}</p>
    {state.error && <p className="demo-error" role="alert">{state.error}</p>}
    <div className="demo-detail-grid"><div>
      <section className="demo-panel"><p className="eyebrow">Una visita, todo el contexto</p><h2>Reserva y estado.</h2><dl className="demo-facts"><div><dt>Referencia</dt><dd>{appointment.id}</dd></div><div><dt>Profesional</dt><dd>Profesional de muestra</dd></div><div><dt>Interés</dt><dd>{treatmentLabel(appointment.treatmentInterest ?? 'por-definir')}</dd></div><div><dt>Zona horaria</dt><dd>America/Santiago</dd></div><div><dt>Modalidad de pago</dt><dd>{paymentLabels[appointment.payment]}</dd></div><div><dt>Importe de demostración</dt><dd>{money(appointment.amount)} CLP · sin cobro</dd></div></dl>
        <h3 className="demo-subheading">Resultado de la visita</h3><p className="demo-inline-note">Se habilita al terminar una cita confirmada. No se marca inasistencia antes de tiempo.</p><div className="demo-actions"><button className="button button-blue" disabled={!attendanceAllowed} onClick={() => act('asistio')}>Registrar asistencia</button><button className="demo-secondary" disabled={!attendanceAllowed} onClick={() => act('no_asistio')}>Registrar inasistencia</button></div>
        <h3 className="demo-subheading">Cambios de horario</h3>
        {appointment.changeRequested ? <div className="demo-policy"><p><strong>Solicitud abierta.</strong> La cita original sigue vigente. En esta iteración no se asigna una nueva hora automáticamente.</p><button className="demo-text-button" onClick={() => act('resolver_cambio')}>Cerrar solicitud sin cambiar horario</button></div> : <><p className="demo-inline-note">{shortNotice ? 'Faltan menos de 24 horas o la fecha ya pasó. Cualquier cambio requiere revisión administrativa.' : 'La propuesta permite solicitar cambios con 24 horas de anticipación.'} La solicitud no modifica ni libera el horario.</p><button className="demo-secondary" disabled={appointment.status !== 'confirmada'} onClick={() => act('solicitar_cambio')}>Abrir solicitud de cambio</button></>}
        {mutable && <div className="demo-cancel-area">{!confirmCancel ? <button className="demo-text-button" onClick={() => setConfirmCancel(true)}>Cancelar esta cita de muestra</button> : <div className="demo-confirm" aria-label="Confirmar cancelación"><p>¿Cancelar la cita y liberar el horario? El historial y el pago simulado se conservarán. No se ejecuta una devolución.</p><button className="button button-black" onClick={() => { act('cancelar'); setConfirmCancel(false); }}>Sí, cancelar cita</button><button className="demo-secondary" autoFocus onClick={() => setConfirmCancel(false)}>Conservar cita</button></div>}</div>}
      </section>
      <section className="demo-panel demo-history"><p className="eyebrow">Trazabilidad de la sesión</p><h2>Lo que ha pasado.</h2><ol>{appointment.history.map((entry, index) => <li key={`${entry.at}-${index}`}><time dateTime={entry.at}>{displayDate(entry.at)}</time><p>{entry.text}</p><small>Actor de muestra: equipo / simulador</small></li>)}</ol></section>
    </div><aside>
      <section className="demo-panel demo-task-panel"><p className="eyebrow">Continuidad del cuidado</p><h2>El siguiente paso.</h2><p className="demo-inline-note">Seguimiento administrativo, no ficha clínica. Sin campos para diagnósticos ni antecedentes.</p>
        {appointment.followUp ? <div className="demo-follow-up"><span className="demo-tag">{appointment.followUp.done ? 'Completada' : 'Pendiente'}</span><h3>{appointment.followUp.action}</h3><p>Equipo administrativo</p><p>Fecha: {appointment.followUp.due.split('-').reverse().join('/')}</p>{!appointment.followUp.done && <button className="button button-blue" onClick={() => act('completar_tarea')}>Marcar tarea completada</button>}</div> : <p className="demo-empty">Todavía no hay una tarea asociada.</p>}
        {(!appointment.followUp || appointment.followUp.done) && <button className="demo-secondary" onClick={() => act('crear_tarea')}>Crear próxima acción de muestra</button>}
      </section>
      <div className="demo-policy demo-policy-separated"><strong>Sin automatismos financieros</strong><p>Cancelar no borra el pago ni implica un reembolso. La política comercial y el procedimiento de devolución requieren validación antes del piloto.</p></div>
      <p className="demo-bottom-note">No hay correo, WhatsApp, autenticación ni enlaces seguros de paciente activos. Este detalle es una vista interna pública de demostración.</p>
    </aside></div>
  </DemoShell>;
}
