import type { Metadata } from 'next';
import { isStaticShowcase } from './site-config';

export const metadata: Metadata = {
  title: 'SmileCorp / Dr. Nelson — Una sonrisa que se sienta tuya. | Vista previa',
  description: isStaticShowcase
    ? 'Muestra visual de SmileCorp / Dr. Nelson. Diseño de sonrisa, carillas, prótesis e implantes. Sin reservas, cobros ni captura de datos.'
    : 'Diseño de sonrisa, carillas, prótesis e implantes. Vista previa de SmileCorp / Dr. Nelson con reserva de demostración, sin cobros ni envíos reales.',
  robots: { index: false, follow: false },
};
