// Copyright 2026 Juri Janovski. SPDX-License-Identifier: Apache-2.0
// A view transform only. The lattice values and metrics never change.
export const VIEW_HALF_EXTENT = 8;
const CANVAS_HALF_UNITS = 8.5;
const HALF_TILE_FOOTPRINT = 0.5;

export function rotate(x, y, angle) {
  return {x: x * Math.cos(angle) - y * Math.sin(angle),
    y: x * Math.sin(angle) + y * Math.cos(angle)};
}

function extentAt(step, model, agents, angle) {
  const cosine = Math.cos(angle);
  const sine = Math.sin(angle);
  let extent = model === 'four' ? step * Math.max(cosine, sine) : step;
  for (const agent of agents) {
    const points = [{x: agent.x, y: agent.y}].concat(
      (agent.visited ?? []).map(address => {
        const [x, y] = address.split(',').map(Number);
        return {x, y};
      }));
    for (const point of points) {
      const projected = rotate(point.x, point.y, angle);
      extent = Math.max(extent, Math.abs(projected.x), Math.abs(projected.y));
    }
  }
  return extent;
}

function footprint(angle) {
  return HALF_TILE_FOOTPRINT * (Math.cos(angle) + Math.sin(angle));
}

export function cameraFor(step, model, agents = []) {
  if (!Number.isInteger(step) || step < 0 || step > 64) {
    throw new RangeError('step must be an integer from 0 to 64');
  }
  if (model !== 'four' && model !== 'eight') throw new TypeError('unknown model');
  let angle = 0;
  if (model === 'four' && step > VIEW_HALF_EXTENT) {
    const fits = theta =>
      extentAt(step, model, [], theta) + footprint(theta) <= CANVAS_HALF_UNITS;
    if (fits(Math.PI / 4)) {
      let low = 0;
      let high = Math.PI / 4;
      for (let i = 0; i < 40; i++) {
        const middle = (low + high) / 2;
        if (fits(middle)) high = middle;
        else low = middle;
      }
      angle = high;
    } else {
      angle = Math.PI / 4;
    }
  }
  const extent = extentAt(step, model, agents, angle);
  const scale = Math.min(1, CANVAS_HALF_UNITS / (extent + footprint(angle)));
  return {angle, scale, extent, model};
}

export function project(x, y, camera, canvasSize = 544) {
  const coordinate = rotate(x, y, camera.angle);
  const unit = canvasSize / 17 * camera.scale;
  return {x: canvasSize / 2 + coordinate.x * unit,
    y: canvasSize / 2 - coordinate.y * unit, unit};
}
