import * as fse from 'fs-extra';

export async function readFile(filePath: string) {
  let content = <string>await fse.readFile(filePath, 'utf8');
  return content;
}
