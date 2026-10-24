import Image from 'next/image';
import Link from 'next/link';
import SiteNavigation from './components/site-navigation';
import LocationMap from './components/location-map';
import { bookingHref, isStaticShowcase, navigationItems, publicAsset, siteConfig, whatsappHref } from './site-config';

function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d={diagonal ? 'M6 18 18 6M6 6h12v12' : 'M4 12h16m-6-6 6 6-6 6'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function Brand() {
  return <a className="sc-brand" href="#inicio" aria-label="SmileCorp / Dr. Nelson, inicio"><Image className="sc-brand-logo" src={publicAsset('/images/smilecorp/logo-dr-nelson.webp')} alt="" width={82} height={110} sizes="36px" /><span>SMILECORP<small>DR. NELSON · ESTÉTICA DENTAL</small></span></a>;
}

function InstagramLink() {
  return <a className="sc-text-link" href={siteConfig.instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="Instagram del Dr. Nelson (se abre en una pestaña nueva)">Instagram · @dr.nelson___ <Arrow diagonal /></a>;
}

const treatments = [
  { id: 'carillas-resina', number: '01', title: 'Carillas de resina', text: 'Una alternativa dentro del diseño de sonrisa. La evaluación permite valorar su indicación, cuidados y alcance en tu caso.' },
  { id: 'carillas-ceramica', number: '02', title: 'Carillas de cerámica', text: 'Conoce esta opción y conversa sobre sus etapas y mantenimiento. La elección del material requiere una evaluación individual.' },
] as const;

const questions = [
  ['¿Qué se define en la evaluación?', 'Se evalúa tu salud bucal, se escuchan tus objetivos y se revisan las alternativas que podrían ser adecuadas para ti. La indicación y el presupuesto requieren una evaluación profesional.'],
  ['¿Resina o cerámica: qué opción necesito?', 'No hay una opción indicada para todas las personas. El profesional debe valorar tu caso, explicar las diferencias, los cuidados y las limitaciones antes de recomendar un tratamiento.'],
  ['¿También puedo consultar por implantes o prótesis?', 'Sí. SmileCorp ofrece estética dental, prótesis e implantes. Puedes indicar tu interés al explorar la reserva; la evaluación define qué corresponde en tu caso.'],
  ['¿Cómo funciona la reserva y hay que pagar un abono?', isStaticShowcase ? 'Esta página sólo muestra el diseño. No incluye calendario, formulario de reserva ni pagos. Puedes usar los canales de contacto para consultar; el monto y las reglas del abono siguen pendientes de confirmación.' : 'Por ahora, la reserva es una demostración con personas y horarios ficticios. El monto, concepto y reglas del abono están pendientes de confirmación. No se cobra dinero ni se agenda una atención real.'],
  ['¿Puedo resolver dudas antes de agendar?', 'Sí. Puedes consultar por WhatsApp antes de explorar la reserva. El enlace abre el canal del Dr. Nelson; no se envían mensajes automáticamente. El contacto administrativo no reemplaza una evaluación clínica. La ubicación y el mapa del consultorio están disponibles en la sección de contacto.'],
];

export default function Home() {
  const whatsapp = whatsappHref(siteConfig.whatsappNumber);
  return <div className="smilecorp">
    <a className="skip-link" href="#contenido">Saltar al contenido</a>
    <div className="sc-preview">{isStaticShowcase ? 'Muestra visual · Sin reservas, pagos ni captura de datos.' : 'Vista previa · Reservas de demostración, sin cobros ni envíos reales.'}</div>
    <header className="sc-header sc-container">
      <Brand />
      <nav className="sc-desktop-nav" aria-label="Navegación principal">{navigationItems.map(([href, label]) => <a key={href} href={href}>{label}</a>)}</nav>
      <Link className="sc-button sc-button-dark sc-header-book" href={bookingHref()}>Agendar evaluación <Arrow diagonal /></Link>
      <SiteNavigation />
    </header>

    <main id="contenido">
      <section className="sc-hero sc-container" id="inicio" aria-labelledby="hero-title">
        <div className="sc-hero-copy">
          <p className="sc-eyebrow"><span aria-hidden="true" /> SMILECORP / DR. NELSON</p>
          <h1 id="hero-title">Una sonrisa<br />que se sienta<br /><em>tuya.</em></h1>
          <p className="sc-hero-description">Conoce opciones de diseño de sonrisa y recibe una evaluación profesional para definir un plan personalizado.</p>
          <div className="sc-actions"><Link className="sc-button sc-button-dark" href={bookingHref()}>Agendar mi evaluación <Arrow /></Link><a className="sc-button sc-button-outline" href={whatsapp ?? '#contacto'} aria-describedby={!whatsapp ? 'whatsapp-status' : undefined}>Consultar por WhatsApp <Arrow diagonal /></a></div>
          <p className="sc-action-note">{isStaticShowcase ? 'Vista de diseño: los botones de evaluación llevan a información, no a una reserva.' : 'Explora una reserva de muestra. No confirma una atención real.'}</p>
          {!whatsapp && <p className="sc-contact-note" id="whatsapp-status">WhatsApp pendiente de habilitar. Consulta el estado en contacto.</p>}
          <a className="sc-text-link sc-hero-discover" href="#tratamientos">Conoce tus opciones <span aria-hidden="true">↓</span></a>
        </div>
        <figure className="sc-hero-visual" aria-labelledby="hero-visual-caption">
          <div className="sc-visual-top"><span>ESTÉTICA CON IDENTIDAD</span><span aria-hidden="true">SC — 01</span></div>
          <div className="sc-hero-smile"><Image src={publicAsset('/images/smilecorp/sonrisa-smilecorp.webp')} alt="Retrato de una mujer sonriendo, imagen proporcionada por SmileCorp" width={614} height={832} sizes="(max-width: 700px) calc(100vw - 92px), (max-width: 980px) 38vw, 400px" loading="eager" unoptimized /></div>
          <figcaption id="hero-visual-caption"><strong>Una sonrisa, una historia.</strong><span>Imagen compartida por SmileCorp.<br />No representa un resultado garantizado.</span><a className="sc-text-link" href="#profesional">Conoce al Dr. Nelson <Arrow diagonal /></a></figcaption>
        </figure>
      </section>

      <div className="sc-principles sc-container"><p>El primer paso no es elegir un tratamiento.<br /><strong>Es entender tus opciones.</strong></p><span>Evaluación profesional</span><span>Plan personalizado</span><span>Decisión informada</span></div>

      <section className="sc-section sc-cases" id="casos" aria-labelledby="cases-title"><div className="sc-container">
        <div className="sc-section-heading"><div><p className="sc-eyebrow">01 / Casos reales</p><h2 id="cases-title">Cada sonrisa tiene<br /><em>su propia historia.</em></h2></div><p>Antes y después de un caso compartido por SmileCorp. Imágenes utilizadas con autorización, sin retoques ni cambios en los resultados.</p></div>
        <figure className="sc-case-comparison" aria-describedby="case-disclaimer"><div className="sc-case-pair"><div className="sc-case-view"><p className="sc-label">ANTES</p><div className="sc-case-media"><Image src={publicAsset('/images/smilecorp/caso-2-2-antes.webp')} alt="Antes: vista de la sonrisa del caso presentado" width={743} height={369} sizes="(max-width: 700px) calc(100vw - 62px), 42vw" unoptimized /></div></div><div className="sc-case-view"><p className="sc-label">DESPUÉS</p><div className="sc-case-media"><Image src={publicAsset('/images/smilecorp/caso-2-2-despues.webp')} alt="Después: vista de la sonrisa del mismo caso" width={836} height={314} sizes="(max-width: 700px) calc(100vw - 62px), 42vw" unoptimized /></div></div></div><figcaption><strong>Antes y después</strong><span>Fotografías proporcionadas por SmileCorp.</span></figcaption></figure>
        <div className="sc-work-story"><figure><Image src={publicAsset('/images/smilecorp/trabajo-smilecorp.webp')} alt="Composición proporcionada por SmileCorp con una sonrisa y dos vistas de detalle del trabajo dental" width={883} height={500} sizes="(max-width: 700px) calc(100vw - 40px), 52vw" unoptimized /><figcaption>Registro visual compartido por SmileCorp.</figcaption></figure><div><p className="sc-eyebrow">EL CUIDADO ESTÁ EN LOS DETALLES</p><h3>Un trabajo.<br /><em>Distintas perspectivas.</em></h3><p>Conocer un caso puede ayudarte a plantear preguntas. Para saber qué opciones son adecuadas para ti, el primer paso es una evaluación profesional.</p><Link className="sc-text-link" href={bookingHref()}>Conversar sobre mi sonrisa <Arrow diagonal /></Link></div></div>
        <p className="sc-disclaimer" id="case-disclaimer">Cada paciente requiere una evaluación individual. Los resultados de un caso no garantizan el mismo resultado en otras personas.</p>
      </div></section>

      <section className="sc-section sc-container" id="tratamientos" aria-labelledby="treatments-title">
        <div className="sc-section-heading"><div><p className="sc-eyebrow">02 / Opciones para conversar</p><h2 id="treatments-title">El diseño empieza<br /><em>por conocerte.</em></h2></div><p>Estética dental, prótesis e implantes. La elección de un tratamiento comienza con tu salud bucal y una evaluación profesional.</p></div>
        <article className="sc-treatment-feature"><div><span className="sc-label">EL PUNTO DE PARTIDA</span><h3>Diseño de sonrisa</h3><p>Conversa sobre lo que buscas, conoce tus alternativas y define junto al profesional un plan para tu sonrisa. No es un tratamiento único ni una indicación automática de carillas.</p><Link className="sc-text-link" href={bookingHref('diseno-sonrisa')}>Evaluar mi sonrisa <Arrow diagonal /></Link></div><div className="sc-feature-logo"><Image src={publicAsset('/images/smilecorp/logo-dr-nelson.webp')} alt="Logo del Dr. Nelson" width={82} height={110} sizes="82px" /></div></article>
        <div className="sc-treatment-grid">{treatments.map(treatment => <article className="sc-treatment-card" key={treatment.id}><span className="sc-label">{treatment.number} / ESTÉTICA DENTAL</span><h3>{treatment.title}</h3><p>{treatment.text}</p><Link className="sc-text-link" href={bookingHref(treatment.id)}>Consultar por {treatment.title.toLowerCase()} <Arrow diagonal /></Link></article>)}</div>
        <div className="sc-secondary-treatments"><p>Otras necesidades.<br /><strong>El mismo punto de partida: evaluarte.</strong></p><Link href={bookingHref('implantes')}>Implantes <Arrow diagonal /></Link><Link href={bookingHref('protesis')}>Prótesis <Arrow diagonal /></Link></div>
        <p className="sc-disclaimer">La indicación final, las etapas y el presupuesto dependen de la evaluación de cada paciente.</p>
      </section>

      <section className="sc-process sc-section" id="proceso" aria-labelledby="process-title"><div className="sc-container">
        <div className="sc-section-heading"><div><p className="sc-eyebrow">03 / Sin saltarnos lo importante</p><h2 id="process-title">Un plan claro.<br /><em>Un paso a la vez.</em></h2></div><p>Agendar una evaluación no significa aceptar un tratamiento. Primero, información para decidir.</p></div>
        <ol className="sc-steps"><li><span>01</span><h3>Evaluación profesional</h3><p>Un punto de partida para revisar tu salud bucal, conversar sobre tus objetivos y resolver dudas.</p></li><li><span>02</span><h3>Propuesta personalizada</h3><p>Alternativas, etapas, cuidados y presupuesto explicados antes de decidir cómo continuar.</p></li><li><span>03</span><h3>Tratamiento y seguimiento</h3><p>Si decides avanzar, el tratamiento y los controles se definen según lo que corresponda a tu caso.</p></li></ol>
        <p className="sc-process-note">La indicación final depende de la evaluación profesional del paciente.</p>
      </div></section>

      <section className="sc-section sc-container sc-doctor" id="profesional" aria-labelledby="doctor-title">
        <figure className="sc-doctor-photo"><span className="sc-label">SMILECORP / DR. NELSON</span><div className="sc-doctor-photo-frame"><Image src={publicAsset('/images/smilecorp/dr-nelson-profesional.webp')} alt="Retrato del Dr. Nelson con uniforme clínico negro" width={768} height={1152} sizes="(max-width: 700px) min(320px, calc(100vw - 104px)), (max-width: 980px) 30vw, 320px" /></div><figcaption><strong>Dr. Nelson</strong><span>Una evaluación. Un plan para ti.</span></figcaption></figure>
        <div className="sc-doctor-copy"><p className="sc-eyebrow">04 / Conoce al profesional</p><h2 id="doctor-title">Dr. Nelson<br /><em>SmileCorp</em></h2><p>El enfoque del Dr. Nelson destaca el diseño de sonrisa y los tratamientos con carillas de resina y cerámica. SmileCorp ofrece estética dental, prótesis e implantes.</p><p>La conversación sobre tus objetivos y la evaluación profesional son el punto de partida para definir un plan personalizado.</p><div className="sc-profile-pending"><strong>Perfil en preparación</strong><p>Nombre completo, formación verificable y presentación del consultorio pendientes de validación.</p></div><a className="sc-text-link" href="#proceso">Conoce el proceso <Arrow diagonal /></a></div>
      </section>

      <section className="sc-section sc-faq-section" id="preguntas" aria-labelledby="faq-title"><div className="sc-container sc-faq"><div><p className="sc-eyebrow">05 / Antes de dar el paso</p><h2 id="faq-title">Preguntar también<br /><em>es parte del proceso.</em></h2><p>Lo importante es que puedas decidir<br />con información, no con presión.</p></div><div className="sc-faq-items">{questions.map(([question, answer], index) => <details key={question}><summary><span className="sc-faq-number">0{index + 1}</span>{question}<span className="sc-faq-plus" aria-hidden="true">＋</span></summary><p>{answer}</p></details>)}</div></div></section>

      <section className="sc-section sc-booking sc-container" id="reserva" aria-labelledby="booking-title"><div><p className="sc-eyebrow">TU SIGUIENTE PASO</p><h2 id="booking-title">Tu sonrisa merece<br /><em>una conversación.</em></h2><p>{isStaticShowcase ? 'Esta versión permite explorar el diseño y conocer los canales de contacto. No incluye calendario ni crea citas.' : 'Elige tu interés y explora los horarios del recorrido de demostración. Una evaluación es el comienzo, no un compromiso de tratamiento.'}</p></div><div className="sc-booking-card"><span className="sc-label">EVALUACIÓN PROFESIONAL</span><h3>Empecemos por ti.</h3><ul>{(isStaticShowcase ? ['Conoce las opciones de tratamiento', 'Revisa el proceso de evaluación', 'Encuentra los canales de contacto'] : ['Tratamiento de interés', 'Fecha y horario de muestra', 'Resumen antes de confirmar']).map(item => <li key={item}>{item}</li>)}</ul><Link className="sc-button sc-button-dark" href={isStaticShowcase ? '#contacto' : bookingHref()}>{isStaticShowcase ? 'Ver canales de contacto' : 'Agendar mi evaluación'} <Arrow /></Link><p>{isStaticShowcase ? 'Muestra visual: sin reservas ni cobros.' : 'Solo demostración. No ingreses datos reales.'}</p><div className="sc-deposit-note"><strong>Abono pendiente de configuración</strong><p>Monto, concepto, moneda y condiciones de cambios, cancelación y devolución por confirmar. No hay cobros activos.</p></div></div></section>

      <section className="sc-contact" id="contacto" aria-labelledby="contact-title"><div className="sc-container sc-contact-grid"><div><p className="sc-eyebrow">HABLEMOS ANTES, SI LO PREFIERES</p><h2 id="contact-title">¿Tienes dudas?<br /><em>Empieza por preguntar.</em></h2><p>El contacto administrativo no reemplaza una evaluación clínica. No envíes fotografías ni antecedentes sensibles por este prototipo.</p></div><div className="sc-contact-details"><h3>Contacto SmileCorp</h3>{whatsapp ? <a className="sc-button sc-button-light" href={whatsapp}>Consultar por WhatsApp <Arrow diagonal /></a> : <><button className="sc-button sc-button-light" type="button" disabled aria-describedby="contact-pending">WhatsApp no disponible aún</button><p id="contact-pending">Número oficial pendiente de confirmación. El botón se habilitará cuando el canal esté validado.</p></>}<div><InstagramLink /></div><div className="sc-location"><span className="sc-label">VISÍTANOS</span><p>{siteConfig.location ?? 'Dirección del consultorio pendiente de confirmar.'}</p>{siteConfig.location && <LocationMap address={siteConfig.location} />}</div><Link className="sc-text-link" href={bookingHref()}>{isStaticShowcase ? 'Conoce la evaluación' : 'Mientras tanto, explora la reserva de muestra'} <Arrow /></Link></div></div></section>
    </main>
    <footer className="sc-footer sc-container"><Brand /><p>SmileCorp / Dr. Nelson · Vista previa<br />Contenido clínico y comercial sujeto a validación.</p><a href="#inicio" className="sc-back-top" aria-label="Volver al inicio">↑</a><div className="sc-footer-bottom"><span>Una sonrisa que se sienta tuya.</span><InstagramLink />{!isStaticShowcase && <Link href="/app/hoy">Panel de demostración <Arrow diagonal /></Link>}</div></footer>
    <nav className="sc-mobile-booking" aria-label="Acceso rápido a evaluación"><span>Diseño de sonrisa<small>{isStaticShowcase ? 'Muestra de diseño' : 'Reserva de demostración'}</small></span><Link className="sc-button sc-button-dark" href={bookingHref()}>Agendar evaluación <Arrow diagonal /></Link></nav>
  </div>;
}
