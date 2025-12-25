import * as fse from 'fs-extra';
import { exit } from 'process';
let deepEqual = require('fast-deep-equal');

let sourcePath = './package.json';
let targetPath = './package.docker.json';

if (!fse.pathExistsSync(sourcePath)) {
  console.log(`source file "${sourcePath}" is not exist!`);
  exit(1);
}
let sourceFile = fse.readFileSync(sourcePath);
let source = JSON.parse(sourceFile.toString());

if (!fse.pathExistsSync(targetPath)) {
  updateTarget(targetPath, source, null);
} else {
  let targetFile = fse.readFileSync(targetPath);
  let target = JSON.parse(targetFile.toString());
  updateTarget(targetPath, source, target);
}

function updateTarget(tPath: string, s: any, t: any) {
  let allowedTop = [
    'name',
    // 'version',
    'author',
    'license',
    'packageManager',
    'private',
    'sideEffects',
    'repository',
    // 'bin',
    'scripts',
    'dependencies',
    'devDependencies',
    // 'madge',
    // 'husky',
    // 'lint-staged',
    // '_moduleAliases',
    // 'pkg',
    'vaadin',
    'resolutions'
  ];

  Object.keys(s)
    .filter(key => !allowedTop.includes(key))
    .forEach(key => delete s[key]);

  let allowedScripts: string[] = [
    // 'postinstall'
  ];

  Object.keys(s.scripts)
    .filter(key => !allowedScripts.includes(key))
    .forEach(key => delete s.scripts[key]);

  if (t === null || !deepEqual(s, t)) {
    fse.writeFileSync(tPath, JSON.stringify(s, null, 2));
    console.log(`target file "${tPath}" updated!`);
  } else {
    console.log(`target file "${tPath}" not modified!`);
  }
}
