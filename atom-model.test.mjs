import test from 'node:test';
import assert from 'node:assert/strict';
import { binaryStep, STAGES, starStage } from './atom-model.js';

test('binary append is exact while transformation of the referenced nucleus remains unclaimed', () => {
  for (const z of [31, 32, 64]) {
    const result = binaryStep(z);
    assert.equal(result.afterBinary, `${result.beforeBinary}0`);
    assert.equal(result.afterZ, 2 * z);
    assert.equal(result.referencedNucleusChanged, false);
    assert.equal(result.operator, 'APPEND_ZERO_TO_BINARY_REPRESENTATION');
  }
  assert.deepEqual([binaryStep(32).beforeName, binaryStep(32).afterName], ['Germanium', 'Gadolinium']);
  assert.equal(binaryStep(64).afterName, 'Kein bestätigtes Element');
});

test('the bounded numeric domain rejects implicit element guesses and malformed values', () => {
  for (const value of [0, 1, 118, 128, -32, 32.5, '32', null, NaN]) {
    assert.throws(() => binaryStep(value), RangeError);
  }
});

test('the image claim is downstream from event, measurement, reconstruction and rendering', () => {
  assert.deepEqual(STAGES.map(stage => stage.kind), [
    'PHYSICAL_EVENT', 'MEASUREMENT', 'INFERENCE', 'RENDERING', 'SECONDARY_CLAIM',
  ]);
  assert.equal(starStage(0).id, 'collision');
  assert.equal(starStage(4).id, 'caption');
  assert.match(starStage(4).claim, /nicht zur primären Bildbeschreibung/);
  assert.throws(() => starStage(5), RangeError);
  assert.throws(() => starStage('0'), RangeError);
});
