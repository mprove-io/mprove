import { ConfigService } from '@nestjs/config';
import * as fse from 'fs-extra';
import { common } from '~blockml/barrels/common';
import { interfaces } from '~blockml/barrels/interfaces';

export function log(
  cs: ConfigService<interfaces.Config>,
  caller: common.CallerEnum,
  func: common.FuncEnum,
  structId: string,
  logType: common.LogTypeEnum,
  content: any
) {
  let logIO = cs.get<interfaces.Config['logIO']>('logIO');
  if (logIO === common.BoolEnum.FALSE) {
    return;
  }

  let logFunc = cs.get<interfaces.Config['logFunc']>('logFunc');
  if (logFunc !== common.FuncEnum.ALL && logFunc !== func) {
    return;
  }

  let logsPath = cs.get<interfaces.Config['logsPath']>('logsPath');

  let funcArray = func.toString().split('/');
  let f = funcArray[1];

  let str = JSON.stringify(content, null, 2);

  let logTypeString = logType.toString();

  let dir = `${logsPath}/${caller}/${f}/${structId}`;
  let path = `${dir}/${logTypeString}`;

  fse.ensureDirSync(dir);
  fse.writeFileSync(path, str);
}
