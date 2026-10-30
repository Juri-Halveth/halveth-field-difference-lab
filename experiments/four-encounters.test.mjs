// Copyright 2026 Juri Janovski. SPDX-License-Identifier: Apache-2.0
import test from 'node:test';
import assert from 'node:assert/strict';
import {createEncounterSession, viewEncounterStep, START_SLOTS} from './four-encounters.js';
import {lazyEightNeighbourPulse} from './zuse-lattice.js';

function signatures(snapshot) {
  return snapshot.agents.map(({id, x, y, hue}) => `${id}:${x},${y}:${hue}`);
}

function routes(snapshot) {
  return snapshot.agents.map(({id, x, y}) => `${id}:${x},${y}`);
}

test('four independent starting slots and their colors are derived, not hidden in the wave', () => {
  const session = createEncounterSession();
  const start = viewEncounterStep(session, 0);
  assert.equal(start.agents.length, 4);
  assert.deepEqual(start.agents.map(({id, x, y}) => ({id, x, y})), START_SLOTS);
  assert.deepEqual(start.agents.map(agent => agent.instanceId),
    START_SLOTS.map(slot => `E1/${slot.id}`));
  assert.equal(new Set(start.agents.map(agent => agent.hue)).size, 4);
  assert.equal(start.agents.reduce((sum, agent) => sum + agent.charge, 0), 4);
});

test('a downward slider reversal opens exactly one new episode and keeps the field invariant', () => {
  const session = createEncounterSession();
  const first = viewEncounterStep(session, 8);
  const firstChoices = structuredClone(first.choices);
  const field = [...lazyEightNeighbourPulse(7)].sort();
  const second = viewEncounterStep(session, 7);
  assert.equal(second.episode, 2);
  assert.equal(session.episodes.length, 1);
  assert.equal(session.episodes[0].episode, 1);
  assert.deepEqual(session.episodes[0].snapshots[8].choices, firstChoices);
  assert.ok(second.agents.every(agent => agent.instanceId.startsWith('E2/')));
  assert.ok(session.episodes[0].snapshots[7].agents.every(agent =>
    agent.instanceId.startsWith('E1/')));
  assert.notDeepEqual(signatures(second), signatures(viewEncounterStep(createEncounterSession(), 7)));
  viewEncounterStep(session, 6);
  assert.equal(session.episode, 2);
  assert.deepEqual([...lazyEightNeighbourPulse(7)].sort(), field);
  assert.ok(first.agents.length >= 4);
});

test('same slider history is reproducible; learned experience changes a later route without randomness', () => {
  function run() {
    const session = createEncounterSession();
    const first = viewEncounterStep(session, 8);
    viewEncounterStep(session, 7);
    const second = viewEncounterStep(session, 8);
    return {first: signatures(first), second: signatures(second)};
  }
  assert.deepEqual(run(), run());
  const {first, second} = run();
  assert.notDeepEqual(first, second);

  const learned = createEncounterSession();
  viewEncounterStep(learned, 8);
  const learnedSecond = viewEncounterStep(learned, 7);
  const resetControl = createEncounterSession();
  viewEncounterStep(resetControl, 8);
  resetControl.learning = new Map();
  const resetSecond = viewEncounterStep(resetControl, 7);
  assert.deepEqual(routes(resetSecond), routes(viewEncounterStep(createEncounterSession(), 7)));
  assert.notDeepEqual(routes(learnedSecond), routes(resetSecond));
});

test('each original may create at most one child per episode; lineage and charge are conserved', () => {
  const session = createEncounterSession();
  let mixedCloneDecision = false;
  let eligibleButMoved = false;
  for (let step = 0; step <= 8; step++) {
    const snapshot = viewEncounterStep(session, step);
    const childCount = snapshot.agents.filter(agent => agent.parentId).length;
    if (childCount > 0 && childCount < START_SLOTS.length) mixedCloneDecision = true;
    assert.equal(snapshot.agents.reduce((sum, agent) => sum + agent.charge, 0), 4);
    assert.equal(new Set(snapshot.agents.map(agent => `${agent.x},${agent.y}`)).size,
      snapshot.agents.length);
    assert.equal(new Set(snapshot.agents.map(agent => agent.hue)).size,
      snapshot.agents.length);
    assert.ok(snapshot.agents.every(agent => Math.abs(agent.x) <= 8 && Math.abs(agent.y) <= 8));
    for (const original of START_SLOTS) {
      const children = snapshot.agents.filter(agent => agent.parentId === original.id);
      assert.ok(children.length <= 1);
      for (const child of children) {
        assert.equal(child.id, `${original.id}.2`);
        assert.equal(child.parentInstanceId, `E${snapshot.episode}/${original.id}`);
      }
    }
    for (const choice of snapshot.choices) {
      assert.ok(choice.candidates.length > 0);
      assert.equal(choice.score, Math.max(...choice.candidates.map(candidate => candidate.score)));
      assert.ok(choice.candidates.some(candidate => candidate.action === choice.action));
      if (choice.candidates.some(candidate => candidate.action.startsWith('CLONE_')) &&
          !choice.action.startsWith('CLONE_')) eligibleButMoved = true;
    }
  }
  assert.equal(mixedCloneDecision, true, 'one global clone clock must not drive all four');
  assert.equal(eligibleButMoved, true, 'eligible cloning must not outrank every move');
  assert.ok(viewEncounterStep(session, 8).agents.some(agent => agent.parentId));
  for (let repeat = 0; repeat < 20; repeat++) {
    viewEncounterStep(session, 7);
    const later = viewEncounterStep(session, 8);
    assert.equal(new Set(later.agents.map(agent => agent.hue)).size, later.agents.length);
  }
});

test('invalid horizons and sessions are rejected explicitly', () => {
  const session = createEncounterSession();
  for (const step of [-1, 1.5, 9, NaN]) {
    assert.throws(() => viewEncounterStep(session, step), RangeError);
  }
  assert.throws(() => viewEncounterStep({}, 1), TypeError);
});
