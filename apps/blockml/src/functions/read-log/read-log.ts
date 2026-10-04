import fse from 'fs-extra';
import type { LogType } from '#common/types/blockml/diagnostics/log-type';

export async function readLog(dir: string, log: LogType) {
  let path = dir + '/' + log;
  let buffer = fse.readFileSync(path);
  let content = buffer.toString();

  return JSON.parse(content);
}
