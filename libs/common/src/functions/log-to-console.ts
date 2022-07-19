import * as util from 'util';
import { enums } from '~common/barrels/enums';
import { enumToBoolean } from './enum-to-boolean';

export function logToConsole(object: any, logIsColor?: enums.BoolEnum) {
  let logIsColorDefined = logIsColor || enums.BoolEnum.TRUE;

  let isColor: boolean = enumToBoolean(logIsColorDefined);

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
