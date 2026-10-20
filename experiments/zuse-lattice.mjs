// Copyright 2026 Juri Janovski. SPDX-License-Identifier: Apache-2.0
// A bounded, original four-neighbour pulse model inspired by the question in
// Konrad Zuse, "Rechnender Raum" (1967). This is a software model, not physics.

const DIRECTIONS = [[1, 0], [-1, 0], [0, 1], [0, -1]];
const key = (x, y) => `${x},${y}`;

export function fourNeighbourPulse(steps) {
  if (!Number.isInteger(steps) || steps < 0 || steps > 64) {
    throw new RangeError('steps must be an integer from 0 to 64');
  }
  let cells = new Map([[key(0, 0), 1]]);
  for (let t = 0; t < steps; t++) {
    const next = new Map();
    for (const [address, value] of cells) {
      const [x, y] = address.split(',').map(Number);
      for (const [dx, dy] of DIRECTIONS) {
        const destination = key(x + dx, y + dy);
        next.set(destination, (next.get(destination) ?? 0) + value / 4);
      }
    }
    cells = next;
  }
  return cells;
}

export function pulseMetrics(steps) {
  const cells = fourNeighbourPulse(steps);
  let mass = 0;
  let axisRadius = 0;
  let diagonalRadius = 0;
  let secondMomentX = 0;
  let secondMomentY = 0;
  for (const [address, value] of cells) {
    const [x, y] = address.split(',').map(Number);
    mass += value;
    secondMomentX += x * x * value;
    secondMomentY += y * y * value;
    if (x === 0 || y === 0) axisRadius = Math.max(axisRadius, Math.hypot(x, y));
    if (Math.abs(x) === Math.abs(y)) {
      diagonalRadius = Math.max(diagonalRadius, Math.hypot(x, y));
    }
  }
  return {model: 'FOUR_NEIGHBOUR_PULSE_V1', steps, mass,
    occupiedCells: cells.size, axisRadius, diagonalRadius,
    secondMomentX, secondMomentY};
}
