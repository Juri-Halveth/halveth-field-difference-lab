// Copyright 2026 Juri Janovski. SPDX-License-Identifier: Apache-2.0
// A synthetic, stateful companion to the unchanged Zuse lattice comparison.
// The field is a fixed input for a given step; these agents are a separate model.
import {lazyEightNeighbourPulse} from './zuse-lattice.js';

export const ENCOUNTER_VERSION = 'FOUR_ENCOUNTERS_V1';
export const MAX_STEP = 8;
export const START_SLOTS = Object.freeze([
  {id: 'A', x: -2, y: -2}, {id: 'B', x: 2, y: -2},
  {id: 'C', x: -2, y: 2}, {id: 'D', x: 2, y: 2},
]);
const MOVES = Object.freeze([
  {id: 'N', dx: 0, dy: 1}, {id: 'NE', dx: 1, dy: 1},
  {id: 'E', dx: 1, dy: 0}, {id: 'SE', dx: 1, dy: -1},
  {id: 'S', dx: 0, dy: -1}, {id: 'SW', dx: -1, dy: -1},
  {id: 'W', dx: -1, dy: 0}, {id: 'NW', dx: -1, dy: 1},
]);
const HUES = Object.freeze(Array.from({length: 12}, (_, index) => index * 30));
const key = (x, y) => `${x},${y}`;
const inside = (x, y) => x >= -8 && x <= 8 && y >= -8 && y <= 8;

function hashId(id) {
  let hash = 0;
  for (const char of id) hash = (hash * 31 + char.codePointAt(0)) % 360;
  return hash;
}

function hueDistance(a, b) {
  const distance = Math.abs(a - b) % 360;
  return Math.min(distance, 360 - distance);
}

function selectHue(agent, others, learner) {
  const learned = learner?.totalReward ?? 0;
  const preference = (hashId(agent.id) * 5 + Math.round(learned * 53) +
    (agent.x + 8) * 11 + (agent.y + 8) * 7) % 360;
  const taken = others.map(other => other.hue);
  const available = HUES.filter(hue => !taken.includes(hue));
  return (available.length ? available : HUES).map(hue => ({hue, score:
    (taken.length ? Math.min(...taken.map(other => hueDistance(hue, other))) : 180) * 2 -
    hueDistance(hue, preference)}))
    .sort((a, b) => b.score - a.score || a.hue - b.hue)[0].hue;
}

function learnerFor(session, id) {
  if (!session.learning.has(id)) session.learning.set(id, {actions: new Map(), totalReward: 0});
  return session.learning.get(id);
}

function initialAgents(session) {
  const agents = [];
  for (const slot of START_SLOTS) {
    const agent = {...slot, instanceId: `E${session.episode}/${slot.id}`,
      parentId: null, parentInstanceId: null, charge: 1, hasCloned: false,
      visited: [key(slot.x, slot.y)]};
    agent.hue = selectHue(agent, agents, learnerFor(session, agent.id));
    agents.push(agent);
  }
  return agents;
}

function beginEpisode(session) {
  if (session.snapshots.length) {
    session.episodes.push({episode: session.snapshots[0].episode,
      snapshots: session.snapshots});
  }
  session.snapshots = [{episode: session.episode, step: 0,
    agents: initialAgents(session), choices: []}];
}

export function createEncounterSession() {
  const session = {version: ENCOUNTER_VERSION, episode: 1, viewedStep: 0,
    direction: 0, learning: new Map(), snapshots: [], episodes: []};
  beginEpisode(session);
  return session;
}

function fieldSignal(cells, maximum, x, y) {
  return maximum ? (cells.get(key(x, y)) ?? 0) / maximum : 0;
}

function candidateScore(session, agent, candidate, cells, maximum, occupied) {
  const learner = learnerFor(session, agent.id);
  const stat = learner.actions.get(candidate.action) ?? {count: 0, reward: 0};
  const destinationSignal = fieldSignal(cells, maximum, candidate.x, candidate.y);
  const sourceSignal = fieldSignal(cells, maximum, agent.x, agent.y);
  const newDestination = agent.visited.includes(key(candidate.x, candidate.y)) ? 0 : 1;
  const distances = [...occupied].map(address => {
    const [x, y] = address.split(',').map(Number);
    return Math.abs(candidate.x - x) + Math.abs(candidate.y - y);
  });
  const destinationSeparation = distances.length ? Math.min(1, Math.min(...distances) / 5) : 1;
  // Cloning evaluates two half-charge positions; moving evaluates one full-charge
  // position. A child covers another cell, but splitting has an opportunity cost.
  const isClone = candidate.kind === 'CLONE';
  const signal = isClone ? (sourceSignal + destinationSignal) / 2 : destinationSignal;
  const novelty = isClone ? newDestination / 2 : newDestination;
  const separation = isClone ? Math.min(destinationSeparation, 0.2) : destinationSeparation;
  const exploration = 1 / Math.sqrt(1 + stat.count);
  const remembered = stat.count ? stat.reward / stat.count : 0;
  const cloneCoverage = isClone ? 0.2 * destinationSeparation : 0;
  const splitCost = isClone ? 0.04 : 0;
  const score = 0.52 * signal + 0.18 * novelty + 0.08 * separation +
    0.24 * exploration + 0.12 * remembered + cloneCoverage - splitCost;
  return { ...candidate, score, signal, novelty, separation, exploration, remembered,
    cloneCoverage, splitCost };
}

function candidatesFor(session, agent, cells, maximum, occupied) {
  const candidates = [{action: 'STAY', kind: 'STAY', x: agent.x, y: agent.y}];
  // Distinct starting dispositions break the four-way geometric symmetry.
  // Experience can lower this threshold; no step number schedules a clone.
  const learner = learnerFor(session, agent.id);
  const cloneThreshold = 0.22 + (hashId(agent.id) % 4) * 0.12 -
    Math.min(0.1, learner.totalReward * 0.03);
  for (const move of MOVES) {
    const x = agent.x + move.dx;
    const y = agent.y + move.dy;
    if (!inside(x, y) || occupied.has(key(x, y))) continue;
    candidates.push({action: move.id, kind: 'MOVE', x, y});
    // A child is a fifth identity. The parent keeps half its tracked charge.
    if (!agent.parentId && !agent.hasCloned && agent.charge >= 1 &&
      fieldSignal(cells, maximum, agent.x, agent.y) >= cloneThreshold) {
      candidates.push({action: `CLONE_${move.id}`, kind: 'CLONE', x, y});
    }
  }
  return candidates.map(candidate => candidateScore(session, agent,
    candidate, cells, maximum, occupied));
}

function simulateNext(session) {
  const previous = session.snapshots.at(-1);
  const step = previous.step + 1;
  const cells = lazyEightNeighbourPulse(step);
  const maximum = Math.max(...cells.values());
  const agents = previous.agents.map(agent => ({...agent, visited: [...agent.visited]}));
  const occupied = new Set(agents.map(agent => key(agent.x, agent.y)));
  const choices = [];
  const order = [...agents].sort((a, b) => a.id.localeCompare(b.id));
  const shift = (step - 1) % order.length;
  const ordered = order.slice(shift).concat(order.slice(0, shift));
  const children = [];
  for (const agent of ordered) {
    occupied.delete(key(agent.x, agent.y));
    const candidates = candidatesFor(session, agent, cells, maximum, occupied);
    candidates.sort((a, b) => b.score - a.score || a.action.localeCompare(b.action));
    const selected = candidates[0];
    const from = key(agent.x, agent.y);
    if (selected.kind === 'MOVE') {
      agent.x = selected.x;
      agent.y = selected.y;
      if (!agent.visited.includes(key(agent.x, agent.y))) agent.visited.push(key(agent.x, agent.y));
    } else if (selected.kind === 'CLONE') {
      agent.hasCloned = true;
      agent.charge /= 2;
      const child = {id: `${agent.id}.2`, instanceId: `E${session.episode}/${agent.id}.2`,
        parentId: agent.id, parentInstanceId: agent.instanceId,
        x: selected.x, y: selected.y, charge: agent.charge,
        hasCloned: true, visited: [key(selected.x, selected.y)]};
      child.hue = selectHue(child, agents.concat(children), learnerFor(session, child.id));
      children.push(child);
      occupied.add(key(child.x, child.y));
    }
    occupied.add(key(agent.x, agent.y));
    const reward = selected.signal + 0.2 * selected.novelty +
      selected.cloneCoverage - selected.splitCost;
    const learner = learnerFor(session, agent.id);
    const stat = learner.actions.get(selected.action) ?? {count: 0, reward: 0};
    learner.actions.set(selected.action, {count: stat.count + 1, reward: stat.reward + reward});
    learner.totalReward += reward;
    choices.push({id: agent.id, instanceId: agent.instanceId, from, action: selected.action,
      to: key(selected.x, selected.y), score: selected.score, reward,
      candidates: candidates.map(({action, score}) => ({action, score}))});
  }
  session.snapshots.push({episode: session.episode, step,
    agents: agents.concat(children).sort((a, b) => a.id.localeCompare(b.id)), choices});
}

export function viewEncounterStep(session, step) {
  if (!session || session.version !== ENCOUNTER_VERSION) throw new TypeError('invalid session');
  if (!Number.isInteger(step) || step < 0 || step > MAX_STEP) {
    throw new RangeError('step must be an integer from 0 to 8');
  }
  if (step < session.viewedStep && session.direction !== -1) {
    session.episode += 1;
    beginEpisode(session);
  }
  if (step > session.viewedStep) session.direction = 1;
  else if (step < session.viewedStep) session.direction = -1;
  while (session.snapshots.length <= step) simulateNext(session);
  session.viewedStep = step;
  return session.snapshots[step];
}
