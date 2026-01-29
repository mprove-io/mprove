import fse from 'fs-extra';

export async function emptyDir(dir: string) {
  await fse.emptyDir(dir);
}
