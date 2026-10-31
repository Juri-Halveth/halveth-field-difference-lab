// Copyright 2026 Juri Janovski. SPDX-License-Identifier: Apache-2.0
import test from 'node:test';
import assert from 'node:assert/strict';
import {cameraFor, project, VIEW_HALF_EXTENT} from './zuse-camera.js';
import {fourNeighbourPulse, pulseMetrics} from './zuse-lattice.js';
import {createEncounterSession, viewEncounterStep} from './four-encounters.js';

test('the diamond turns after touching the viewport and still fits at step 11', () => {
  const atEdge = cameraFor(8, 'four');
  const beyond = cameraFor(9, 'four');
  const later = cameraFor(11, 'four');
  assert.equal(atEdge.angle, 0);
  assert.ok(beyond.angle > 0 && beyond.angle < Math.PI / 4);
  assert.ok(later.angle > beyond.angle);
  assert.equal(later.scale, 1);
  for (const [x, y] of [[11, 0], [0, 11], [-11, 0], [0, -11]]) {
    const point = project(x, y, later);
    assert.ok(point.x >= 0 && point.x <= 544 && point.y >= 0 && point.y <= 544);
  }
});

test('after the rotation limit the camera expands its logical view without changing field', () => {
  const before = [...fourNeighbourPulse(16)];
  const metrics = pulseMetrics(16);
  const camera = cameraFor(16, 'four', [{x: 17, y: 2}]);
  assert.equal(camera.angle, Math.PI / 4);
  assert.ok(camera.scale < 1);
  assert.ok(camera.extent >= 16 / Math.sqrt(2));
  assert.deepEqual([...fourNeighbourPulse(16)], before);
  assert.equal(pulseMetrics(16).mass, metrics.mass);
  assert.equal(VIEW_HALF_EXTENT, 8);
});

test('comparison field remains unrotated and both cameras account for their content', () => {
  const camera = cameraFor(16, 'eight');
  assert.equal(camera.angle, 0);
  assert.ok(camera.scale > 0.5 && camera.scale < 0.52);
  const four = cameraFor(1, 'four', [{x: 9, y: 0}]);
  assert.ok(four.scale < 1);
  assert.throws(() => cameraFor(-1, 'four'), RangeError);
  assert.throws(() => cameraFor(1, 'other'), TypeError);
});

test('whole rotated field tiles and every body trail remain within the view', () => {
  const session = createEncounterSession();
  for (let step = 0; step <= 16; step++) {
    const snapshot = viewEncounterStep(session, step);
    const camera = cameraFor(step, 'four', snapshot.agents);
    const addresses = [...fourNeighbourPulse(step).keys()];
    for (const body of snapshot.agents) addresses.push(...body.visited);
    const halfTile = camera.scale * 544 / 17 *
      (Math.cos(camera.angle) + Math.sin(camera.angle)) / 2;
    for (const address of addresses) {
      const [x, y] = address.split(',').map(Number);
      const p = project(x, y, camera);
      assert.ok(p.x - halfTile >= -1e-7 && p.x + halfTile <= 544 + 1e-7,
        `x extent of ${address} at ${step}`);
      assert.ok(p.y - halfTile >= -1e-7 && p.y + halfTile <= 544 + 1e-7,
        `y extent of ${address} at ${step}`);
    }
  }
});
