import test from 'node:test';
import assert from 'node:assert/strict';
import {fourNeighbourPulse, lazyEightNeighbourPulse, pulseMetrics,
  lazyEightNeighbourMetrics} from './zuse-lattice.mjs';

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
  assert.throws(() => lazyEightNeighbourPulse(65), RangeError);
});

test('equal covariance does not identify the propagation rule', () => {
  const four = pulseMetrics(4);
  const eight = lazyEightNeighbourMetrics(4);
  for (const result of [four, eight]) {
    assert.ok(Math.abs(result.mass - 1) < 1e-12);
    assert.ok(Math.abs(result.secondMomentX - 2) < 1e-12);
    assert.ok(Math.abs(result.secondMomentY - 2) < 1e-12);
  }
  assert.equal(fourNeighbourPulse(4).has('4,4'), false);
  assert.ok(lazyEightNeighbourPulse(4).get('4,4') > 0);
  assert.ok(Math.abs(four.mixedFourthMoment - 3) < 1e-12);
  assert.ok(Math.abs(eight.mixedFourthMoment - 13 / 3) < 1e-12);
  assert.ok(four.diagonalRadius < eight.diagonalRadius);
});
