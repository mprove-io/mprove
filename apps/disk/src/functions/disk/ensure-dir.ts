import fse from 'fs-extra';

export async function ensureDir(dir: string) {
  await fse.ensureDir(dir);
}
