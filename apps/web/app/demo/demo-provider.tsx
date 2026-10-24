'use client';

import { createContext, useContext, useEffect, useReducer, type ReactNode } from 'react';
import { createBooking, expireHolds, makeFixtures, simulatePayment, updateAppointment, type Appointment, type AppointmentAction, type Simulation } from './model';

import type { TreatmentInterest } from '../site-config';

type State = { appointments: Appointment[]; now: string | null; activeBookingId: string | null; error: string };
type Action =
  | { type: 'tick'; now: string }
  | { type: 'reset'; now: string }
  | { type: 'book'; now: string; id: string; contact: string; slot: string; paid: boolean; interest?: TreatmentInterest }
  | { type: 'pay'; now: string; id: string; outcome: Simulation }
  | { type: 'update'; now: string; id: string; action: AppointmentAction }
  | { type: 'clear' };
const initial: State = { appointments: [], now: null, activeBookingId: null, error: '' };
function reducer(state: State, action: Action): State {
  if (action.type === 'clear') return { ...state, activeBookingId: null, error: '' };
  const now = new Date(action.now);
  if (action.type === 'reset' || !state.now) return { appointments: makeFixtures(now), now: action.now, activeBookingId: null, error: '' };
  const appointments = expireHolds(state.appointments, now);
  if (action.type === 'tick') return { ...state, appointments, now: action.now };
  try {
    if (action.type === 'book') {
      const booking = createBooking(appointments, action.contact, action.slot, action.paid, now, action.id, action.interest);
      return { appointments: [...appointments, booking], now: action.now, activeBookingId: booking.id, error: '' };
    }
    const appointment = appointments.find(a => a.id === action.id);
    if (!appointment) throw new Error('No encontramos esa cita de muestra.');
    const updated = action.type === 'pay' ? simulatePayment(appointment, action.outcome, now) : updateAppointment(appointment, action.action, now);
    return { ...state, now: action.now, appointments: appointments.map(a => a.id === updated.id ? updated : a), error: '' };
  } catch (error) {
    return { ...state, appointments, now: action.now, error: error instanceof Error ? error.message : 'No se pudo completar la acción de muestra.' };
  }
}
const DemoContext = createContext<{ state: State; dispatch: React.Dispatch<Action> } | null>(null);
export function DemoProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initial);
  useEffect(() => {
    dispatch({ type: 'tick', now: new Date().toISOString() });
    const timer = window.setInterval(() => dispatch({ type: 'tick', now: new Date().toISOString() }), 1000);
    return () => window.clearInterval(timer);
  }, []);
  return <DemoContext.Provider value={{ state, dispatch }}>{children}</DemoContext.Provider>;
}
export function useDemo() {
  const context = useContext(DemoContext);
  if (!context) throw new Error('Falta el proveedor del prototipo.');
  return context;
}
