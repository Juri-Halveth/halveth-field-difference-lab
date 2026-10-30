// Copyright 2026 Juri Janovski. SPDX-License-Identifier: Apache-2.0
// Number representation and physical observations deliberately use separate types.

const PAIRS = Object.freeze({
  31: Object.freeze({ beforeName: 'Gallium', afterName: 'Samarium' }),
  32: Object.freeze({ beforeName: 'Germanium', afterName: 'Gadolinium' }),
  64: Object.freeze({ beforeName: 'Gadolinium', afterName: 'Kein bestätigtes Element' }),
});

export function binaryStep(z) {
  if (!Number.isInteger(z) || !Object.hasOwn(PAIRS, z)) {
    throw new RangeError('Dieses Labor bindet nur Z = 31, 32 oder 64.');
  }
  const pair = PAIRS[z];
  return Object.freeze({
    beforeZ: z,
    beforeBinary: z.toString(2),
    beforeName: pair.beforeName,
    afterZ: z * 2,
    afterBinary: (z * 2).toString(2),
    afterName: pair.afterName,
    operator: 'APPEND_ZERO_TO_BINARY_REPRESENTATION',
    referencedNucleusChanged: false,
  });
}

export const STAGES = Object.freeze([
  Object.freeze({
    id: 'collision', title: 'Goldionenkollision', date: 'Juni 2000',
    kind: 'PHYSICAL_EVENT',
    description: 'Am RHIC treffen beschleunigte Goldionen aufeinander. Das ist das untersuchte Ereignis, kein einzelnes ruhendes Atom.',
    claim: 'Brookhaven beschreibt den Versuchsaufbau und die ersten aufgezeichneten Ereignisse.',
  }),
  Object.freeze({
    id: 'signals', title: 'Detektorsignale', date: 'Juni 2000 · Messpfad',
    kind: 'MEASUREMENT',
    description: 'Die STAR-Detektoren registrieren Signale der aus der Kollision hervorgehenden Teilchen.',
    claim: 'Signale sind Messdaten; sie sind noch keine fertige Bilddarstellung.',
  }),
  Object.freeze({
    id: 'tracks', title: 'Spuren rekonstruiert', date: 'Juni 2000 · Auswertung',
    kind: 'INFERENCE',
    description: 'Software verbindet passende Detektorsignale zu rekonstruierten Teilchenspuren.',
    claim: 'Eine rekonstruierte Spur ist eine modellgestützte Deutung von Messsignalen.',
  }),
  Object.freeze({
    id: 'display', title: 'STAR-Endansicht', date: '13. Juni 2000 · BNL-Kontext',
    kind: 'RENDERING',
    description: 'Die Spuren werden in einer Ansicht entlang der Strahlachse dargestellt. Die dunkle Mitte gehört zur Anzeige- und Detektorgeometrie.',
    claim: 'Brookhaven beschriftet die Abbildung als Endansicht einer Goldionenkollision im STAR-Detektor.',
  }),
  Object.freeze({
    id: 'caption', title: 'Virale Bildunterschrift', date: '30. Oktober 2026 · Nutzer-Screenshot',
    kind: 'SECONDARY_CLAIM',
    description: 'Ein Social-Media-Post bezeichnet die Darstellung als besonders genaues Bild eines Atoms.',
    claim: 'Diese Bildunterschrift passt nicht zur primären Bildbeschreibung von Brookhaven.',
  }),
]);

export function starStage(index) {
  if (!Number.isInteger(index) || index < 0 || index >= STAGES.length) {
    throw new RangeError('Der Zeitindex liegt außerhalb des gebundenen Ereignispfads.');
  }
  return STAGES[index];
}
