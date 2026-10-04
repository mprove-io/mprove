import { ConfigService } from '@nestjs/config';
import fse from 'fs-extra';
import { BlockmlConfig } from '#blockml/config/blockml-config';
import type { Caller } from '#common/types/blockml/diagnostics/caller';
import type { Func } from '#common/types/blockml/diagnostics/func';
import type { LogType } from '#common/types/blockml/diagnostics/log-type';

export function log(
  cs: ConfigService<BlockmlConfig>,
  caller: Caller,
  func: Func,
  structId: string,
  logType: LogType,
  content: any
) {
  let logIO = cs.get<BlockmlConfig['logIO']>('logIO');
  if (logIO === false) {
    return;
  }

  let logFunc = cs.get<BlockmlConfig['logFunc']>('logFunc');
  if (logFunc !== 'ALL' && logFunc !== func) {
    return;
  }

  let logsPath = cs.get<BlockmlConfig['logsPath']>('logsPath');

  let funcArray = func.toString().split('/');
  let f = funcArray[1];

  let str = JSON.stringify(
    content,
    (key, value) => (typeof value === 'bigint' ? Number(value) : value),
    2
  );

  let logTypeString = logType.toString();

  let dir = `${logsPath}/${caller}/${f}/${structId}`;
  let path = `${dir}/${logTypeString}`;

  fse.ensureDirSync(dir);
  fse.writeFileSync(path, str);
}
