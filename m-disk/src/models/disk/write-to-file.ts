import * as fse from 'fs-extra';

export async function writeToFile(item: {
  fileAbsoluteId: string;
  content: string;
}) {
  await fse.writeFile(item.fileAbsoluteId, item.content);
}
