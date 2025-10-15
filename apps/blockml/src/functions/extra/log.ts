import { ConfigService } from '@nestjs/config';
import * as fse from 'fs-extra';
import { BlockmlConfig } from '~blockml/config/blockml-config';
import { CallerEnum } from '~common/enums/special/caller.enum';
import { FuncEnum } from '~common/enums/special/func.enum';
import { LogTypeEnum } from '~common/enums/special/log-type.enum';

export function log(
  cs: ConfigService<BlockmlConfig>,
  caller: CallerEnum,
  func: FuncEnum,
  structId: string,
  logType: LogTypeEnum,
  content: any
) {
  let logIO = cs.get<BlockmlConfig['logIO']>('logIO');
  if (logIO === false) {
    return;
  }

  let logFunc = cs.get<BlockmlConfig['logFunc']>('logFunc');
  if (logFunc !== FuncEnum.ALL && logFunc !== func) {
    return;
  }

  let logsPath = cs.get<BlockmlConfig['logsPath']>('logsPath');

  let funcArray = func.toString().split('/');
  let f = funcArray[1];

  let str = JSON.stringify(content, null, 2);

  let logTypeString = logType.toString();

  let dir = `${logsPath}/${caller}/${f}/${structId}`;
  let path = `${dir}/${logTypeString}`;

  fse.ensureDirSync(dir);
  fse.writeFileSync(path, str);
}
