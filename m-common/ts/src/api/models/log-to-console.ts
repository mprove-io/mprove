import * as apiEnums from '~/api/enums/_index';
import * as apiObjects from '~/api/objects/_index';
import * as util from 'util';
import { ConfigService } from '@nestjs/config';

export function logToConsole(
  object: any,
  cs?: ConfigService<apiObjects.Config>
) {
  let mproveLogIsColor =
    cs?.get<apiObjects.Config['mproveLogIsColor']>('mproveLogIsColor') ||
    apiEnums.BoolEnum.FALSE;

  if (mproveLogIsColor === apiEnums.BoolEnum.TRUE) {
    console.log(util.inspect(object, false, null, true));
  } else {
    console.log(JSON.stringify(util.inspect(object, false, null, false)));
  }
}
