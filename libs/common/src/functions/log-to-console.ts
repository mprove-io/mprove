import { ConfigService } from '@nestjs/config';
import * as util from 'util';
import { enums } from '~common/barrels/enums';
import { Config } from '~common/interfaces/_index';
import { enumToBoolean } from './enum-to-boolean';

export function logToConsole(object: any, cs?: ConfigService<Config>) {
  let mproveLogIsColor =
    cs?.get<Config['mproveLogIsColor']>('mproveLogIsColor') ||
    enums.BoolEnum.TRUE;

  let isColor: boolean = enumToBoolean(mproveLogIsColor);

  console.log(util.inspect(object, false, null, isColor));
}
