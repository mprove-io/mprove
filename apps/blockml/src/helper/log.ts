import { ConfigService } from '@nestjs/config';
import * as fse from 'fs-extra';
import { api } from '~blockml/barrels/api';
import { enums } from '~blockml/barrels/enums';
import { interfaces } from '~blockml/barrels/interfaces';

export function log(
  cs: ConfigService<interfaces.Config>,
  caller: enums.CallerEnum,
  func: enums.FuncEnum,
  structId: string,
  logType: enums.LogTypeEnum,
  content: any
) {
  let blockmlLogsPath = cs.get<interfaces.Config['blockmlLogsPath']>(
    'blockmlLogsPath'
  );
  let blockmlLogIO = cs.get<interfaces.Config['blockmlLogIO']>('blockmlLogIO');
  if (blockmlLogIO === api.BoolEnum.FALSE) {
    return;
  }

  let funcArray = func.toString().split('/');
  let f = funcArray[1];

  let str = JSON.stringify(content, null, 2);

  let logTypeString = logType.toString();

  let dir = `${blockmlLogsPath}/${caller}/${f}/${structId}`;
  let path = `${dir}/${logTypeString}`;

  fse.ensureDirSync(dir);
  fse.writeFileSync(path, str);
}
