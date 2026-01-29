import fse from 'fs-extra';

export async function isPathExist(path: string): Promise<boolean> {
  let isExist = await fse.pathExists(path);

  return isExist;
}
