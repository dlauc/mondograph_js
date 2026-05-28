import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  resolveFlagUrl, configureFlagBase, preload, getFlag, clearFlagCache,
} from '../src/flagStore.js';

// Minimal <Image> stand-in: setting src schedules onload (or onerror for "fail").
class FakeImage {
  set src(v) {
    this._src = v;
    queueMicrotask(() => (v.includes('fail') ? this.onerror?.() : this.onload?.()));
  }
  get src() { return this._src; }
}

beforeEach(() => {
  clearFlagCache();
  configureFlagBase('/flags/');
  globalThis.Image = FakeImage;
});

test('resolveFlagUrl maps ISO-2 to a lowercase local svg path', () => {
  assert.equal(resolveFlagUrl('US'), '/flags/us.svg');
  assert.equal(resolveFlagUrl('Gb'), '/flags/gb.svg');
});

test('resolveFlagUrl passes through absolute URLs', () => {
  assert.equal(resolveFlagUrl('https://x/y.png'), 'https://x/y.png');
});

test('configureFlagBase changes the asset base (and normalises trailing slash)', () => {
  configureFlagBase('/assets/f');
  assert.equal(resolveFlagUrl('DE'), '/assets/f/de.svg');
});

test('getFlag returns null before load, an image after preload', async () => {
  assert.equal(getFlag('US'), null);          // miss → lazy load kicked off, still loading
  await preload(['US', 'us', 'GB']);          // dedupes US/us
  const f = getFlag('US');
  assert.ok(f, 'flag should be loaded');
  assert.ok(f.img instanceof FakeImage);
  assert.ok(f.alpha >= 0 && f.alpha <= 1);
  assert.ok(getFlag('GB'), 'GB should be loaded too');
});

test('failed loads stay null and do not throw', async () => {
  await preload(['failland']);
  assert.equal(getFlag('failland'), null);
});

test('preload resolves even with no Image (SSR/node without DOM)', async () => {
  delete globalThis.Image;
  clearFlagCache();
  await preload(['US']);                       // must not hang or throw
  assert.equal(getFlag('US'), null);
});
