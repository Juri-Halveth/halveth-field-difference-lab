import {CENTRAL, BOUNDARY, simulateCentral, simulateBoundary, boundaryStateAt} from './physics.js';

const worlds = [
  {kappa: 0, title: 'Anziehung', detail: 'Referenzfeld', color: '#78f1ef'},
  {kappa: 0.5, title: 'Abgeschwächt', detail: 'halbe Feldstärke', color: '#ffc884'},
  {kappa: 1, title: 'Kompensiert', detail: 'a = 0 · Bewegung bleibt', color: '#b6a4ff'},
  {kappa: 1.4, title: 'Repulsiver Modellmodus', detail: 'gesetzte Gegenkraft', color: '#f989bf'},
].map(world => ({...world, path: simulateCentral(world.kappa)}));

const worldGrid = document.querySelector('#world-grid');
const boundaryCanvas = document.querySelector('#boundary-canvas');
const timeSlider = document.querySelector('#time');
const timeLabel = document.querySelector('#time-label');
const playButton = document.querySelector('#play');
const resetButton = document.querySelector('#reset');
const kappaSlider = document.querySelector('#kappa-right');
const kappaValue = document.querySelector('#kappa-value');
const stageKappa = document.querySelector('#stage-kappa');
const boundaryMetrics = document.querySelector('#boundary-metrics');
let activeTab = 'worlds';
let fraction = 0;
let playing = !matchMedia('(prefers-reduced-motion: reduce)').matches;
let lastFrame = 0;
let boundaryOptions = {...BOUNDARY};
let boundaryPath = simulateBoundary(boundaryOptions);

const fmt = (n, digits = 2) => n.toFixed(digits).replace('.', ',');
function makeWorldCard(world) {
  const card = document.createElement('article');
  card.className = 'world-card';
  card.style.setProperty('--world', world.color);
  card.innerHTML = `<div class="world-top"><div><p>WELT ${worlds.indexOf(world) + 1}</p><h3>${world.title}</h3><p>${world.detail}</p></div><strong style="color:${world.color}">κ ${fmt(world.kappa,1)}</strong></div><canvas width="700" height="420" role="img" aria-label="Bahn für ${world.title} bei Kappa ${world.kappa}"></canvas><div class="world-readout"><span>POSITION <b class="position"></b></span><span>GESCHWINDIGKEIT <b class="speed"></b></span><span>|a| <b class="accel"></b></span></div>`;
  world.canvas = card.querySelector('canvas');
  world.readout = {
    position: card.querySelector('.position'),
    speed: card.querySelector('.speed'),
    accel: card.querySelector('.accel'),
  };
  worldGrid.append(card);
}
worlds.forEach(makeWorldCard);

function map(x, y, canvas, bounds) {
  const [xmin, xmax, ymin, ymax] = bounds;
  const scale = Math.min(canvas.width / (xmax - xmin), canvas.height / (ymax - ymin));
  return [canvas.width / 2 + (x - (xmin + xmax) / 2) * scale,
    canvas.height / 2 - (y - (ymin + ymax) / 2) * scale];
}

function drawBackdrop(ctx, canvas, bounds, boundary = false) {
  const {width, height} = canvas;
  ctx.fillStyle = '#0b1428'; ctx.fillRect(0, 0, width, height);
  if (boundary) {
    const [lineX] = map(0, 0, canvas, bounds);
    ctx.fillStyle = '#112432'; ctx.fillRect(0, 0, lineX, height);
    ctx.fillStyle = '#2a1730'; ctx.fillRect(lineX, 0, width - lineX, height);
  }
  ctx.lineWidth = 1;
  ctx.strokeStyle = '#ffffff12';
  const [xmin, xmax, ymin, ymax] = bounds;
  for (let x = Math.ceil(xmin); x <= xmax; x++) {
    const [px] = map(x, 0, canvas, bounds);
    ctx.beginPath(); ctx.moveTo(px, 0); ctx.lineTo(px, height); ctx.stroke();
  }
  for (let y = Math.ceil(ymin); y <= ymax; y++) {
    const [, py] = map(0, y, canvas, bounds);
    ctx.beginPath(); ctx.moveTo(0, py); ctx.lineTo(width, py); ctx.stroke();
  }
  const [ox, oy] = map(0, 0, canvas, bounds);
  ctx.strokeStyle = '#ffffff40';
  ctx.beginPath(); ctx.moveTo(ox, 0); ctx.lineTo(ox, height); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, oy); ctx.lineTo(width, oy); ctx.stroke();
  if (boundary) {
    ctx.strokeStyle = '#f8a4d5'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(ox, 0); ctx.lineTo(ox, height); ctx.stroke();
  } else {
    ctx.fillStyle = '#d7e6ff';
    ctx.beginPath(); ctx.arc(ox, oy, 5, 0, Math.PI * 2); ctx.fill();
  }
}

function trace(ctx, canvas, bounds, path, endIndex, color) {
  for (const [limit, opacity, width] of [[path.length - 1, 0.22, 2], [endIndex, 1, 3.5]]) {
    ctx.save(); ctx.globalAlpha = opacity; ctx.strokeStyle = color; ctx.lineWidth = width;
    ctx.lineJoin = 'round'; ctx.beginPath();
    for (let i = 0; i <= limit; i++) {
      const [px, py] = map(path[i].x, path[i].y, canvas, bounds);
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke(); ctx.restore();
  }
  const state = path[endIndex];
  const [px, py] = map(state.x, state.y, canvas, bounds);
  ctx.save(); ctx.shadowColor = color; ctx.shadowBlur = 23;
  ctx.fillStyle = color; ctx.beginPath(); ctx.arc(px, py, 7, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  // Acceleration arrow: direction only; its length is capped for readability.
  const magnitude = Math.hypot(state.ax, state.ay);
  if (magnitude > 1e-7) {
    const length = Math.min(60, 20 + magnitude * 22);
    const ex = px + state.ax / magnitude * length;
    const ey = py - state.ay / magnitude * length;
    const angle = Math.atan2(ey - py, ex - px);
    ctx.strokeStyle = '#fff9'; ctx.fillStyle = '#fff9'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(ex, ey); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(ex, ey);
    ctx.lineTo(ex - 9 * Math.cos(angle - 0.55), ey - 9 * Math.sin(angle - 0.55));
    ctx.lineTo(ex - 9 * Math.cos(angle + 0.55), ey - 9 * Math.sin(angle + 0.55));
    ctx.closePath(); ctx.fill();
  }
}

function drawWorlds() {
  const bounds = [-3.3, 3.3, -3.3, 3.3];
  for (const world of worlds) {
    const ctx = world.canvas.getContext('2d');
    drawBackdrop(ctx, world.canvas, bounds);
    const index = Math.round(fraction * (world.path.length - 1));
    trace(ctx, world.canvas, bounds, world.path, index, world.color);
    const state = world.path[index];
    world.readout.position.textContent = `(${fmt(state.x)}, ${fmt(state.y)})`;
    world.readout.speed.textContent = fmt(Math.hypot(state.vx, state.vy));
    world.readout.accel.textContent = fmt(Math.hypot(state.ax, state.ay));
  }
}

function drawBoundary() {
  const ctx = boundaryCanvas.getContext('2d');
  const bounds = [-2.65, 2.65, -0.85, 3.15];
  drawBackdrop(ctx, boundaryCanvas, bounds, true);
  const index = Math.round(fraction * (boundaryPath.length - 1));
  trace(ctx, boundaryCanvas, bounds, boundaryPath, index, '#f5dbff');
  const state = boundaryPath[index];
  const crossing = boundaryStateAt(state.crossingTime, boundaryOptions);
  const [cx, cy] = map(crossing.x, crossing.y, boundaryCanvas, bounds);
  ctx.fillStyle = '#ffc884'; ctx.beginPath(); ctx.arc(cx, cy, 5, 0, Math.PI * 2); ctx.fill();
  boundaryMetrics.innerHTML = `<dt>Region</dt><dd>${state.region === 'LEFT' ? 'A · links' : 'B · rechts'}</dd><dt>Grenzübertritt</dt><dd>t = ${fmt(state.crossingTime)}</dd><dt>Position</dt><dd>(${fmt(state.x)}, ${fmt(state.y)})</dd><dt>Vertikale Beschleunigung</dt><dd>${fmt(state.ay)} / t²</dd>`;
}

function render() {
  const duration = activeTab === 'worlds' ? CENTRAL.duration : BOUNDARY.duration;
  timeLabel.value = fmt(fraction * duration);
  timeSlider.value = Math.round(fraction * 1000);
  if (activeTab === 'worlds') drawWorlds(); else drawBoundary();
}

function updatePlayLabel() {
  playButton.innerHTML = playing ? 'Ⅱ <span>Pausieren</span>' : '▷ <span>Abspielen</span>';
  playButton.setAttribute('aria-label', playing ? 'Animation pausieren' : 'Animation abspielen');
}

function selectTab(tab) {
  activeTab = tab;
  fraction = 0;
  document.querySelector('#worlds').hidden = tab !== 'worlds';
  document.querySelector('#boundary').hidden = tab !== 'boundary';
  for (const id of ['worlds', 'boundary']) {
    document.querySelector(`#tab-${id}`).setAttribute('aria-selected', String(id === tab));
  }
  render();
}

document.querySelector('#tab-worlds').addEventListener('click', () => selectTab('worlds'));
document.querySelector('#tab-boundary').addEventListener('click', () => selectTab('boundary'));
playButton.addEventListener('click', () => {playing = !playing; updatePlayLabel();});
resetButton.addEventListener('click', () => {fraction = 0; render();});
timeSlider.addEventListener('input', () => {fraction = Number(timeSlider.value) / 1000; playing = false; updatePlayLabel(); render();});
kappaSlider.addEventListener('input', () => {
  boundaryOptions = {...BOUNDARY, kappaRight: Number(kappaSlider.value)};
  boundaryPath = simulateBoundary(boundaryOptions);
  kappaValue.value = fmt(boundaryOptions.kappaRight, 2);
  stageKappa.textContent = fmt(boundaryOptions.kappaRight, 2);
  render();
});

function animate(now) {
  if (playing && lastFrame) {
    const durationMs = activeTab === 'worlds' ? 9500 : 12000;
    fraction = (fraction + Math.min(now - lastFrame, 100) / durationMs) % 1;
    render();
  }
  lastFrame = now;
  requestAnimationFrame(animate);
}
updatePlayLabel();
render();
requestAnimationFrame(animate);
