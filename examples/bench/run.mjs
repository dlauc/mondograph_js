// Headless benchmark runner (plan §8 performance gate).
//
//   npm i -D playwright            # dev only; the library has no runtime deps
//   node examples/bench/run.mjs [--profile phone|desktop|all] [--rate 4] [--query "maxDpr=2"]
//
// "phone" = Pixel 6a-class viewport (412×915 @ 2.625, touch) with CDP CPU
// throttling (rate 4 by default) as a proxy for a mid-range Android. It is a
// proxy, not the named device: headless Chromium rasterises canvas on the CPU.
// CHROMIUM_PATH=/path/to/chrome overrides the browser binary.
import { existsSync, readdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { serve } from '../serve.mjs';

const args = Object.fromEntries(process.argv.slice(2).reduce((acc, a, i, arr) => {
  if (a.startsWith('--')) acc.push([a.slice(2), arr[i + 1] && !arr[i + 1].startsWith('--') ? arr[i + 1] : true]);
  return acc;
}, []));
const rate = Number(args.rate ?? 4);
const profiles = args.profile === 'all' || !args.profile ? ['phone', 'desktop'] : [args.profile];
const query = args.query ? `&${args.query}` : '';

const { chromium } = await import('playwright');

function findChromium() {
  if (process.env.CHROMIUM_PATH) return process.env.CHROMIUM_PATH;
  const base = join(homedir(), '.cache', 'ms-playwright');
  if (!existsSync(base)) return undefined;
  const dirs = readdirSync(base).filter(d => /^chromium-\d+$/.test(d)).sort().reverse();
  for (const d of dirs) {
    const p = join(base, d, 'chrome-linux64', 'chrome');
    if (existsSync(p)) return p;
  }
  return undefined;
}

let browser;
try { browser = await chromium.launch(); }
catch { browser = await chromium.launch({ executablePath: findChromium() }); }

const server = await serve(0 || 8018);
const url = `http://127.0.0.1:8018/examples/bench/?manual${query}`;

const PROFILES = {
  phone:   { viewport: { width: 412, height: 915 }, deviceScaleFactor: 2.625, isMobile: true, hasTouch: true, throttle: rate },
  desktop: { viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1, isMobile: false, hasTouch: false, throttle: 1 },
};

const results = {};
for (const name of profiles) {
  const p = PROFILES[name];
  const ctx = await browser.newContext({ viewport: p.viewport, deviceScaleFactor: p.deviceScaleFactor, isMobile: p.isMobile, hasTouch: p.hasTouch });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => console.error('pageerror', e));
  await page.goto(url);
  await page.waitForFunction(() => typeof window.__bench === 'function');
  const cdp = await ctx.newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: p.throttle });
  const r = await page.evaluate(() => window.__bench());
  r.cpuThrottle = p.throttle;
  results[name] = r;
  await ctx.close();
}
await browser.close();
server.close();

for (const [name, r] of Object.entries(results)) {
  console.log(`\n== ${name} (CPU ×${r.cpuThrottle}, ${r.info.viewport}, canvas ${r.info.canvasPx}) ==`);
  console.log(`scene: ${r.info.nodes} nodes, ${r.info.edges} edges, ${r.info.groups} hulls, ${r.info.chips} chips, ${r.info.mirrorButtons} mirror buttons, shadows ${r.info.shadows ? 'on' : 'off'}`);
  console.log(`drag-pan: ${r.panning.fps} fps mean, p95 frame ${r.panning.frameInterval.p95} ms, draw ${r.panning.drawMs.mean} ms mean / ${r.panning.drawMs.p95} p95`);
  console.log(`hover sweep (chip/node/edge hit-test + overlay each frame): ${r.hover.fps} fps mean, p95 frame ${r.hover.frameInterval.p95} ms, draw ${r.hover.drawMs.mean} ms mean`);
  console.log(`  (layer rebuilds during pan+hover: ${r.layerBuilds})`);
  console.log(`re-centre animation (springs moving, full redraws with motion LOD): ${r.recentre.animation.fps} fps mean, p95 frame ${r.recentre.animation.frameInterval.p95} ms, draw ${r.recentre.animation.drawMs.mean} ms mean / ${r.recentre.animation.drawMs.p95} p95`);
  console.log(`static scene, full redraw every frame (layer cache off): ${r.fullRedraw.fps} fps mean, p95 frame ${r.fullRedraw.frameInterval.p95} ms, draw ${r.fullRedraw.drawMs.mean} ms mean / ${r.fullRedraw.drawMs.p95} p95`);
  console.log(`drag-pan at zoom 0.45: ${r.panLowZoom.fps} fps mean, p95 frame ${r.panLowZoom.frameInterval.p95} ms, draw ${r.panLowZoom.drawMs.mean} ms`);
  console.log(`recentre: sync ${r.recentre.syncMs.mean} ms mean / ${r.recentre.syncMs.max} max; to painted frame ${r.recentre.toPaintMs.mean} ms mean / ${r.recentre.toPaintMs.max} max`);
  console.log(`pick() hit-test: ${r.pickMs} ms per call`);
}
if (args.json) console.log(JSON.stringify(results, null, 2));
