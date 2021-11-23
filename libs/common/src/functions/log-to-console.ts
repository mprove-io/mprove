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

  // let lg = util.inspect(object, false, null, isColor);

  if (isColor) {
    console.log(
      util.inspect(object, {
        showHidden: false,
        depth: null,
        colors: true,
        breakLength: Infinity,
        compact: false
      })
    );
  } else {
    console.log(
      JSON.stringify(
        util.inspect(object, {
          showHidden: false,
          depth: null,
          colors: false,
          breakLength: Infinity,
          compact: true
        })
      )
    );
  }
}
