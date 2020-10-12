import * as fse from 'fs-extra';

export async function copyPath(item: {
  sourcePath: string;
  destinationPath: string;
}) {
  await fse.copy(item.sourcePath, item.destinationPath);
}
