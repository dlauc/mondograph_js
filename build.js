import * as esbuild from 'esbuild';

const shared = {
  entryPoints: ['src/index.js'],
  bundle: true,
  sourcemap: true,
  target: ['es2020'],
};

await esbuild.build({ ...shared, format: 'esm',  outfile: 'dist/thinkgraph.esm.js' });
await esbuild.build({ ...shared, format: 'iife', globalName: 'ThinkGraphLib', outfile: 'dist/thinkgraph.umd.js' });

console.log('Build complete.');
