import BookingFlow from '../demo/booking-flow';
import { parseTreatmentInterest } from '../site-config';

export default async function BookingPage({ searchParams }: {
  searchParams: Promise<{ interes?: string | string[] }>;
}) {
  const { interes } = await searchParams;
  const interest = parseTreatmentInterest(interes);
  return <BookingFlow key={interest} initialInterest={interest} />;
}
