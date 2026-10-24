'use client';

import Link from 'next/link';
import { useState } from 'react';
import DemoShell from './demo-shell';
import { useDemo } from './demo-provider';
import { clinicDate, displayDate, paymentLabels, statusLabels, type AppointmentStatus } from './model';

export default function Dashboard({ agenda = false }: { agenda?: boolean }) {
  const { state } = useDemo();
  const [filter, setFilter] = useState('todas');
  const [date, setDate] = useState('');
  const now = state.now ? new Date(state.now) : null;
  const today = now ? clinicDate(now) : '';
  const items = state.appointments.filter(a => agenda ? (!date || clinicDate(new Date(a.startsAt)) === date) : clinicDate(new Date(a.startsAt)) === today)
    .filter(a => filter === 'todas' || a.status === filter)
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  const todayItems = state.appointments.filter(a => clinicDate(new Date(a.startsAt)) === today);
  const tasks = state.appointments.filter(a => a.followUp && !a.followUp.done);
  const requests = state.appointments.filter(a => a.changeRequested);
  return <DemoShell>
    <div className="demo-page-heading demo-heading-row"><div><p className="eyebrow">Espacio del equipo / acceso de muestra</p><h1>{agenda ? 'Cada cita, en su lugar.' : 'Hoy, con claridad.'}</h1><p>{agenda ? 'Todas las reservas de esta sesión, incluidas las que crees desde el flujo de prueba.' : 'Tu agenda y las próximas acciones, sin perder el contexto.'}</p></div><Link className="button button-blue" href="/reservar">Probar nueva reserva <span aria-hidden="true">＋</span></Link></div>
    <div className="demo-metrics"><article><p>Citas de hoy</p><strong>{todayItems.length.toString().padStart(2, '0')}</strong><small>Incluye todos los estados</small></article><article><p>Pendientes de asistencia</p><strong>{todayItems.filter(a => a.status === 'confirmada').length.toString().padStart(2, '0')}</strong><small>Resultado por registrar</small></article><article><p>Próximas acciones</p><strong>{tasks.length.toString().padStart(2, '0')}</strong><small>Tareas abiertas de la sesión</small></article></div>
    <div className="demo-dashboard-grid">
      <section className="demo-panel" aria-labelledby="agenda-title"><div className="demo-panel-title"><div><p className="eyebrow">Un profesional · zona Santiago</p><h2 id="agenda-title">{agenda ? 'Agenda de muestra' : 'Agenda del día'}</h2></div>{!agenda && <Link href="/app/agenda" className="inline-link">Ver todas ↗</Link>}</div>
        <div className="demo-filters"><label className="demo-field">Estado<select value={filter} onChange={event => setFilter(event.target.value)}><option value="todas">Todos los estados</option>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>{agenda && <label className="demo-field">Fecha<input type="date" value={date} onChange={event => setDate(event.target.value)} /></label>}{agenda && date && <button className="demo-text-button" onClick={() => setDate('')}>Todas las fechas</button>}</div>
        {!now ? <p role="status">Preparando agenda de muestra…</p> : items.length === 0 ? <div className="demo-empty"><h3>No hay citas en esta vista.</h3><p>Prueba otra fecha o estado, o crea una reserva ficticia.</p><Link className="inline-link" href="/reservar">Explorar la reserva →</Link></div> : <ul className="demo-appointment-list">{items.map(appointment => <li key={appointment.id}><Link href={`/app/citas/${appointment.id}`} className="demo-appointment"><div className="demo-time"><strong>{displayDate(appointment.startsAt, false)}</strong><small>{new Intl.DateTimeFormat('es-CL', { timeZone: 'America/Santiago', day: 'numeric', month: 'short' }).format(new Date(appointment.startsAt))}</small></div><div className="demo-appointment-copy"><strong>{appointment.contact}</strong><span>Evaluación inicial · 45 min</span><small>{paymentLabels[appointment.payment]}</small></div><div className="demo-appointment-end"><span className={`demo-badge demo-badge-${appointment.status satisfies AppointmentStatus}`}>{statusLabels[appointment.status]}</span>{appointment.changeRequested && <small>Cambio solicitado</small>}<span aria-hidden="true">↗</span></div></Link></li>)}</ul>}
      </section>
      <aside className="demo-panel demo-task-panel"><p className="eyebrow">No perder el hilo</p><h2>Próxima acción.</h2><p className="demo-inline-note">Responsable de muestra: equipo administrativo. Sin mensajería automática.</p>
        {tasks.length === 0 && <p className="demo-empty">No hay tareas pendientes.</p>}
        <ul className="demo-task-list">{tasks.map(a => <li key={a.id}><span className="demo-tag">{a.followUp!.due < today ? 'Vencida' : a.followUp!.due === today ? 'Para hoy' : 'Programada'}</span><h3>{a.contact}</h3><p>{a.followUp!.action}</p><small>Fecha: {a.followUp!.due.split('-').reverse().join('/')}</small><Link className="inline-link" href={`/app/citas/${a.id}`}>Revisar tarea →</Link></li>)}</ul>
        <div className="demo-requests"><h3>Solicitudes de cambio <span>{requests.length}</span></h3><p>El horario original se conserva hasta acordar otro.</p>{requests.map(a => <Link key={a.id} href={`/app/citas/${a.id}`}>{a.contact} <span aria-hidden="true">↗</span></Link>)}</div>
      </aside>
    </div>
    <p className="demo-bottom-note">Estos indicadores describen datos de muestra: no son resultados del consultorio ni mejoras comprobadas de asistencia.</p>
  </DemoShell>;
}
