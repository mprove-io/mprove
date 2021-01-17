import * as apiEnums from '../enums/_index';
import * as util from 'util';

export function logToConsole(object: any, logType?: apiEnums.LogTypeEnum) {
  let lType = logType || process.env.MPROVE_LOG_TYPE;

  if (lType === apiEnums.LogTypeEnum.DEV) {
    console.log(util.inspect(object, false, null, true));
  } else {
    console.log(JSON.stringify(util.inspect(object, false, null, false)));
  }
}
