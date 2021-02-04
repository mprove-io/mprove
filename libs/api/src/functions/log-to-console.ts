import { ConfigService } from '@nestjs/config';
import * as util from 'util';
import { enums } from '~api/barrels/enums';
import { interfaces } from '~api/barrels/interfaces';

export function logToConsole(
  object: any,
  cs?: ConfigService<interfaces.Config>
) {
  let mproveLogIsColor =
    cs?.get<interfaces.Config['mproveLogIsColor']>('mproveLogIsColor') ||
    enums.BoolEnum.TRUE;

  if (mproveLogIsColor === enums.BoolEnum.TRUE) {
    console.log(util.inspect(object, false, null, true));
  } else {
    console.log(JSON.stringify(util.inspect(object, false, null, false)));
  }
}
