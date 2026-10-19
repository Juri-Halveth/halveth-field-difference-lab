import test from 'node:test';
import assert from 'node:assert/strict';
import {CENTRAL, BOUNDARY, centralAcceleration, simulateCentral, simulateBoundary, boundaryStateAt} from './physics.js';

const near = (a, b, tolerance = 1e-9) => assert.ok(Math.abs(a - b) < tolerance, `${a} != ${b}`);

test('kappa=1 cancels acceleration but retains initial velocity', () => {
  const path = simulateCentral(1);
  const last = path.at(-1);
  near(last.x, CENTRAL.initialPosition[0]);
  near(last.y, CENTRAL.initialPosition[1] + CENTRAL.initialVelocity[1] * CENTRAL.duration);
  near(last.vy, CENTRAL.initialVelocity[1]);
  near(last.ax, 0);
  near(last.ay, 0);
});

test('same seed changes radial acceleration sign across kappa=1', () => {
  assert.ok(centralAcceleration([1, 0], 0)[0] < 0);
  near(centralAcceleration([1, 0], 1)[0], 0);
  assert.ok(centralAcceleration([1, 0], 1.4)[0] > 0);
  for (const kappa of [0, 0.5, 1, 1.4]) {
    const start = simulateCentral(kappa)[0];
    near(start.x, CENTRAL.initialPosition[0]);
    near(start.y, CENTRAL.initialPosition[1]);
    near(start.vy, CENTRAL.initialVelocity[1]);
  }
});

test('piecewise field crossing preserves position and velocity', () => {
  const crossing = -BOUNDARY.initialPosition[0] / BOUNDARY.initialVelocity[0];
  const before = boundaryStateAt(crossing - 1e-8);
  const after = boundaryStateAt(crossing + 1e-8);
  near(before.y, after.y, 1e-6);
  near(before.vy, after.vy, 1e-6);
  assert.equal(before.region, 'LEFT');
  assert.equal(after.region, 'RIGHT');
  assert.ok(before.ay < 0);
  assert.ok(after.ay > 0);
});

test('unsupported model inputs fail explicitly', () => {
  assert.throws(() => centralAcceleration([1, 0], Number.NaN), TypeError);
  assert.throws(() => boundaryStateAt(-1), RangeError);
  assert.throws(() => boundaryStateAt(0, {...BOUNDARY, g: Number.NaN}), TypeError);
});

test('decimal step ratios preserve one exact final sample', () => {
  const central = simulateCentral(1, {...CENTRAL, duration: 0.3, dt: 0.1});
  near(central.at(-1).t, 0.3);
  assert.equal(central.length, 4);
  const boundary = simulateBoundary({...BOUNDARY, duration: 0.3}, 0.1);
  near(boundary.at(-1).t, 0.3);
  assert.equal(boundary.length, 4);
});
