import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolveTheme, langColor } from '../src/theme.js';

test('resolveTheme("mondonomo") returns full token object', () => {
  const t = resolveTheme('mondonomo');
  assert.equal(t.background, '#020f20');
  assert.equal(t.spring.K, 0.08);
  assert.ok(t.edgeTypes.derives_from);
  assert.ok(t.nodeTypes.text);
  assert.ok(t.nodeTypes.concept);
});

test('resolveTheme(null) returns mondonomo defaults', () => {
  const t = resolveTheme(null);
  assert.equal(t.background, '#020f20');
});

test('resolveTheme partial override deep-merges', () => {
  const t = resolveTheme({ background: '#fff', spring: { K: 0.5 } });
  assert.equal(t.background, '#fff');
  assert.equal(t.spring.K, 0.5);
  assert.equal(t.spring.damping, 0.78);
  assert.equal(t.centerGlow, '#02b9b9');
});

test('resolveTheme returns a fresh clone each call', () => {
  const a = resolveTheme('mondonomo');
  const b = resolveTheme('mondonomo');
  a.background = 'mutated';
  assert.equal(b.background, '#020f20');
});

test('langColor returns brand teal for English', () => {
  const t = resolveTheme('mondonomo');
  assert.equal(langColor(t, 'English'), '#38bdf8');
});

test('langColor returns fallback grey for unknown lang', () => {
  const t = resolveTheme('mondonomo');
  assert.equal(langColor(t, 'Klingon'), '#64748b');
});

test('edgeTypes._fallback exists for unknown edge type', () => {
  const t = resolveTheme('mondonomo');
  assert.ok(t.edgeTypes._fallback);
  assert.equal(t.edgeTypes._fallback.stroke, '#64748b');
});
