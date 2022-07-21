import * as fse from 'fs-extra';
import { exit } from 'process';
let deepEqual = require('deep-equal');

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
  // s.name = 'preparedName';
  // s.version = 'preparedVersion';

  let allowed = [
    // 'name',
    // 'version',
    // 'license',
    'dependencies',
    'devDependencies'
  ];

  Object.keys(s)
    .filter(key => !allowed.includes(key))
    .forEach(key => delete s[key]);

  if (t === null || !deepEqual(s, t)) {
    fse.writeFileSync(tPath, JSON.stringify(s, null, 2));
    console.log(`target file "${tPath}" updated!`);
  } else {
    console.log(`target file "${tPath}" not modified!`);
  }
}
