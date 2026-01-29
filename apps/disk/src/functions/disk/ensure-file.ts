import fse from 'fs-extra';

// auto creates new folders in path
export async function ensureFile(filePath: string) {
  await fse.ensureFile(filePath);
}
