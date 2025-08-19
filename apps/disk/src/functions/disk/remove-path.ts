import * as fse from 'fs-extra';

export async function removePath(path: string) {
  await fse.remove(path);
}
