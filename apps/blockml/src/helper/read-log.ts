import * as fse from 'fs-extra';
import { enums } from '~blockml/barrels/enums';

export async function readLog(dir: string, log: enums.LogTypeEnum) {
  let path = dir + '/' + log;
  let buffer = fse.readFileSync(path);
  let content = buffer.toString();

  return JSON.parse(content);
}
