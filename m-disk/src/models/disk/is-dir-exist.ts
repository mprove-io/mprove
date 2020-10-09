import * as fse from 'fs-extra';

export async function isDirExist(dir: string): Promise<boolean> {
  let isExist = await fse.pathExists(dir);

  return isExist;
}
