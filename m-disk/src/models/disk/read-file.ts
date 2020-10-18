import * as fse from 'fs-extra';

export async function readFile(fileAbsoluteId: string) {
  let content = <string>await fse.readFile(fileAbsoluteId, 'utf8');
  return content;
}
