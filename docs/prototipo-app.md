# Primer corte de aplicación — reserva, agenda y seguimiento

**Estado:** prototipo navegable de la fase P0 del [SRS provisional](SRS.md), no producto listo para operar. Trabajo local en `staging`; sin despliegue, cobros, mensajes ni pacientes reales.

## Qué se puede probar

| Ruta | Comportamiento |
|---|---|
| `/` | Landing existente con enlaces a la reserva ficticia y al panel. Conserva Three.js, fallback y recursos visuales anteriores. |
| `/reservar` | Selección de fecha y horario, persona ficticia, resumen de condiciones, modalidad sin pago o checkout simulado y resultado. |
| `/app/hoy` | Citas del día, conteos de muestra, tareas administrativas y solicitudes de cambio. |
| `/app/agenda` | Listado de citas de la sesión, filtros por fecha/estado y estado vacío. No es todavía un calendario de edición o de arrastrar citas. |
| `/app/citas/muestra-01` | Detalle de cita inicial, pago separado, resultado de asistencia, solicitud de cambio, cancelación con confirmación, próxima acción e historial. |
| `/app/citas/<id-demo>` | Detalle de una reserva creada mientras se navega; al recargar se explica que esa cita temporal ya no existe. |

Las pantallas comparten estado React en memoria mediante navegación interna de Next.js. Una reserva confirmada aparece en la agenda sin recargar. No se utiliza localStorage, cookies de negocio, API, DB ni datos de contacto introducidos por el visitante. Los cambios desaparecen al recargar o pulsar **Reiniciar demo**, con confirmación previa.

## Reglas de muestra y honestidad

Centralizadas en `apps/web/app/demo/model.ts`:

- Un servicio: evaluación inicial de 45 minutos, margen de 15 minutos.
- Zona de prueba: `America/Santiago`; conversión de hora civil a UTC contempla horario de verano.
- Horarios ficticios en días hábiles: 09, 10, 11, 14, 15 y 16 h. Anticipación mínima de 24 h y hasta 30 días calendario.
- Tres personas identificadas como “Persona de muestra A/B/C”; no se pide nombre, teléfono, email ni información clínica reales.
- Importe exclusivamente de demostración: **15.000 CLP ficticios**, elegido para visualizar el checkout; no es un valor comercial ni una recomendación del SRS para cobrar.
- Retención de 10 minutos en modo de pago simulado. Rechazado y pendiente no confirman; se permite reintentar durante la retención. Aprobado confirma; expirado libera el bloque.
- No se confirma una simulación aprobada después de vencer la retención. No hay dinero que conciliar: revisión de pagos reales tardíos sigue pendiente de P2.
- Asistencia/inasistencia sólo se habilitan al terminar una cita confirmada. No se sobrescribe un resultado terminal desde este prototipo; correcciones auditadas se implementarán en la fase funcional.
- Una solicitud de cambio conserva la cita original. Puede cerrarse **sin cambiar el horario**; la reprogramación efectiva y atómica es trabajo posterior.
- Cancelación requiere confirmación, conserva historial y estado del pago y no ejecuta devoluciones.
- Tarea estructurada para el siguiente día hábil (sin calendario de feriados), con responsable de muestra; se puede completar. No hay campo libre para notas clínicas.

El simulador valida disponibilidad y estados para recorrer errores dentro de una sesión. **No constituye garantía transaccional de concurrencia**, autorización ni verificación de pagos en servidor. Otras pestañas/visitantes no comparten estado. Los dos registros iniciales de “Hoy” son fixtures ilustrativos y pueden caer en fin de semana, a diferencia de la disponibilidad propuesta para nuevas reservas.

## Dirección visual y decisiones técnicas

Continúa azul/blanco/negro, tipografía del sistema y marca Nítida Dental. La reserva es un recorrido por pasos; el panel prioriza hora, persona ficticia, estado textual y próxima acción. Móvil usa la misma navegación y contenido sin ocultar límites comerciales.

No se añadieron dependencias, librerías de calendario, fotografías, fuentes ni servicios. CSS Grid/Flex y controles nativos resuelven este primer recorrido con menor carga y mantenimiento que una librería adicional. Three.js se conserva en la landing, no en las tareas administrativas: no aporta claridad a una agenda y no debe competir con su lectura.

Componentes nuevos en `apps/web/app/demo/`: modelo puro, proveedor de estado, shell de navegación, reserva, panel, detalle y estilos acotados con prefijo `demo-`. Las rutas son límites pequeños que reutilizan esos componentes. `app/icon.svg` es un icono propio de marca.

## Ejecutar

Con Node **24.22.0** y pnpm **10.34.7**:

```sh
pnpm dev:web
```

Abrir <http://127.0.0.1:3000/reservar>. No es necesario arrancar API o PostgreSQL para la demo. Si Node local es distinto, usar el runtime fijado sin cambiar instalaciones globales:

```sh
npm exec --yes --package=node@24.22.0 --package=pnpm@10.34.7 -- pnpm dev:web
```

## Verificación realizada

- `pnpm check` con Node 24.22.0/pnpm 10.34.7: lint, tipos, **18 pruebas** (15 web + 3 API) y build web/API correctos.
- 12 pruebas nuevas del modelo: disponibilidad/anticipación, hora de verano/invierno, restricción a personas ficticias, retención, superposición y buffer, pago/no pago, reintento, expiración exacta y aprobación tardía, cancelación, solicitud de cambio, asistencia y tareas.
- Pruebas existentes de la landing actualizadas para enlaces locales nuevos; se conservan comprobaciones de honestidad, recursos visuales y videos sin autoplay.
- Web compilada en `127.0.0.1:3100`, HTTP 200 y navegación mediante Chromium headless / Chrome DevTools Protocol.
- Flujo en navegador: rechazado → pendiente → aprobado; resultado y detalle compartidos con agenda; tarea/completar, solicitud/cierre sin reprogramar, cancelar/conservar y cancelar/confirmar.
- También se probaron vencimiento, reserva sin pago, reserva en viewport móvil, filtro vacío, reinicio de demo y enlace a una cita temporal después de recargar.
- Cuatro rutas (`/reservar`, `/app/hoy`, `/app/agenda`, detalle inicial) a **320, 390, 768 y 1440 px**, sin scroll horizontal y con un único `h1`. Capturas en carpeta temporal; revisión visual de reserva de escritorio, panel móvil y detalle a 320 px.
- Campos etiquetados, foco de paso y primer avance por teclado comprobados; resultados de acciones en detalle se anuncian con región de estado. Pruebas de navegador con movimiento reducido.
- Ejecución final del script sin excepciones, errores de consola ni solicitudes HTTP externas. No equivale a auditoría exhaustiva de seguridad o accesibilidad.

### Repetir la prueba de navegador

Sin dependencias adicionales, con Chromium disponible:

1. `pnpm --filter @odontologia/web build`.
2. `pnpm --filter @odontologia/web exec next start --hostname 127.0.0.1 --port 3100`.
3. Iniciar una instancia **temporal y aislada** de Chromium con `--headless=new --remote-debugging-address=127.0.0.1 --remote-debugging-port=9444 --user-data-dir=<carpeta-temporal-exclusiva> about:blank`. No usar un perfil personal ni exponer CDP a la red.
4. `pnpm --filter @odontologia/web test:browser`.
5. Cerrar únicamente los procesos de prueba creados. El script no cierra otras instancias.

Script: `apps/web/scripts/check-demo-browser.mjs`. Es una comprobación manual/local aparte de `pnpm check`: exige la web y el navegador ya iniciados. Las capturas se escriben en la carpeta temporal del sistema, no en Git.

## Límites y siguiente corte

No hay autenticación, permisos, aislamiento real por consultorio, persistencia, enlaces seguros de paciente, correo/WhatsApp, Mercado Pago, recordatorios programados ni exportaciones. El importe y las políticas no están aprobados. No se modificó código de API/DB ni se ejecutaron migraciones en esta entrega.

Pendientes de calidad: auditoría integral WCAG/lector de pantalla, zoom de texto, Safari/iOS, dispositivos físicos, métricas de rendimiento y pruebas de usabilidad con personas autorizadas. No se midió reducción de inasistencia ni conversión.

**Siguiente corte recomendado:** P1 del SRS, autenticación + consultorio/permisos + disponibilidad/agenda persistida con datos sintéticos, migraciones revisadas y pruebas transaccionales de superposición. No activar cobros o pacientes reales para probar esa base. Los bloqueos de producción del SRS siguen vigentes.
