import * as apiEnums from '../enums/_index';
import * as util from 'util';
import { ConfigService } from '@nestjs/config';

export function logToConsole(object: any, configService?: ConfigService) {
  let mproveLogType =
    configService?.get('mproveLogType') || apiEnums.LogTypeEnum.PROD;

  if (mproveLogType === apiEnums.LogTypeEnum.DEV) {
    console.log(util.inspect(object, false, null, true));
  } else {
    console.log(JSON.stringify(util.inspect(object, false, null, false)));
  }
}
