import fse from 'fs-extra';

export async function movePath(item: {
  sourcePath: string;
  destinationPath: string;
}) {
  await fse.move(item.sourcePath, item.destinationPath);
}
