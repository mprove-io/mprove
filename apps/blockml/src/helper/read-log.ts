import * as fse from 'fs-extra';
import { common } from '~blockml/barrels/common';

export async function readLog(dir: string, log: common.LogTypeEnum) {
  let path = dir + '/' + log;
  let buffer = fse.readFileSync(path);
  let content = buffer.toString();

  return JSON.parse(content);
}
