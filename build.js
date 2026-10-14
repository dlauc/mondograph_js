import * as esbuild from 'esbuild';
import { writeFileSync, rmSync, mkdirSync } from 'node:fs';

rmSync('dist', { recursive: true, force: true });
mkdirSync('dist');

const shared = {
  entryPoints: ['src/index.js'],
  bundle: true,
  sourcemap: true,
  target: ['es2020'],
  legalComments: 'none',
};

// ES module (bundlers, <script type="module">)
await esbuild.build({ ...shared, format: 'esm', outfile: 'dist/mondograph.esm.js' });

// UMD: CommonJS require(), AMD define(), or a browser global `MondoGraphLib`
// (also exposed as `ThinkGraphLib` for pages written against 0.1).
await esbuild.build({
  ...shared,
  format: 'iife',
  globalName: 'MondoGraphLib',
  outfile: 'dist/mondograph.umd.cjs',
  footer: {
    js: [
      "if (typeof module === 'object' && module.exports) { module.exports = MondoGraphLib; }",
      "else if (typeof define === 'function' && define.amd) { define([], function () { return MondoGraphLib; }); }",
      "if (typeof globalThis !== 'undefined') { globalThis.MondoGraphLib = MondoGraphLib; globalThis.ThinkGraphLib = MondoGraphLib; }",
    ].join('\n'),
  },
});

// 0.1 compatibility path (dist/thinkgraph.esm.js): re-export for one version.
writeFileSync('dist/thinkgraph.esm.js',
  "// Deprecated: the package is now `mondograph`. This path re-exports it for one version.\n" +
  "export * from './mondograph.esm.js';\nexport { default } from './mondograph.esm.js';\n");

console.log('Build complete.');
