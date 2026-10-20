// Copyright 2026 Juri Janovski. SPDX-License-Identifier: Apache-2.0
import {fourNeighbourPulse, lazyEightNeighbourPulse, pulseMetrics,
  lazyEightNeighbourMetrics} from './experiments/zuse-lattice.js';

const stepsInput = document.querySelector('#steps');
const stepValue = document.querySelector('#step-value');
const fourCanvas = document.querySelector('#four-grid');
const eightCanvas = document.querySelector('#eight-grid');
const fourMetrics = document.querySelector('#four-metrics');
const eightMetrics = document.querySelector('#eight-metrics');
const insight = document.querySelector('#insight-text');
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

function render() {
  const steps = Number(stepsInput.value);
  const mode = document.querySelector('input[name="view"]:checked').value;
  const fourCells = fourNeighbourPulse(steps);
  const eightCells = lazyEightNeighbourPulse(steps);
  const four = pulseMetrics(steps);
  const eight = lazyEightNeighbourMetrics(steps);
  stepValue.value = String(steps);
  draw(fourCanvas, fourCells, steps, mode, '#72e9eb');
  draw(eightCanvas, eightCells, steps, mode, '#ffa0ce');
  fourMetrics.innerHTML = describe(four, fourCells, steps);
  eightMetrics.innerHTML = describe(eight, eightCells, steps);
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
