import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

let cwd = import.meta.dirname;

console.log('Compiling blockml src...');
execSync('swc src -d dist-test --source-maps', { cwd: cwd, stdio: 'inherit' });
console.log('Compiling libs/common...');
execSync('swc ../../libs/common/src -d dist-test/libs/common --source-maps --config-file .swcrc', { cwd: cwd, stdio: 'inherit' });
console.log('Compiling libs/node-common...');
execSync('swc ../../libs/node-common/src -d dist-test/libs/node-common --source-maps --config-file .swcrc', { cwd: cwd, stdio: 'inherit' });

let pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'));

writeFileSync(
  new URL('./dist-test/package.json', import.meta.url),
  JSON.stringify({
    version: pkg.version,
    type: 'module',
    imports: {
      '#blockml/*': './src/*',
      '#common/*': './libs/common/src/*',
      '#node-common/*': './libs/node-common/src/*'
    }
  })
);
