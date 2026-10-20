import test from 'node:test';
import assert from 'node:assert/strict';
import {fourNeighbourPulse, pulseMetrics} from './zuse-lattice.mjs';

test('four-neighbour pulse conserves mass and has a direction-dependent frontier', () => {
  const result = pulseMetrics(4);
  assert.ok(Math.abs(result.mass - 1) < 1e-12);
  assert.equal(result.axisRadius, 4);
  assert.equal(result.diagonalRadius, Math.sqrt(8));
  assert.ok(result.axisRadius > result.diagonalRadius);
});

test('equal second moments do not erase the frontier difference', () => {
  const result = pulseMetrics(4);
  assert.ok(Math.abs(result.secondMomentX - result.secondMomentY) < 1e-12);
  assert.equal(result.secondMomentX, 2);
});

test('the declared grid rule and horizon reject invalid states', () => {
  assert.throws(() => fourNeighbourPulse(-1), RangeError);
  assert.throws(() => fourNeighbourPulse(2.5), RangeError);
  assert.throws(() => fourNeighbourPulse(65), RangeError);
});
