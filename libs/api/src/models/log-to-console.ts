import { ConfigService } from '@nestjs/config';
import * as util from 'util';
import * as apiEnums from '~/enums/_index';
import * as apiObjects from '~/objects/_index';

export function logToConsole(
  object: any,
  cs?: ConfigService<apiObjects.Config>
) {
  let mproveLogIsColor =
    cs?.get<apiObjects.Config['mproveLogIsColor']>('mproveLogIsColor') ||
    apiEnums.BoolEnum.TRUE;

  if (mproveLogIsColor === apiEnums.BoolEnum.TRUE) {
    console.log(util.inspect(object, false, null, true));
  } else {
    console.log(JSON.stringify(util.inspect(object, false, null, false)));
  }
}
