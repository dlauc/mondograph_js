import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hitRadius } from '../src/hittest.js';
import { visualRadius } from '../src/renderer.js';

function assertClose(actual, expected) {
  assert.ok(Math.abs(actual - expected) < 1e-5, `Expected ${actual} to be close to ${expected}`);
}

test('popularity scaling: visualRadius scales based on popularity', () => {
  const lowNode = { type: 'given', popularity: 0.0 };
  const midNode = { type: 'given', popularity: 0.5 };
  const highNode = { type: 'given', popularity: 1.0 };
  const defaultNode = { type: 'given' }; // popularity missing

  // Base radius for given/text (22)
  // Scale factor = (0.7 + 0.6 * popularity)
  // low: 22 * 0.7 = 15.4
  // mid: 22 * 1.0 = 22
  // high: 22 * 1.3 = 28.6
  
  assertClose(visualRadius(lowNode, false), 15.4);
  assertClose(visualRadius(midNode, false), 22);
  assertClose(visualRadius(highNode, false), 28.6);
  assertClose(visualRadius(defaultNode, false), 22); // defaults to 0.5
});

test('popularity scaling: hitRadius scales based on popularity', () => {
  const lowNode = { type: 'given', popularity: 0.0 };
  const midNode = { type: 'given', popularity: 0.5 };
  const highNode = { type: 'given', popularity: 1.0 };

  // Base hit radius for given (22)
  // Scale factor = (0.7 + 0.6 * popularity)
  // low: 22 * 0.7 = 15.4 -> clamped to MIN_HIT (20)
  // mid: 22 * 1.0 = 22
  // high: 22 * 1.3 = 28.6
  
  assertClose(hitRadius(lowNode, false, false), 20); // min clamped
  assertClose(hitRadius(midNode, false, false), 22);
  assertClose(hitRadius(highNode, false, false), 28.6);
});

test('popularity scaling: given vs surname shapes visual base radius', () => {
  const givenNode = { type: 'given', popularity: 0.5 };
  const surnameNode = { type: 'surname', popularity: 0.5 };
  const conceptNode = { type: 'concept', popularity: 0.5 };

  // given/surname default base = 22, scaled = 22
  // concept default base = 18, scaled = 18
  assertClose(visualRadius(givenNode, false), 22);
  assertClose(visualRadius(surnameNode, false), 22);
  assertClose(visualRadius(conceptNode, false), 18);
});
