// Captura la demo local y compone cuatro fotogramas editoriales para un resumen de 10 s.
// Requiere Next en :3100 y Chromium aislado con CDP en :9444. Sin dependencias npm.
import { Buffer } from 'node:buffer';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
const output = join(tmpdir(), 'nitida-resumen-10s');
mkdirSync(output, { recursive: true });
const tabs = await (await fetch('http://127.0.0.1:9444/json')).json();
const ws = new WebSocket(tabs.find(t => t.type === 'page').webSocketDebuggerUrl);
await new Promise(resolve => ws.addEventListener('open', resolve, { once: true }));
let sequence = 0;
const pending = new Map();
ws.addEventListener('message', event => {
  const response = JSON.parse(event.data);
  if (!response.id) return;
  const task = pending.get(response.id); pending.delete(response.id);
  if (response.error) task.reject(response.error); else task.resolve(response.result);
});
function send(method, params = {}) {
  return new Promise((resolve, reject) => { const id = ++sequence; pending.set(id, { resolve, reject }); ws.send(JSON.stringify({ id, method, params })); });
}
async function evaluate(expression) {
  const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
  return result.result.value;
}
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
async function until(expression) {
  for (let i = 0; i < 80; i++) { if (await evaluate(expression)) return; await wait(100); }
  throw new Error(`No se pudo capturar: ${expression}`);
}
async function navigate(path) {
  await send('Page.navigate', { url: `http://127.0.0.1:3100${path}` });
  await until(`document.readyState === 'complete' && document.querySelector('.demo-app') && !document.body.innerText.includes('Preparando')`);
  await wait(250);
}
async function shot(composed = false) {
  const image = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: composed, ...(composed ? { clip: { x: 0, y: 0, width: 1920, height: 1080, scale: 1 } } : {}) });
  return image.data;
}
const click = text => evaluate(`(() => {const b = [...document.querySelectorAll('button')].find(b => b.textContent.includes(${JSON.stringify(text)})); if(!b || b.disabled) throw new Error('Acción no disponible'); b.click()})()`);
try {
  await send('Page.enable'); await send('Runtime.enable');
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  await send('Emulation.setDeviceMetricsOverride', { width: 1120, height: 800, deviceScaleFactor: 1, mobile: false });
  await navigate('/reservar');
  await evaluate(`document.querySelector('input[name="horario"]:not(:disabled)').click(); window.scrollTo(0,280)`);
  await wait(200);
  const reservation = await shot();
  await click('Revisar reserva');
  await until(`document.body.innerText.includes('Todo claro antes')`);
  await evaluate(`document.querySelector('input[type="checkbox"]').click()`);
  await click('Ir a la simulación');
  await until(`!!document.querySelector('.demo-checkout')`);
  await evaluate('window.scrollTo(0,250)');
  const checkout = await shot();
  await click('Simular aprobado');
  await until(`!!document.querySelector('.demo-result')`);
  await evaluate(`document.querySelector('nav a[href="/app/hoy"]').click()`);
  await until(`location.pathname === '/app/hoy' && document.body.innerText.includes('Agenda del día')`);
  await evaluate('window.scrollTo(0,170)');
  const agenda = await shot();
  await navigate('/app/citas/muestra-01');
  await click('Crear próxima acción');
  await until(`document.body.innerText.includes('Marcar tarea completada')`);
  await evaluate('window.scrollTo(0,210)');
  const detail = await shot();
  const scenes = [
    { image: reservation, title: 'De la idea<br>a la reserva.', label: '01 / RESERVA', caption: 'Fecha, horario y evaluación.<br>Un recorrido de muestra completo.', foot: 'Datos ficticios · sin atención real' },
    { image: checkout, title: 'Pago, sólo<br>simulado.', label: '02 / CHECKOUT DE PRUEBA', caption: 'Aprobado, rechazado o pendiente.<br>Sin mover dinero.', foot: 'Sin conexión con Mercado Pago' },
    { image: agenda, title: 'El día,<br>más claro.', label: '03 / AGENDA', caption: 'Citas, estados y próximas acciones.<br>Todo en un mismo panel.', foot: 'Responsive · móvil y escritorio' },
    { image: detail, title: 'Seguimiento.<br>Sin perder<br>el hilo.', label: '04 / AVANCE VERIFICADO', caption: '18 pruebas + revisión en navegador.<br>Próximo: autenticación y persistencia.', foot: 'Demo en memoria · se reinicia al recargar' },
  ];
  await send('Emulation.setDeviceMetricsOverride', { width: 1920, height: 1080, deviceScaleFactor: 1, mobile: false });
  await send('Emulation.setPageScaleFactor', { pageScaleFactor: 1 });
  await send('Page.navigate', { url: 'about:blank' });
  await wait(200);
  const { frameTree } = await send('Page.getFrameTree');
  for (let i = 0; i < scenes.length; i++) {
    const scene = scenes[i];
    const html = `<!doctype html><html lang="es"><meta charset="utf-8"><style>
      *{box-sizing:border-box}html{width:1920px;height:1080px;overflow:hidden}body{position:relative;margin:0;background:#f3f6fc;color:#080c14;font-family:'Segoe UI',Arial,sans-serif;width:1920px;height:1080px;overflow:hidden}
      header{position:absolute;left:76px;right:76px;top:42px;display:flex;align-items:center;justify-content:space-between}.brand{font-size:49px;font-weight:600;letter-spacing:-3px}.brand span{color:#145dff}.tag{font-size:18px;letter-spacing:3px;color:#536174}
      .copy{position:absolute;left:76px;top:213px;width:610px}.label{color:#1048c7;font-size:19px;letter-spacing:3px;font-weight:600}h1{font-size:82px;line-height:1.06;letter-spacing:-5px;font-weight:500;margin:36px 0 32px}.caption{font-size:25px;line-height:1.6;color:#536174}.foot{margin-top:39px;padding-top:23px;border-top:1px solid #c6d2e7;font-size:18px;color:#536174}
      .screen{position:absolute;left:740px;top:160px;width:1104px;height:811px;border:1px solid #c6d2e7;border-radius:17px;overflow:hidden;background:white;box-shadow:0 25px 70px #0c1a3515}.chrome{height:35px;background:white;border-bottom:1px solid #dce3ef;display:flex;align-items:center;padding:0 15px;gap:7px}.chrome i{width:7px;height:7px;border-radius:50%;background:#b4c2d8}.chrome span{margin-left:18px;font-size:12px;color:#536174}.screen img{display:block;width:1102px;height:auto}
      footer{position:absolute;bottom:34px;left:76px;right:76px;display:flex;justify-content:space-between;color:#536174;font-size:16px}.steps{position:absolute;left:76px;bottom:136px;display:flex;gap:10px}.steps b{display:block;height:5px;width:123px;background:#cbd6e8}.steps b.active{background:#145dff}
    </style><header><div class="brand">nítida<span>.</span></div><div class="tag">RESUMEN DEL PROYECTO / 10 SEGUNDOS</div></header><div class="copy"><div class="label">${scene.label}</div><h1>${scene.title}</h1><div class="caption">${scene.caption}</div><p class="foot">${scene.foot}</p></div><div class="screen"><div class="chrome"><i></i><i></i><i></i><span>CAPTURA REAL DEL PROTOTIPO LOCAL</span></div><img src="data:image/png;base64,${scene.image}" alt=""></div><div class="steps">${scenes.map((_, index) => `<b class="${index <= i ? 'active' : ''}"></b>`).join('')}</div><footer><span>PROTOTIPO · SIN COBROS NI ENVÍOS REALES</span><span>Voz sintética local · Nítida Dental</span></footer></html>`;
    await send('Page.setDocumentContent', { frameId: frameTree.frame.id, html });
    await until(`[...document.images].every(image => image.complete && image.naturalWidth > 0)`);
    await evaluate('window.scrollTo(0,0); document.documentElement.scrollTop = 0; document.body.scrollTop = 0');
    await wait(150);
    writeFileSync(join(output, `scene-${i + 1}.png`), Buffer.from(await shot(true), 'base64'));
  }
  console.log(`Cuatro escenas reales compuestas en ${output}`);
} finally { ws.close(); }
