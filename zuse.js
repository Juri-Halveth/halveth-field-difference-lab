// Copyright 2026 Juri Janovski. SPDX-License-Identifier: Apache-2.0
import {fourNeighbourPulse, lazyEightNeighbourPulse, pulseMetrics,
  lazyEightNeighbourMetrics} from './experiments/zuse-lattice.js';
import {createEncounterSession, viewEncounterStep} from './experiments/four-encounters.js?v=20261031-chronological-trails';
import {cameraFor, project} from './experiments/zuse-camera.js?v=20261031-chronological-trails';

const stepsInput = document.querySelector('#steps');
const stepValue = document.querySelector('#step-value');
const fourCanvas = document.querySelector('#four-grid');
const eightCanvas = document.querySelector('#eight-grid');
const fourMetrics = document.querySelector('#four-metrics');
const eightMetrics = document.querySelector('#eight-metrics');
const insight = document.querySelector('#insight-text');
const bodyStatus = document.querySelector('#body-status');
const bodySummary = document.querySelector('#body-summary');
const bodyList = document.querySelector('#body-list');
const bodyLog = document.querySelector('#body-log');
const cameraNote = document.querySelector('#camera-note');
const encounterSession = createEncounterSession();
const de = new Intl.NumberFormat('de-DE', {maximumFractionDigits: 4});
const cell = fourCanvas.width / 17;

function drawBackground(ctx, canvas, camera, recursive) {
  ctx.fillStyle = '#081322';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  // The inner lattice follows the same camera as the field and bodies.
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, canvas.width, canvas.height);
  ctx.clip();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(-camera.angle);
  ctx.scale(camera.scale, camera.scale);
  ctx.strokeStyle = '#6383a020';
  ctx.lineWidth = 1;
  const reach = Math.ceil(9 / camera.scale) + 2;
  for (let i = -reach; i <= reach; i++) {
    const p = (i + 0.5) * cell;
    const bound = (reach + 1) * cell;
    ctx.beginPath(); ctx.moveTo(p, -bound); ctx.lineTo(p, bound); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-bound, p); ctx.lineTo(bound, p); ctx.stroke();
  }
  ctx.strokeStyle = '#b7c8df65';
  ctx.beginPath(); ctx.moveTo(0, -canvas.height); ctx.lineTo(0, canvas.height); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-canvas.width, 0); ctx.lineTo(canvas.width, 0); ctx.stroke();
  ctx.restore();
  if (recursive) {
    // Fixed screen guides: one view, four quadrants, four subregions per quadrant.
    ctx.strokeStyle = '#72e9eb2d';
    for (const p of [canvas.width / 4, canvas.width * 3 / 4]) {
      ctx.beginPath(); ctx.moveTo(p, 0); ctx.lineTo(p, canvas.height); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, p); ctx.lineTo(canvas.width, p); ctx.stroke();
    }
    ctx.strokeStyle = '#b7c8df65';
    ctx.beginPath(); ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2); ctx.stroke();
  }
}

function tile(ctx, x, y, camera, inset, color, outline = false) {
  const p = project(x, y, camera);
  const side = Math.max(3, p.unit - inset * 2);
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(-camera.angle);
  if (outline) {
    ctx.strokeStyle = color;
    ctx.strokeRect(-side / 2, -side / 2, side, side);
  } else {
    ctx.fillStyle = color;
    ctx.fillRect(-side / 2, -side / 2, side, side);
  }
  ctx.restore();
  return p;
}

function drawField(canvas, cells, steps, mode, color, camera, model) {
  const ctx = canvas.getContext('2d');
  drawBackground(ctx, canvas, camera, model === 'four' && steps >= 8);
  const maximum = Math.max(...cells.values());
  for (const [address, value] of cells) {
    const [x, y] = address.split(',').map(Number);
    ctx.globalAlpha = mode === 'support' ? 0.9 :
      Math.max(0.025, Math.sqrt(value / maximum));
    tile(ctx, x, y, camera, Math.max(2, cell * camera.scale * 0.1), color);
  }
  ctx.globalAlpha = 1;
  ctx.lineWidth = 1.5;
  tile(ctx, 0, 0, camera, 6, '#ffffffa0', true);
  if (model === 'eight' && steps > 0) {
    // The measurement target is not one of the four bodies.
    ctx.setLineDash([4, 3]);
    ctx.lineWidth = 2;
    tile(ctx, steps, steps, camera, 3, '#ffffffd0', true);
    ctx.setLineDash([]);
  }
  const rule = model === 'four' ? 'Vier Nachbarn mit vier Körpern' :
    'Acht Nachbarn mit Verbleib';
  canvas.setAttribute('aria-label',
    `${rule}, Schritt ${steps}: ${cells.size} erreichbare Zellen.`);
}

function drawBodies(snapshot, previous, camera) {
  const ctx = fourCanvas.getContext('2d');
  if (previous) {
    ctx.setLineDash([3, 3]);
    ctx.lineWidth = 1;
    for (const body of previous.agents) tile(ctx, body.x, body.y, camera, 0,
      '#ffffff90', true);
    ctx.setLineDash([]);
  }
  for (const body of snapshot.agents) {
    ctx.beginPath();
    body.trail.forEach((address, index) => {
      const [x, y] = address.split(',').map(Number);
      const p = project(x, y, camera);
      if (index === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.strokeStyle = `hsla(${body.hue}, 95%, 72%, 0.65)`;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.shadowColor = `hsl(${body.hue} 95% 70%)`;
    ctx.shadowBlur = 16;
    ctx.lineWidth = body.id === 'NE' ? 3 : 2;
    const p = tile(ctx, body.x, body.y, camera, 2,
      `hsl(${body.hue} 95% 72%)`, true);
    ctx.shadowBlur = 0;
    if (body.parentId) {
      ctx.lineWidth = 1;
      tile(ctx, body.x, body.y, camera, 6, '#ffffff', true);
    }
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${Math.max(9, Math.min(12, p.unit * 0.36))}px Segoe UI, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(body.id, p.x, p.y);
  }
  fourCanvas.setAttribute('aria-label',
    `Vier Nachbarn, Schritt ${snapshot.step}: ${snapshot.agents.length} ` +
    'eigenständige Quadrate. Ihre Positionen stehen unter dem Gitter.');
}

function describe(metrics, cells, steps) {
  const corner = cells.get(`${steps},${steps}`) ?? 0;
  const cornerText = corner === 0 ? '0' : corner < 0.0001 ?
    corner.toExponential(2) : de.format(corner);
  return '<dt>Gesamtmenge</dt><dd>' + de.format(metrics.mass) +
    '</dd><dt>Varianz X / Y</dt><dd>' + de.format(metrics.secondMomentX) + ' / ' +
    de.format(metrics.secondMomentY) + '</dd><dt>Erreichbare Zellen</dt><dd>' +
    metrics.occupiedCells + '</dd><dt>E[X²Y²]</dt><dd>' +
    de.format(metrics.mixedFourthMoment) + '</dd><dt>Messzelle (' + steps + ',' +
    steps + ')</dt><dd>' + cornerText + '</dd>';
}

function describeBodies(snapshot, camera) {
  const clones = snapshot.agents.filter(body => body.parentId).length;
  bodyStatus.textContent =
    `Vier Paare · Durchlauf ${snapshot.episode} · Schritt ${snapshot.step}`;
  bodySummary.textContent =
    `${snapshot.agents.length} sichtbare Quadrate, ${clones} Abbild${clones === 1 ? '' : 'er'}. ` +
    `Vier anfängliche Gegenrollen; ${encounterSession.episodes.length} frühere Durchläufe in diesem Tab.`;
  cameraNote.textContent =
    `Ansicht: ${de.format(camera.angle * 180 / Math.PI)}° gedreht, ` +
    `${de.format(camera.scale * 100)} % Maßstab. Die Feldwerte bleiben in ihren ursprünglichen Koordinaten.`;
  bodyList.replaceChildren();
  for (const body of snapshot.agents) {
    const item = document.createElement('li');
    const swatch = document.createElement('span');
    swatch.className = 'body-swatch';
    swatch.style.borderColor = `hsl(${body.hue} 95% 72%)`;
    swatch.style.setProperty('--swatch-color', `hsl(${body.hue} 95% 72%)`);
    swatch.setAttribute('aria-hidden', 'true');
    const label = document.createElement('span');
    label.textContent =
      `${body.instanceId} · (${body.x}, ${body.y}) · ${body.counterRoleId}` +
      (body.parentInstanceId ? ` · Abbild von ${body.parentInstanceId}` : '');
    item.append(swatch, label);
    bodyList.append(item);
  }
  bodyLog.replaceChildren();
  if (snapshot.step === 0) {
    const item = document.createElement('li');
    item.textContent =
      'Vier Plätze: NE, NW, SW, SE. Der gelbe NE-Rahmen hat jetzt einen eigenen Zustand.';
    bodyLog.append(item);
  }
  for (const choice of snapshot.choices) {
    const item = document.createElement('li');
    const action = choice.action.startsWith('CLONE_') ? 'bildet ein Abbild' :
      choice.action === 'STAY' ? 'bleibt' : `zieht ${choice.action}`;
    item.textContent =
      `${choice.instanceId} ${action} bei ${choice.to}. ` +
      `Gegenrolle: ${choice.action}; Feldvorschlag: ${choice.fieldProposal === 'NO_SIGNAL' ? 'kein Signal' : choice.fieldProposal}.`;
    bodyLog.append(item);
  }
}

function render() {
  const steps = Number(stepsInput.value);
  const mode = document.querySelector('input[name="view"]:checked').value;
  const fourCells = fourNeighbourPulse(steps);
  const eightCells = lazyEightNeighbourPulse(steps);
  const four = pulseMetrics(steps);
  const eight = lazyEightNeighbourMetrics(steps);
  const encounter = viewEncounterStep(encounterSession, steps);
  const previous = encounterSession.episodes.at(-1)?.snapshots[steps];
  const fourCamera = cameraFor(steps, 'four',
    encounter.agents.concat(previous?.agents ?? []));
  const eightCamera = cameraFor(steps, 'eight');
  stepValue.value = String(steps);
  drawField(fourCanvas, fourCells, steps, mode, '#72e9eb', fourCamera, 'four');
  drawBodies(encounter, previous, fourCamera);
  drawField(eightCanvas, eightCells, steps, mode, '#ffa0ce', eightCamera, 'eight');
  fourMetrics.innerHTML = describe(four, fourCells, steps);
  eightMetrics.innerHTML = describe(eight, eightCells, steps);
  describeBodies(encounter, fourCamera);
  insight.textContent = steps === 0 ?
    'Ein Impuls beginnt im Zentrum. Vier eigenständige Quadrate stehen an seinen vier Ecken.' :
    `Nach ${steps} Schritten haben beide Feldregeln dieselbe Varianz ` +
    `(${de.format(steps / 2)} je Achse). Die Messzelle (${steps},${steps}) ` +
    'erreicht nur Regel B. Die vier Quadrate auf Regel A bewegen sich unabhängig davon.';
}

stepsInput.addEventListener('input', render);
document.querySelectorAll('input[name="view"]').forEach(input =>
  input.addEventListener('change', render));
render();
