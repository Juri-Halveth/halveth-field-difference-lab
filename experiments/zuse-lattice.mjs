// Copyright 2026 Juri Janovski. SPDX-License-Identifier: Apache-2.0
// A bounded, original four-neighbour pulse model inspired by the question in
// Konrad Zuse, "Rechnender Raum" (1967). This is a software model, not physics.

const FOUR_NEIGHBOUR_KERNEL = [
  [1, 0, 1 / 4], [-1, 0, 1 / 4], [0, 1, 1 / 4], [0, -1, 1 / 4],
];
// A declared comparison model: the eight adjacent cells each receive 1/12;
// the source cell retains 1/3. Both kernels have Var(x) = Var(y) = 1/2 per step.
const LAZY_EIGHT_NEIGHBOUR_KERNEL = [
  [1, 0, 1 / 12], [-1, 0, 1 / 12], [0, 1, 1 / 12], [0, -1, 1 / 12],
  [1, 1, 1 / 12], [1, -1, 1 / 12], [-1, 1, 1 / 12], [-1, -1, 1 / 12],
  [0, 0, 1 / 3],
];
const key = (x, y) => `${x},${y}`;

function pulse(steps, kernel) {
  if (!Number.isInteger(steps) || steps < 0 || steps > 64) {
    throw new RangeError('steps must be an integer from 0 to 64');
  }
  let cells = new Map([[key(0, 0), 1]]);
  for (let t = 0; t < steps; t++) {
    const next = new Map();
    for (const [address, value] of cells) {
      const [x, y] = address.split(',').map(Number);
      for (const [dx, dy, weight] of kernel) {
        const destination = key(x + dx, y + dy);
        next.set(destination, (next.get(destination) ?? 0) + value * weight);
      }
    }
    cells = next;
  }
  return cells;
}

export function fourNeighbourPulse(steps) {
  return pulse(steps, FOUR_NEIGHBOUR_KERNEL);
}

export function lazyEightNeighbourPulse(steps) {
  return pulse(steps, LAZY_EIGHT_NEIGHBOUR_KERNEL);
}

function metrics(steps, cells, model) {
  let mass = 0;
  let axisRadius = 0;
  let diagonalRadius = 0;
  let secondMomentX = 0;
  let secondMomentY = 0;
  let mixedFourthMoment = 0;
  for (const [address, value] of cells) {
    const [x, y] = address.split(',').map(Number);
    mass += value;
    secondMomentX += x * x * value;
    secondMomentY += y * y * value;
    mixedFourthMoment += x * x * y * y * value;
    if (x === 0 || y === 0) axisRadius = Math.max(axisRadius, Math.hypot(x, y));
    if (Math.abs(x) === Math.abs(y)) {
      diagonalRadius = Math.max(diagonalRadius, Math.hypot(x, y));
    }
  }
  return {model, steps, mass,
    occupiedCells: cells.size, axisRadius, diagonalRadius,
    secondMomentX, secondMomentY, mixedFourthMoment};
}

export function pulseMetrics(steps) {
  return metrics(steps, fourNeighbourPulse(steps), 'FOUR_NEIGHBOUR_PULSE_V1');
}

export function lazyEightNeighbourMetrics(steps) {
  return metrics(steps, lazyEightNeighbourPulse(steps), 'LAZY_EIGHT_NEIGHBOUR_PULSE_V1');
}
