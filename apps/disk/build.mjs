import * as esbuild from 'esbuild';
import { execSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '../..');
const isMinify = process.argv.includes('--minify');

// Compile libs with swc (using same config for decorator metadata)
console.log('Compiling libs with swc...');
execSync('swc ../../libs/common/src -d dist/libs/common --source-maps --config-file .swcrc', { cwd: __dirname, stdio: 'inherit' });
execSync('swc ../../libs/node-common/src -d dist/libs/node-common --source-maps --config-file .swcrc', { cwd: __dirname, stdio: 'inherit' });

// Define path aliases pointing to compiled output
const aliases = {
  '#disk': resolve(__dirname, 'dist/src'),
  '#common': resolve(__dirname, 'dist/libs/common/src'),
  '#node-common': resolve(__dirname, 'dist/libs/node-common/src'),
};

// Plugin to resolve path aliases
const aliasPlugin = {
  name: 'alias',
  setup(build) {
    Object.entries(aliases).forEach(([alias, target]) => {
      const filter = new RegExp(`^${alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(/.*)?$`);
      build.onResolve({ filter }, (args) => {
        let path = args.path.replace(alias, target);
        if (!path.endsWith('.js')) path += '.js';
        return { path };
      });
    });
  },
};

console.log('Bundling with esbuild...');
await esbuild.build({
  entryPoints: [resolve(__dirname, 'dist/src/main.js')],
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'esm',
  outfile: resolve(__dirname, 'dist/main.js'),
  sourcemap: !isMinify,
  minify: isMinify,
  packages: 'external',
  plugins: [aliasPlugin],
  logLevel: 'info',
});
