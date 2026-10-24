'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import DemoShell from './demo-shell';
import { useDemo } from './demo-provider';
import { contacts, dateChoices, demoRules, displayDate, isSlotFree, money, paymentLabels, slotsForDay, statusLabels, type Simulation } from './model';

import { siteConfig, treatmentInterests, treatmentLabel, whatsappHref, type TreatmentInterest } from '../site-config';

export default function BookingFlow({ initialInterest = 'por-definir' }: { initialInterest?: TreatmentInterest }) {
  const { state, dispatch } = useDemo();
  const [step, setStep] = useState(1);
  const [day, setDay] = useState('');
  const [slot, setSlot] = useState('');
  const [contact, setContact] = useState<string>(contacts[0]);
  const [interest, setInterest] = useState<TreatmentInterest>(initialInterest);
  const [paid, setPaid] = useState(false);
  const whatsapp = whatsappHref(siteConfig.whatsappNumber);
  const [accepted, setAccepted] = useState(false);
  const title = useRef<HTMLHeadingElement>(null);
  const booking = state.appointments.find(a => a.id === state.activeBookingId);
  const phase = booking ? (booking.status === 'pendiente_de_pago' ? 3 : 4) : step;
  useEffect(() => { title.current?.focus(); }, [phase]);
  const now = state.now ? new Date(state.now) : null;
  const days = now ? dateChoices(now) : [];
  const chosenDay = day || days[0] || '';
  const slots = now && chosenDay ? slotsForDay(chosenDay, now) : [];
  const available = !!now && slots.includes(slot) && isSlotFree(state.appointments, slot, now);
  const remaining = booking?.holdUntil && now ? Math.max(0, Math.ceil((Date.parse(booking.holdUntil) - now.getTime()) / 60000)) : 0;
  const pay = (outcome: Simulation) => {
    if (booking) dispatch({ type: 'pay', id: booking.id, outcome, now: new Date().toISOString() });
  };
  return <DemoShell>
    <div className="demo-page-heading"><p className="eyebrow">Tu próxima visita / recorrido de muestra</p><h1>Un espacio para empezar.</h1><p>Explora cómo sería reservar una evaluación. No estás agendando una atención real.</p></div>
    <ol className="demo-progress" aria-label="Pasos de la reserva">{['Interés y horario', 'Resumen', 'Simulación opcional', 'Resultado'].map((label, index) => <li key={label} aria-current={phase === index + 1 ? 'step' : undefined}><span>{String(index + 1).padStart(2, '0')}</span>{label}</li>)}</ol>
    <div className="demo-booking-grid">
      <section className="demo-panel demo-booking-panel" aria-labelledby="booking-step">
        <p className="eyebrow">Paso {phase} de 4</p>
        <h2 ref={title} tabIndex={-1} id="booking-step">{phase === 1 ? 'Elige tu momento.' : phase === 2 ? 'Todo claro antes de seguir.' : phase === 3 ? 'Prueba el resultado del pago.' : booking?.status === 'confirmada' ? 'Tu reserva de muestra está lista.' : 'El horario se ha liberado.'}</h2>
        {!now && <p role="status">Preparando horarios de demostración…</p>}
        {state.error && <p className="demo-error" role="alert">{state.error}</p>}
        {phase === 1 && now && <form onSubmit={event => { event.preventDefault(); if (available) { setAccepted(false); setStep(2); } }}>
          <div className="demo-service"><span className="demo-service-icon" aria-hidden="true">↗</span><div><strong>Evaluación inicial</strong><p>45 minutos · un profesional de muestra</p></div><span className="demo-tag">Hipótesis</span></div>
          <label className="demo-field">Tratamiento de interés<select name="interes" value={interest} onChange={event => setInterest(event.target.value as TreatmentInterest)}>{treatmentInterests.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}</select><small>Reservas una evaluación, no un tratamiento. Todos los intereses comparten horarios ficticios de evaluación.</small></label>
          <p className="demo-policy demo-commercial-pending"><strong>Abono pendiente de configuración</strong><br />Monto, concepto, moneda y reglas de cambios, cancelación y devolución por confirmar. No hay cobros activos ni una política comercial aprobada.</p>
          <label className="demo-field">Fecha<select value={chosenDay} onChange={event => { setDay(event.target.value); setSlot(''); }} required>{days.map(date => <option key={date} value={date}>{new Intl.DateTimeFormat('es-CL', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' }).format(new Date(`${date}T12:00:00Z`))}</option>)}</select></label>
          <fieldset className="demo-fieldset"><legend>Horarios · hora del consultorio (Santiago)</legend><div className="demo-slots">{slots.map(time => {
            const free = isSlotFree(state.appointments, time, now);
            return <label key={time} className={`demo-slot ${!free ? 'demo-slot-unavailable' : ''}`}><input type="radio" name="horario" value={time} checked={slot === time} onChange={() => setSlot(time)} disabled={!free} required /><span>{displayDate(time, false)}{!free && <small>Ocupado</small>}</span></label>;
          })}</div>{slots.length === 0 && <p className="demo-empty" role="status">No quedan horarios con 24 horas de anticipación en esta fecha. Prueba otro día.</p>}</fieldset>
          <label className="demo-field">Persona ficticia<select value={contact} onChange={event => setContact(event.target.value)}>{contacts.map(name => <option key={name}>{name}</option>)}</select><small>No pedimos nombre, teléfono ni correo reales en esta demo. Para operar se prevé nombre y un canal de contacto; los datos mínimos y el aviso de privacidad requieren validación.</small></label>
          <button className="button button-blue" disabled={!available} type="submit">Revisar reserva <span aria-hidden="true">→</span></button>
        </form>}
        {phase === 2 && !booking && <form onSubmit={event => {
          event.preventDefault();
          if (accepted) dispatch({ type: 'book', contact, slot, paid, interest, now: new Date().toISOString(), id: `demo-${crypto.randomUUID()}` });
        }}>
          <dl className="demo-facts"><div><dt>Servicio</dt><dd>Evaluación inicial · 45 min de muestra</dd></div><div><dt>Interés</dt><dd>{treatmentLabel(interest)}</dd></div><div><dt>Abono comercial</dt><dd>Pendiente de configuración · sin cobros activos</dd></div><div><dt>Persona</dt><dd>{contact}</dd></div><div><dt>Horario</dt><dd>{displayDate(slot)}</dd></div><div><dt>Zona horaria</dt><dd>America/Santiago</dd></div></dl>
          <fieldset className="demo-fieldset"><legend>Modalidad de prueba</legend><label className="demo-choice"><input type="radio" name="modalidad" checked={paid} onChange={() => setPaid(true)} /><span><strong>Con pago simulado · {money(demoRules.simulatedAmount)} CLP</strong><small>Importe ficticio para probar el recorrido. No es un precio comercial.</small></span></label><label className="demo-choice"><input type="radio" name="modalidad" checked={!paid} onChange={() => setPaid(false)} /><span><strong>Sin pago · demostración (opción inicial)</strong><small>Confirma una cita ficticia directamente.</small></span></label></fieldset>
          <div className="demo-policy"><strong>Condiciones propuestas, no definitivas</strong><ul><li>En modalidad pagada, el horario se retiene 10 minutos.</li><li>Puedes probar una solicitud de cambio; no libera el horario original.</li><li>Plazo propuesto de cambios: 24 horas. No se aplican cargos ni retenciones de dinero.</li><li>Cancelaciones y devoluciones reales requieren una política aprobada.</li></ul></div>
          <label className="demo-choice"><input type="checkbox" checked={accepted} onChange={event => setAccepted(event.target.checked)} required /><span>Entiendo que es una demostración con datos ficticios y condiciones propuestas.</span></label>
          <div className="demo-actions"><button type="button" className="demo-secondary" onClick={() => setStep(1)}>Volver al horario</button><button className="button button-blue" type="submit" disabled={!accepted || !available}>{paid ? 'Ir a la simulación' : 'Confirmar cita ficticia'} <span aria-hidden="true">→</span></button></div>
          {!available && <p className="demo-error" role="alert">El horario dejó de estar disponible. Vuelve al paso anterior y elige otro.</p>}
        </form>}
        {phase === 3 && booking && <>
          <div className="demo-checkout"><p className="eyebrow">Checkout de prueba / sin proveedor externo</p><strong>{money(booking.amount)} <small>CLP ficticios</small></strong><p>{displayDate(booking.startsAt)} · {booking.contact}</p><p>Retención: hasta {displayDate(booking.holdUntil!, false)}. Quedan aproximadamente {remaining} min.</p></div>
          <p className="demo-inline-note">Elige un escenario para comprobar la interfaz. Aquí no se conecta Mercado Pago ni se mueven fondos.</p>
          <p role="status" className="demo-status-line">Estado: {paymentLabels[booking.payment]}</p>
          {booking.payment === 'rechazado' && <p className="demo-error">El pago simulado fue rechazado. Puedes reintentar mientras el horario siga retenido.</p>}
          {booking.payment === 'pendiente' && <p className="demo-policy">Todavía no hay confirmación. Puedes simular aprobación o esperar el vencimiento.</p>}
          <div className="demo-scenarios"><button className="button button-blue" onClick={() => pay('aprobado')}>Simular aprobado</button><button className="demo-secondary" onClick={() => pay('rechazado')}>Simular rechazado</button><button className="demo-secondary" onClick={() => pay('pendiente')}>Simular pendiente</button><button className="demo-secondary" onClick={() => pay('expirado')}>Simular vencimiento</button></div>
        </>}
        {phase === 4 && booking && <div className="demo-result">
          <span className="demo-result-icon" aria-hidden="true">{booking.status === 'confirmada' ? '✓' : '↻'}</span>
          <p role="status"><strong>{statusLabels[booking.status]} · sólo demostración</strong></p>
          <p>{booking.status === 'confirmada' ? 'La cita ficticia ya aparece en la agenda. No se envió una confirmación ni se hizo un cobro.' : 'No se confirmó ninguna atención ni se hizo un cobro. Puedes elegir otro horario.'}</p>
          <dl className="demo-facts"><div><dt>Persona</dt><dd>{booking.contact}</dd></div><div><dt>Interés</dt><dd>{treatmentLabel(booking.treatmentInterest ?? 'por-definir')}</dd></div><div><dt>Horario</dt><dd>{displayDate(booking.startsAt)}</dd></div><div><dt>Pago</dt><dd>{paymentLabels[booking.payment]}</dd></div></dl>
          <div className="demo-actions"><Link className="button button-blue" href={`/app/citas/${booking.id}`}>Ver detalle de la cita →</Link><Link className="demo-secondary" href="/app/agenda">Ver agenda</Link></div>
          <button className="demo-text-button" onClick={() => { dispatch({ type: 'clear' }); setStep(1); setSlot(''); setAccepted(false); }}>Probar otra reserva</button>
        </div>}
      </section>
      <aside className="demo-booking-aside"><span className="demo-aside-mark" aria-hidden="true">Sc.</span><p className="eyebrow">A tu ritmo</p><h2>Primero,<br />comprender.</h2><p>Reservar una evaluación no significa aceptar un tratamiento. Las alternativas y su presupuesto se conversan con el profesional.</p><hr /><p><strong>¿Prefieres conversar?</strong><br />{whatsapp ? <a href={whatsapp}>Consultar por WhatsApp ↗</a> : 'El canal de WhatsApp está pendiente de confirmar. No incluimos un número ficticio ni enviamos mensajes.'}</p><details><summary>¿Qué estás probando?</summary><p>Un flujo propuesto para un profesional piloto. Duración, disponibilidad, importe y políticas son hipótesis editables, no condiciones publicadas del consultorio.</p></details><Link className="inline-link" href="/app/hoy">Explorar el panel del equipo ↗</Link></aside>
    </div>
  </DemoShell>;
}
