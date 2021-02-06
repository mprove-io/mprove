import { ConfigService } from '@nestjs/config';
import * as util from 'util';
import { enums } from '~common/barrels/enums';
import { Config } from '~common/interfaces/_index';

export function logToConsole(object: any, cs?: ConfigService<Config>) {
  let mproveLogIsColor =
    cs?.get<Config['mproveLogIsColor']>('mproveLogIsColor') ||
    enums.BoolEnum.TRUE;

  if (mproveLogIsColor === enums.BoolEnum.TRUE) {
    console.log(util.inspect(object, false, null, true));
  } else {
    console.log(JSON.stringify(util.inspect(object, false, null, false)));
  }
}
