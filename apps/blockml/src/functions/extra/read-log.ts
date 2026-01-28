import * as fse from 'fs-extra';
import { LogTypeEnum } from '#common/enums/special/log-type.enum';

export async function readLog(dir: string, log: LogTypeEnum) {
  let path = dir + '/' + log;
  let buffer = fse.readFileSync(path);
  let content = buffer.toString();

  return JSON.parse(content);
}
