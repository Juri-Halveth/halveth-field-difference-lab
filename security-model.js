// Copyright 2026 Juri Janovski. SPDX-License-Identifier: Apache-2.0
// Synthetic, local-only representation comparison. No network or target adapter.
export const SECURITY_MODEL_VERSION = 'synthetic-query-selection/0.1';

export function evaluateSyntheticQuery(raw, key) {
  if (typeof raw !== 'string' || typeof key !== 'string') throw new TypeError('raw and key must be strings');
  if (raw.length > 512 || key.length > 40 || key.length === 0) throw new RangeError('input outside local model limits');
  const entries = [...new URLSearchParams(raw).entries()];
  const values = entries.filter(([name]) => name === key).map(([, value]) => value);
  const first = values.length ? values[0] : null;
  const last = values.length ? values.at(-1) : null;
  const result = values.length === 0 ? 'UNKNOWN_MISSING_KEY' :
    first === last ? 'SAME_UNDER_DECLARED_RULES' : 'DIVERGENT_SELECTION';
  return Object.freeze({
    schema: SECURITY_MODEL_VERSION,
    source: {type: 'CALLER_SUPPLIED_SYNTHETIC_STRING', raw, key},
    left: {id: 'FIRST_VALUE_RULE', value: first},
    right: {id: 'LAST_VALUE_RULE', value: last},
    values,
    result,
    proofCeiling: 'LOCAL_RULE_DIFFERENCE_ONLY',
    target: 'UNBOUND',
    authorityEffect: 'NONE',
    protectedImpact: 'UNKNOWN',
  });
}
