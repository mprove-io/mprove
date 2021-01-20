import * as apiEnums from '../enums/_index';
import * as util from 'util';
import { ConfigService } from '@nestjs/config';

export function logToConsole(object: any, configService?: ConfigService) {
  let mproveLogIsColor =
    configService?.get('mproveLogIsColor') || apiEnums.BoolEnum.FALSE;

  if (mproveLogIsColor === apiEnums.BoolEnum.TRUE) {
    console.log(util.inspect(object, false, null, true));
  } else {
    console.log(JSON.stringify(util.inspect(object, false, null, false)));
  }
}
