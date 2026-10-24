// Sólo información pública. No colocar claves ni datos de pacientes aquí.
// Completar contacto únicamente con datos confirmados por SmileCorp.
export const isStaticShowcase = process.env.NEXT_PUBLIC_STATIC_SHOWCASE === 'true';
export function publicAsset(path: string): string {
  return `${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}${path}`;
}
export const siteConfig: {
  name: string;
  professional: string;
  instagramUrl: string;
  whatsappNumber: string | null;
  location: string | null;
  promotion: null;
} = {
  name: 'SmileCorp',
  professional: 'Dr. Nelson',
  instagramUrl: 'https://www.instagram.com/dr.nelson___/', // Enlace proporcionado por el usuario.
  whatsappNumber: '56933170550', // +56 9 3317 0550, proporcionado por el usuario.
  location: 'La Concepción 81, Providencia, Región Metropolitana',
  promotion: null, // Sin promoción aprobada; no se publica ningún mensaje promocional.
};

export function whatsappHref(number: string | null): string | null {
  return number && /^[1-9]\d{7,14}$/.test(number) ? `https://wa.me/${number}` : null;
}

// Consulta por la dirección proporcionada; no se inventan coordenadas ni se geolocaliza al visitante.
export function getMapLinks(address: string) {
  const query = encodeURIComponent(address);
  return {
    search: `https://www.google.com/maps/search/?api=1&query=${query}`,
    embed: `https://maps.google.com/maps?q=${query}&output=embed`,
  };
}

export const navigationItems = [
  ['#casos', 'Casos'], ['#tratamientos', 'Tratamientos'],
  ['#proceso', 'Proceso'], ['#preguntas', 'Preguntas frecuentes'],
] as const;

export const treatmentInterests = [
  { id: 'diseno-sonrisa', label: 'Diseño de sonrisa' },
  { id: 'carillas-resina', label: 'Carillas de resina' },
  { id: 'carillas-ceramica', label: 'Carillas de cerámica' },
  { id: 'implantes', label: 'Implantes' },
  { id: 'protesis', label: 'Prótesis' },
  { id: 'por-definir', label: 'Quiero orientación' },
] as const;
export type TreatmentInterest = typeof treatmentInterests[number]['id'];
export function parseTreatmentInterest(value: unknown): TreatmentInterest {
  return treatmentInterests.find(item => item.id === value)?.id ?? 'por-definir';
}
export function treatmentLabel(value: TreatmentInterest): string {
  return treatmentInterests.find(item => item.id === value)!.label;
}
export function bookingHref(interest: TreatmentInterest = 'diseno-sonrisa'): string {
  return isStaticShowcase ? '#reserva' : `/reservar?interes=${interest}`;
}

// No habilita cobros. El simulador técnico conserva sus fixtures independientes.
export const depositConfiguration = {
  status: 'pending',
  amount: null,
  currency: null,
  concept: null,
  cancellationPolicy: null,
  refundPolicy: null,
} as const;
