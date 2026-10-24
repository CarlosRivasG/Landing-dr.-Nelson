import AppointmentDetail from '../../../demo/appointment-detail';

export default async function AppointmentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AppointmentDetail id={id} />;
}
