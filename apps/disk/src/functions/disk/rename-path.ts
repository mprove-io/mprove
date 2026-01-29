import fse from 'fs-extra';

export async function renamePath(item: { oldPath: string; newPath: string }) {
  await fse.rename(item.oldPath, item.newPath);
}
