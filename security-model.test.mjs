import test from 'node:test';
import assert from 'node:assert/strict';
import {evaluateSyntheticQuery} from './security-model.js';

test('one synthetic input can diverge under two declared selection rules', () => {
  const result = evaluateSyntheticQuery('color=blue&color=red', 'color');
  assert.equal(result.left.value, 'blue');
  assert.equal(result.right.value, 'red');
  assert.equal(result.result, 'DIVERGENT_SELECTION');
  assert.equal(result.authorityEffect, 'NONE');
});

test('single and repeated equal values do not create a selection difference', () => {
  for (const input of ['color=blue', 'color=blue&color=blue']) {
    assert.equal(evaluateSyntheticQuery(input, 'color').result, 'SAME_UNDER_DECLARED_RULES');
  }
});

test('a missing key remains unknown rather than disagreement', () => {
  const result = evaluateSyntheticQuery('color=blue', 'shape');
  assert.equal(result.result, 'UNKNOWN_MISSING_KEY');
  assert.equal(result.left.value, null);
  assert.equal(result.right.value, null);
});

test('the local model rejects oversized input', () => {
  assert.throws(() => evaluateSyntheticQuery('a'.repeat(513), 'a'), RangeError);
  assert.throws(() => evaluateSyntheticQuery('color=blue', ''), RangeError);
});

test('both selection rules receive the same decoded browser-parser values', () => {
  const result = evaluateSyntheticQuery('c%6Flor=blue+sky&color=red%20sun', 'color');
  assert.deepEqual(result.values, ['blue sky', 'red sun']);
  assert.equal(result.result, 'DIVERGENT_SELECTION');
  assert.equal(result.proofCeiling, 'LOCAL_RULE_DIFFERENCE_ONLY');
});
