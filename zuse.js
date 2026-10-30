// Copyright 2026 Juri Janovski. SPDX-License-Identifier: Apache-2.0
import {fourNeighbourPulse, lazyEightNeighbourPulse, pulseMetrics,
  lazyEightNeighbourMetrics} from './experiments/zuse-lattice.js';
import {createEncounterSession, viewEncounterStep} from './experiments/four-encounters.js';

const stepsInput = document.querySelector('#steps');
const stepValue = document.querySelector('#step-value');
const fourCanvas = document.querySelector('#four-grid');
const eightCanvas = document.querySelector('#eight-grid');
const fourMetrics = document.querySelector('#four-metrics');
const eightMetrics = document.querySelector('#eight-metrics');
const insight = document.querySelector('#insight-text');
const encounterCanvas = document.querySelector('#encounter-grid');
const encounterStatus = document.querySelector('#encounter-status');
const encounterSummary = document.querySelector('#encounter-summary');
const encounterEntities = document.querySelector('#encounter-entities');
const encounterLog = document.querySelector('#encounter-log');
const encounterSession = createEncounterSession();
const de = new Intl.NumberFormat('de-DE', {maximumFractionDigits: 4});
const span = 17;
const cell = fourCanvas.width / span;

function pos(x, y) {
  return [(x + 8) * cell, (8 - y) * cell];
}

function draw(canvas, cells, steps, mode, color) {
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#081322';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = '#6383a020';
  ctx.lineWidth = 1;
  for (let i = 0; i <= span; i++) {
    const coordinate = i * cell + 0.5;
    ctx.beginPath(); ctx.moveTo(coordinate, 0); ctx.lineTo(coordinate, canvas.height); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, coordinate); ctx.lineTo(canvas.width, coordinate); ctx.stroke();
  }
  ctx.strokeStyle = '#b7c8df65';
  ctx.beginPath(); ctx.moveTo(8.5 * cell, 0); ctx.lineTo(8.5 * cell, canvas.height); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, 8.5 * cell); ctx.lineTo(canvas.width, 8.5 * cell); ctx.stroke();

  const max = Math.max(...cells.values());
  for (const [address, value] of cells) {
    const [x, y] = address.split(',').map(Number);
    const [px, py] = pos(x, y);
    const alpha = mode === 'support' ? 0.9 : Math.max(0.025, Math.sqrt(value / max));
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.fillRect(px + 3, py + 3, cell - 6, cell - 6);
  }
  ctx.globalAlpha = 1;
  const [originX, originY] = pos(0, 0);
  ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2;
  ctx.strokeRect(originX + 6, originY + 6, cell - 12, cell - 12);
  if (steps > 0) {
    const [targetX, targetY] = pos(steps, steps);
    ctx.strokeStyle = '#ffd98b'; ctx.lineWidth = 3;
    ctx.strokeRect(targetX + 3, targetY + 3, cell - 6, cell - 6);
  }
  const rule = canvas === fourCanvas ? 'Vier-Nachbarn-Regel' : 'Acht-Nachbarn-Regel mit Verbleib';
  canvas.setAttribute('aria-label', rule + ', Schritt ' + steps + ': ' + cells.size +
    ' erreichbare Zellen. Messwerte stehen direkt darunter.');
}

function describe(metrics, cells, steps) {
  const corner = cells.get(steps + ',' + steps) ?? 0;
  const cornerText = corner === 0 ? '0' : corner < 0.0001 ? corner.toExponential(2) : de.format(corner);
  return '<dt>Gesamtmenge</dt><dd>' + de.format(metrics.mass) +
    '</dd><dt>Varianz X / Y</dt><dd>' + de.format(metrics.secondMomentX) + ' / ' +
    de.format(metrics.secondMomentY) + '</dd><dt>Erreichbare Zellen</dt><dd>' +
    metrics.occupiedCells + '</dd><dt>E[X²Y²]</dt><dd>' +
    de.format(metrics.mixedFourthMoment) + '</dd><dt>Menge bei (' + steps + ',' +
    steps + ')</dt><dd>' + cornerText + '</dd>';
}

function drawEncounter(snapshot, wave, previous) {
  const ctx = encounterCanvas.getContext('2d');
  ctx.fillStyle = '#081322';
  ctx.fillRect(0, 0, encounterCanvas.width, encounterCanvas.height);
  ctx.strokeStyle = '#6383a030';
  ctx.lineWidth = 1;
  for (let i = 0; i <= span; i++) {
    const coordinate = i * cell + 0.5;
    ctx.beginPath(); ctx.moveTo(coordinate, 0); ctx.lineTo(coordinate, encounterCanvas.height); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, coordinate); ctx.lineTo(encounterCanvas.width, coordinate); ctx.stroke();
  }
  const maximum = Math.max(...wave.values());
  for (const [address, value] of wave) {
    const [x, y] = address.split(',').map(Number);
    const [px, py] = pos(x, y);
    ctx.fillStyle = `rgba(88, 224, 244, ${Math.max(0.06, Math.sqrt(value / maximum) * 0.62)})`;
    ctx.fillRect(px + 4, py + 4, cell - 8, cell - 8);
  }
  if (previous) {
    ctx.save();
    ctx.strokeStyle = '#ffffffa8';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 3]);
    for (const agent of previous.agents) {
      const [px, py] = pos(agent.x, agent.y);
      ctx.strokeRect(px + 1, py + 1, cell - 2, cell - 2);
    }
    ctx.restore();
  }
  for (const agent of snapshot.agents) {
    ctx.strokeStyle = `hsla(${agent.hue}, 90%, 70%, 0.52)`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    agent.visited.forEach((address, index) => {
      const [x, y] = address.split(',').map(Number);
      const [px, py] = pos(x, y);
      if (index === 0) ctx.moveTo(px + cell / 2, py + cell / 2);
      else ctx.lineTo(px + cell / 2, py + cell / 2);
    });
    ctx.stroke();
    const [px, py] = pos(agent.x, agent.y);
    ctx.fillStyle = `hsl(${agent.hue} 88% 70%)`;
    ctx.fillRect(px + 3, py + 3, cell - 6, cell - 6);
    if (agent.parentId) {
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.strokeRect(px + 1, py + 1, cell - 2, cell - 2);
    }
    ctx.fillStyle = '#07111e';
    ctx.font = 'bold 12px Segoe UI, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(agent.id, px + cell / 2, py + cell / 2);
  }
  encounterCanvas.setAttribute('aria-label', `Durchlauf ${snapshot.episode}, Schritt ${snapshot.step}: ` +
    `${snapshot.agents.length} Modellquadrate. Die Positionen und Entscheidungen stehen rechts.`);
}

function describeEncounter(snapshot, previous) {
  const clones = snapshot.agents.filter(agent => agent.parentId).length;
  const charge = snapshot.agents.reduce((sum, agent) => sum + agent.charge, 0);
  encounterStatus.textContent = `Durchlauf ${snapshot.episode} · Schritt ${snapshot.step}`;
  encounterSummary.textContent = `${snapshot.agents.length} Quadrate, davon ${clones} Abbild${clones === 1 ? '' : 'er'}. ` +
    `Verfolgte Gesamtmenge: ${de.format(charge)}. ` +
    `${encounterSession.episodes.length} frühere Durchläufe im offenen Tab gespeichert` +
    (previous ? `; Vergleich mit Durchlauf ${previous.episode} bei demselben Schritt.` : '.');
  encounterEntities.replaceChildren();
  for (const agent of snapshot.agents) {
    const item = document.createElement('li');
    const swatch = document.createElement('span');
    swatch.className = 'encounter-swatch';
    swatch.style.backgroundColor = `hsl(${agent.hue} 88% 70%)`;
    swatch.setAttribute('aria-hidden', 'true');
    const older = previous?.agents.find(other => other.id === agent.id);
    const label = document.createElement('span');
    label.textContent = `${agent.instanceId} · Farbton ${agent.hue}° · (${agent.x},${agent.y})` +
      `${agent.parentInstanceId ? ` · Abbild von ${agent.parentInstanceId}` : ''}` +
      ` · Menge ${de.format(agent.charge)}` +
      (older ? ` · Vergleich ${older.instanceId}: (${older.x},${older.y})` : '');
    item.append(swatch, label);
    encounterEntities.append(item);
  }
  encounterLog.replaceChildren();
  if (snapshot.step === 0) {
    const item = document.createElement('li');
    item.textContent = 'Vier Startplätze sind bereit. Bewege den Regler für die ersten Züge.';
    encounterLog.append(item);
    return;
  }
  for (const choice of snapshot.choices) {
    const item = document.createElement('li');
    const verb = choice.action.startsWith('CLONE_') ? 'bildet ein Abbild bei' :
      choice.action === 'STAY' ? 'bleibt bei' : 'zieht nach';
    item.textContent = `${choice.instanceId} ${verb} ${choice.to} · Regelwert ${de.format(choice.score)} ` +
      `aus ${choice.candidates.length} möglichen Zügen.`;
    encounterLog.append(item);
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
  stepValue.value = String(steps);
  draw(fourCanvas, fourCells, steps, mode, '#72e9eb');
  draw(eightCanvas, eightCells, steps, mode, '#ffa0ce');
  fourMetrics.innerHTML = describe(four, fourCells, steps);
  eightMetrics.innerHTML = describe(eight, eightCells, steps);
  drawEncounter(encounter, eightCells, previous);
  describeEncounter(encounter, previous);
  insight.textContent = steps === 0 ?
    'Am Anfang liegen beide Regeln in derselben Zelle (0,0). Bewege den Regler, um ihre verschiedenen Übergänge zu sehen.' :
    'Nach ' + steps + (steps === 1 ? ' Schritt haben' : ' Schritten haben') +
    ' beide Regeln dieselbe Varianz (' + de.format(steps / 2) +
    ' je Achse). Die markierte Zelle (' + steps + ',' + steps +
    ') erreicht nur Regel B. Das gemischte Moment beträgt ' +
    de.format(four.mixedFourthMoment) + ' gegenüber ' +
    de.format(eight.mixedFourthMoment) + '.';
}

stepsInput.addEventListener('input', render);
document.querySelectorAll('input[name="view"]').forEach(input => input.addEventListener('change', render));
render();
