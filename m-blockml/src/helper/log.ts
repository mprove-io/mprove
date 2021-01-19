import { ConfigService } from '@nestjs/config';
import * as fse from 'fs-extra';
import { api } from '../barrels/api';
import { interfaces } from '../barrels/interfaces';
import { enums } from '../barrels/enums';

export function log(
  cs: ConfigService<interfaces.Config>,
  caller: enums.CallerEnum,
  func: enums.FuncEnum,
  structId: string,
  logType: enums.LogTypeEnum,
  content: any
) {
  let blockmlLogIO = cs.get<interfaces.Config['blockmlLogIO']>('blockmlLogIO');
  if (blockmlLogIO === api.BoolEnum.FALSE) {
    return;
  }
  let funcArray = func.toString().split('/');
  let f = funcArray[1];

  let str = JSON.stringify(content, null, 2);

  let logTypeString = logType.toString();

  let dir = `src/logs/${caller}/${f}/${structId}`;
  let path = `${dir}/${logTypeString}`;

  fse.ensureDirSync(dir);
  fse.writeFileSync(path, str);
}
