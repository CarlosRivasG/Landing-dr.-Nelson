# SRS — Hipótesis de producto para avanzar

**Versión:** 0.1 · **Estado:** propuesta de trabajo, no aprobada por el cliente.

**Avance:** primer corte navegable implementado con reservas ficticias, checkout simulado, agenda y seguimiento. Ver [alcance real, verificaciones y límites](prototipo-app.md). P1/P2 y el piloto real no están implementados ni habilitados.

Este borrador permite desarrollar y probar la aplicación sin esperar el levantamiento completo. No se encontró un SRS ni un cuestionario original en los archivos revisados del repositorio: las preguntas siguientes reconstruyen los pendientes de `spec.md` y `arquitectura.md`; no son respuestas recibidas del cliente.

## 1. Cómo interpretar este documento

- **Contexto:** información existente en el repositorio; no equivale a una entrevista verificada.
- **Evidencia:** hallazgo de una fuente externa consultada, con sus límites.
- **Hipótesis:** decisión provisional de producto que se puede cambiar.
- **Bloqueo de producción:** requiere validación antes de activar esa capacidad con personas o dinero reales; no bloquea el prototipo.

El usuario autoriza avanzar mediante supuestos. Eso no significa aprobación del cliente ni autorización para publicar, cobrar o cargar pacientes reales. Las reglas propuestas deben ser configurables, no constantes dispersas por la aplicación.

## 2. Problema y propuesta

**Contexto:** especialistas odontológicos pierden tiempo e ingresos por inasistencias y por la coordinación de reservas y seguimiento. La experiencia debe funcionar desde el teléfono. Se propone un profesional piloto y crecimiento posterior a otros consultorios.

**Hipótesis central:** una reserva clara, recordatorios oportunos y una bandeja de próximas acciones pueden reducir trabajo administrativo y mejorar asistencia. El pago previo es una hipótesis adicional por validar, no una solución demostrada ni una condición para probar la agenda.

**Producto inicial:** una aplicación administrativa de captación, agenda y seguimiento; no un software de historia clínica ni un ERP odontológico.

**Recorrido:** conocer el servicio → elegir evaluación y horario → revisar condiciones → reservar/pagar en simulación → recibir confirmación → gestionar cambios → registrar asistencia → próxima acción.

## 3. Investigación utilizada y límites

| Fuente | Hallazgo utilizable | Límite / consecuencia |
|---|---|---|
| [Cochrane, recordatorios por mensajería, 2013](https://www.cochrane.org/evidence/CD007458_mobile-phone-messaging-reminders-attendance-healthcare-appointments) | Revisión de 8 ensayos, 6.615 participantes: evidencia baja a moderada de mayor asistencia con recordatorios SMS frente a no recordar. | Evidencia antigua y heterogénea, no específica de este consultorio. No prueba la eficacia del email, WhatsApp, un anticipo ni una cadencia de 24 horas. Se prioriza probar recordatorios, sin prometer porcentajes de mejora. |
| [Mercado Pago Chile, Webhooks](https://www.mercadopago.cl/developers/es/docs/checkout-pro-preferences/additional-content/notifications/webhooks) | La documentación describe notificaciones, validación de origen con `x-signature` y firma HMAC. | Justifica verificar eventos en servidor. No valida el monto, la política de devolución ni la conveniencia comercial de cobrar. |
| [BCN, Ley 19.628](https://www.bcn.cl/leychile/navegar?idNorma=141599) | Referencia normativa identificada para revisión de privacidad en Chile. | La página respondió, pero el texto legal no estuvo disponible en el HTML consultado. No se verificó su contenido ni el régimen aplicable a la fecha de lanzamiento. No se extraen conclusiones jurídicas. |

Las dos primeras fuentes se consultaron directamente para este borrador. No se hicieron entrevistas, estudio de mercado, revisión legal ni investigación sobre competidores. Chile sigue siendo una hipótesis territorial derivada de la arquitectura; debe confirmarse. No existe evidencia reunida aquí para afirmar que cobrar un 25% o prohibir devoluciones reduzca las inasistencias.

## 4. Respuestas propuestas al levantamiento

Todos los valores de esta tabla son **hipótesis**, salvo las restricciones técnicas ya existentes. Su uso inicial es en un entorno de demostración con datos ficticios.

| ID | Pregunta | Respuesta para avanzar | Validación pendiente |
|---|---|---|---|
| H01 | ¿Para quién empezamos? | Un consultorio, un profesional especialista y una persona administrativa opcional. | Tamaño real y responsabilidades. |
| H02 | ¿Cuál es el objetivo principal? | Evitar huecos evitables y reducir coordinación manual; no maximizar cobros. | Medir situación inicial y prioridad del profesional. |
| H03 | ¿Qué se reserva? | Evaluación inicial, no el tratamiento completo. La necesidad clínica y presupuesto se determinan fuera del embudo. | Catálogo y lenguaje autorizado. |
| H04 | ¿Cómo se aprueba? | Reserva directa únicamente sobre disponibilidad publicada. Servicios especiales podrán requerir aprobación en una fase posterior. | Si el piloto necesita aprobación manual desde el inicio. |
| H05 | ¿Qué se cobra? | Demo de un monto fijo por reserva de evaluación, configurable; sin porcentaje ni precio comercial predeterminado. No se afirma que sea descontable del tratamiento. | Concepto, monto, moneda, comprobante y eventual descuento: bloqueo del cobro real. |
| H06 | ¿Podemos probar sin pagar? | Sí: modo de demostración sin pago y modo de pago simulado. Ninguno se habilita públicamente como decisión comercial definitiva. | Elegir modalidad del piloto. |
| H07 | ¿Cuánto dura la cita? | 45 minutos más 15 de margen entre citas. | Duración real por servicio; valores editables. |
| H08 | ¿Con qué anticipación? | Desde 24 horas hasta 30 días; disponibilidad semanal y excepciones. | Anticipación real y necesidad de urgencias. No se presenta como canal de urgencia. |
| H09 | ¿Cuánto se retiene un horario? | 10 minutos durante el checkout simulado. | Compatibilidad con medios de pago; para el primer pago real evaluar sólo medios de resolución inmediata. |
| H10 | ¿Se puede reprogramar? | Hasta 24 horas antes, proponer una reprogramación autoservicio sin cargo extra; después, solicitar ayuda administrativa. | Plazo, límites y consecuencias monetarias: no aplicar penalidades reales sin aprobación. |
| H11 | ¿Qué pasa con cancelaciones e inasistencias? | Registrar evento y motivo administrativo estructurado. Toda devolución queda en revisión manual; no retener dinero automáticamente ni publicar “sin devolución”. | Política comercial y revisión jurídica antes de cobrar. |
| H12 | ¿Qué pasa si cancela el profesional? | Liberar horario, avisar y ofrecer nueva fecha o revisión de devolución. | Procedimiento, responsable y plazos; no prometer devolución ejecutada si sólo se solicitó. |
| H13 | ¿Qué datos pedimos? | Nombre, teléfono y correo para el flujo demo. No pedir RUT, diagnóstico, fotografías ni antecedentes clínicos. | Necesidad de exigir ambos canales y base jurídica del tratamiento antes del piloto real. |
| H14 | ¿El paciente necesita cuenta? | No; enlace de gestión con token aleatorio, expirable y revocable. Panel interno con autenticación. | Experiencia y mecanismo de recuperación seguro. |
| H15 | ¿Quién usa el panel? | Propietario/profesional y administrativo. Administrativo gestiona citas y tareas; no cambia políticas, roles ni ejecuta devoluciones. | Personas, permisos y aprobación del acceso. |
| H16 | ¿Qué notificaciones enviamos? | Confirmación, cambios y un recordatorio 24 h antes por correo; enlace manual a WhatsApp. En demo, bandeja simulada sin envíos externos. | Canal preferido, proveedor y tiempos; un email no se da por entregado por haber sido programado. |
| H17 | ¿Cómo se hace seguimiento? | Tarea con responsable, vencimiento y próxima acción. Proponer contacto al siguiente día hábil tras una inasistencia, con canal autorizado. | Si ese contacto corresponde a gestión o marketing y permisos aplicables. |
| H18 | ¿Qué reportamos? | Citas, asistencia, inasistencia, cancelación, conversión de reserva y tareas vencidas. Pagos separados de ingresos clínicos. | Definiciones y metas después de una línea base. |
| H19 | ¿Será SaaS? | Diseño aislado por consultorio, piloto único; sin onboarding público, suscripciones ni marketplace. | Demanda real de otros consultorios. |
| H20 | ¿Móvil u offline? | Web responsive; PWA instalable después. Sin datos de pacientes en caché offline en el MVP. | Necesidad real y evaluación de seguridad. |

No se fija horario semanal, importe ni país como dato real del profesional. El demo puede incluir horarios ficticios claramente identificados. Zona horaria y moneda deben configurarse explícitamente; las citas se muestran en la zona del consultorio.

## 5. Alcance y requisitos funcionales

### P0 — Demostración navegable, sin dependencias externas

| ID | Requisito | Criterio de aceptación |
|---|---|---|
| RF01 | Landing con acceso a reserva y conversación. | En móvil se distinguen ambos caminos; textos clínicos, testimonios y precios no verificados no se presentan como hechos. |
| RF02 | Seleccionar servicio, fecha y horario. | Se muestran duración, zona horaria y sólo horarios de demo disponibles; cambiar de servicio recalcula opciones. |
| RF03 | Resumen antes de confirmar. | Se ven servicio, horario, monto ficticio si aplica y política marcada como propuesta; no aparecen cobros reales. |
| RF04 | Checkout simulado. | Permite probar aprobado, rechazado, pendiente y expirado; botón y resultado indican “Simulación, sin cobro”. |
| RF05 | Panel “Hoy” y agenda. | Muestra próximas citas, estados, alertas y tareas con datos ficticios; agenda vacía y error tienen mensajes útiles. |
| RF06 | Detalle de cita y próxima acción. | Permite recorrer asistencia, inasistencia y solicitud de cambio, conservando historial administrativo de demo. |
| RF07 | Configuración de hipótesis. | Las reglas de la tabla están centralizadas y documentadas; políticas propuestas se identifican como tales. |

El prototipo no es un control de acceso real: sus rutas y fixtures no pueden recibir datos reales ni considerarse listos para producción.

### P1 — Base funcional local, datos sintéticos

| ID | Requisito | Criterio de aceptación |
|---|---|---|
| RF08 | Autenticación, roles y consultorio. | API rechaza usuarios sin permiso; pruebas intentan acceder a citas de otro consultorio y fallan. |
| RF09 | Disponibilidad y excepciones en servidor. | Rechaza horarios fuera de disponibilidad, superpuestos o bloqueados, incluso con peticiones concurrentes. |
| RF10 | Retención temporal de horario. | Dos solicitudes simultáneas no obtienen el mismo recurso; un hold vencido deja de impedir nuevas reservas sin depender de una tarea de limpieza puntual. |
| RF11 | Estados persistidos y auditados. | Transiciones inválidas se rechazan; se guarda actor, fecha, motivo estructurado y versión de política. |
| RF12 | Gestión por enlace seguro. | Token sin datos personales, con alcance limitado a una reserva; no permite enumerar citas. Expirado/revocado no concede acceso. |
| RF13 | Tareas y registro de notificaciones. | Reintentos no duplican recordatorios; el estado distingue programado, enviado, fallido y entrega confirmada cuando el proveedor la informe. |

### P2 — Integraciones de prueba y piloto condicionado

| ID | Requisito | Criterio de aceptación |
|---|---|---|
| RF14 | Mercado Pago en ambiente de prueba. | Credenciales fuera de Git; backend valida firma, consulta al proveedor y compara referencia, cuenta receptora, importe y moneda. El retorno del navegador no confirma. |
| RF15 | Idempotencia y conciliación. | Webhook repetido no duplica cita/pago/aviso; eventos desordenados no degradan un estado final; inconsistencias se envían a revisión. |
| RF16 | Pago tardío o duplicado. | Si el hold venció y el horario se ocupó, no se confirma ni desplaza otra cita. Se registra pago en revisión, se informa y se abre tarea; nunca se pierde el movimiento. |
| RF17 | Cancelación, reprogramación y devoluciones. | Liberación y nuevo horario son atómicos; devolución tiene ciclo propio y sólo se marca ejecutada tras confirmación del proveedor. |

## 6. Estados y reglas críticas

**Cita propuesta:** `pendiente_de_pago → confirmada → asistio | no_asistio | cancelada`; una cita pendiente puede `expirar` o cancelarse. En demo sin pago se confirma por una operación explícita del servidor simulado. En modalidad pagada sólo una verificación del servidor puede confirmar.

**Pago propuesto:** `creado → pendiente → aprobado | rechazado | cancelado | vencido`. Reembolsos y disputas tienen registros independientes; no se borra ni reescribe la aprobación original. Las transiciones concretas se ajustarán al contrato vigente del proveedor.

**Solicitud de cambio:** registro separado `abierta → resuelta | rechazada`. Pedir reprogramación no libera la cita actual; un cambio aceptado libera el horario anterior y ocupa el nuevo en una operación atómica. Cancelar registra quién canceló. No se marca inasistencia antes del fin de la cita, y se permite corrección auditada.

**Sincronización:** PostgreSQL es fuente de verdad; disponibilidad y ocupación se garantizan transaccionalmente en backend, nunca con un botón deshabilitado solamente. El importe lo calcula el servidor desde la configuración versionada, no desde el navegador.

## 7. Calidad, seguridad y privacidad

- No usar pacientes reales ni enviar mensajes externos en P0/P1; fixtures identificados como sintéticos.
- Nunca guardar tarjetas. No incluir información clínica en contactos, notas libres, logs ni mensajes de recordatorio.
- Separación por consultorio y autorización en todas las operaciones; auditoría sin secretos ni tokens.
- Tokens seguros, protección de sesiones, límites a intentos y validación de entradas antes de habilitar acceso externo.
- Gestión de cita separada de marketing; no imponer aceptación de marketing para reservar.
- Definir finalidad, base jurídica, retención, acceso, corrección y eliminación antes del piloto; no inventar un plazo legal.
- HTTPS, respaldo y restauración probados antes de operar. No cachear respuestas privadas en una futura PWA.
- Flujos principales utilizables con teclado, etiquetas y errores asociados a campos, foco visible y sin depender sólo del color; objetivo WCAG 2.2 AA, sujeto a verificación.
- Verificar reserva y panel a 360 px y escritorio; fechas legibles, estados vacíos y recuperación ante red lenta.

## 8. Priorización para no quedar bloqueados

1. **Primer corte:** reserva navegable + panel “Hoy” + detalle de cita, datos ficticios y checkout simulado (RF01–RF07). Sin nueva integración ni publicación.
2. **Segundo corte:** autenticación, consultorio, agenda y persistencia local con pruebas de aislamiento y concurrencia (RF08–RF13).
3. **Tercer corte:** pagos sandbox y pruebas de fallos, duplicados y pago tardío (RF14–RF17).
4. **Piloto real:** únicamente después de cerrar los bloqueos siguientes y autorizar explícitamente operación y despliegue.

**Fuera de alcance:** ficha clínica, odontograma, recetas, imágenes médicas, diagnósticos, facturación tributaria, tratamientos presupuestados completos, SaaS comercial, aplicación nativa y WhatsApp automatizado.

## 9. Validación y métricas

Hipótesis de usabilidad: alguien ajeno al proyecto puede completar una reserva ficticia desde su teléfono en menos de 3 minutos, identificar qué está reservando, cuánto pagaría y cómo pedir cambios. Es una meta de prueba, no un resultado observado.

Para el piloto, registrar una línea base antes de prometer mejoras:

- Asistencia = asistió / (asistió + no asistió), excluyendo citas futuras, canceladas y sin resultado.
- Inasistencia = no asistió / (asistió + no asistió); informar tamaño de muestra.
- Conversión = reservas confirmadas / inicios de reserva del mismo periodo/cohorte; definir sesión y deduplicación antes de instrumentar.
- Trabajo administrativo = minutos estimados o medidos por reserva; declarar el método.
- Seguimiento = tareas resueltas dentro de plazo / tareas vencidas en el periodo.
- Cancelaciones, pagos en revisión y fallos de notificación se reportan por separado.

Comparar periodos equivalentes y documentar cambios de volumen, servicio y canal. No atribuir causalidad al anticipo por una simple comparación antes/después.

## 10. Bloqueos de producción, no del prototipo

| Validación | Riesgo que evita |
|---|---|
| País, titular del servicio y cuenta receptora. | Operar bajo supuestos territoriales o comerciales incorrectos. |
| Servicio, monto, moneda y naturaleza del pago. | Cobrar un concepto equivocado o prometer descuentos inexistentes. |
| Reglas de cambios, cancelación, inasistencia y devolución; revisión legal. | Retenciones o condiciones no autorizadas. |
| Horarios, duración, aprobación y responsable operativo. | Confirmar atención que no puede prestarse. |
| Datos mínimos, privacidad, permisos, retención y canales autorizados. | Tratamiento de datos sin diseño y validación adecuados. |
| Seguridad, restauración, soporte y conciliación. | Pérdida de datos o pagos sin resolución. |

Se puede mostrar al cliente una propuesta concreta y pedirle que corrija estas seis áreas, en lugar de esperar respuestas a un formulario vacío. Cuando responda, cada hipótesis cambia a validada, modificada o descartada, conservando historial. Este documento no autoriza automáticamente el piloto real.
