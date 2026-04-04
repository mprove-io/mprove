/**
 * Adds missing dependencies from libs/common and libs/node-common
 * to apps that compile these libs (backend, blockml, disk).
 *
 * Run: node scripts/dev/sync-lib-deps.mjs
 * Then: pnpm install
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

let rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

function readPkg(item) {
  let path = resolve(rootDir, item.rel, 'package.json');
  return JSON.parse(readFileSync(path, 'utf8'));
}

function writePkg(item) {
  let path = resolve(rootDir, item.rel, 'package.json');
  writeFileSync(path, JSON.stringify(item.pkg, null, 2) + '\n');
}

// Collect all deps from both libs (skip @mprove/* workspace deps)
let commonPkg = readPkg({ rel: 'libs/common' });
let nodeCommonPkg = readPkg({ rel: 'libs/node-common' });

let libDeps = new Set();
let allLibDeps = {
  ...commonPkg.dependencies,
  ...nodeCommonPkg.dependencies
};

Object.keys(allLibDeps).forEach(dep => {
  if (!dep.startsWith('@mprove/')) {
    libDeps.add(dep);
  }
});

// Apps that compile libs into dist-e2e
let apps = [
  { rel: 'apps/backend' },
  { rel: 'apps/blockml' },
  { rel: 'apps/disk' }
];

let totalAdded = 0;

apps.forEach(app => {
  let pkg = readPkg({ rel: app.rel });
  let deps = pkg.dependencies || {};
  let added = [];

  libDeps.forEach(dep => {
    if (!deps[dep]) {
      deps[dep] = 'catalog:';
      added.push(dep);
    }
  });

  if (added.length > 0) {
    // Sort dependencies alphabetically
    let sorted = {};
    Object.keys(deps).sort().forEach(key => {
      sorted[key] = deps[key];
    });
    pkg.dependencies = sorted;

    writePkg({ rel: app.rel, pkg: pkg });
    console.log(`${app.rel}: added ${added.length} deps: ${added.join(', ')}`);
    totalAdded += added.length;
  } else {
    console.log(`${app.rel}: all lib deps already present`);
  }
});

console.log(`\nTotal: ${totalAdded} deps added.`);

// Sort dependencies and devDependencies in all package.json files
let allPackages = [
  { rel: '.' },
  { rel: 'apps/backend' },
  { rel: 'apps/blockml' },
  { rel: 'apps/disk' },
  { rel: 'apps/front' },
  { rel: 'libs/common' },
  { rel: 'libs/node-common' },
  { rel: 'mcli' }
];

function sortObj(item) {
  let obj = item.obj;
  if (!obj) return obj;
  let sorted = {};
  Object.keys(obj).sort().forEach(key => {
    sorted[key] = obj[key];
  });
  return sorted;
}

let sortedCount = 0;

allPackages.forEach(p => {
  let pkg = readPkg({ rel: p.rel });
  let changed = false;

  let sortedDeps = sortObj({ obj: pkg.dependencies });
  if (sortedDeps && JSON.stringify(sortedDeps) !== JSON.stringify(pkg.dependencies)) {
    pkg.dependencies = sortedDeps;
    changed = true;
  }

  let sortedDevDeps = sortObj({ obj: pkg.devDependencies });
  if (sortedDevDeps && JSON.stringify(sortedDevDeps) !== JSON.stringify(pkg.devDependencies)) {
    pkg.devDependencies = sortedDevDeps;
    changed = true;
  }

  if (changed) {
    writePkg({ rel: p.rel, pkg: pkg });
    console.log(`${p.rel}: sorted deps`);
    sortedCount++;
  }
});

console.log(`\nSorted: ${sortedCount} package.json files.`);
console.log(`\nRun "pnpm inst" to resolve.`);
