import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import fse from 'fs-extra';

let __dirname = dirname(fileURLToPath(import.meta.url));

export const backendPackageJson = fse.readJsonSync(
  resolve(__dirname, '../package.json')
);
