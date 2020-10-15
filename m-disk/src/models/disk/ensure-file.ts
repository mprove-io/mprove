import * as fse from 'fs-extra';

// auto creates new folders in path
export async function ensureFile(fileAbsoluteId: string) {
  await fse.ensureFile(fileAbsoluteId);
}
