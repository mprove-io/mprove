import * as fse from 'fs-extra';

export async function writeToFile(item: { filePath: string; content: string }) {
  await fse.writeFile(item.filePath, item.content);
}
